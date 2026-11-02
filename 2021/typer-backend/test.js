// Smoke test against a running worker: `npx wrangler dev --port 8787`, then `npm test`.
// Set HOST to test another deployment, e.g. HOST=https://typer-2021.codabool.workers.dev npm test
// Takes about 10s: the race countdown runs on real one-second ticks.
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { io } from "socket.io-client"

const HOST = process.env.HOST || "http://localhost:8787"
const clients = []

// path matches the old nginx location, websocket-only skips the polling handshake
function connect(opts = {}) {
  const socket = io(HOST, { path: "/typer", forceNew: true, reconnection: false, ...opts })
  clients.push(socket)
  return socket
}

function once(socket, event, ms = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out waiting for "${event}"`)), ms)
    socket.once(event, data => {
      clearTimeout(timer)
      resolve(data)
    })
  })
}

// resolves with the first "updateGame" that passes check
function update(socket, check, ms = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off("updateGame", listener)
      reject(new Error("timed out waiting for a matching updateGame"))
    }, ms)
    const listener = game => {
      if (!check(game)) return
      clearTimeout(timer)
      socket.off("updateGame", listener)
      resolve(game)
    }
    socket.on("updateGame", listener)
  })
}

const named = (game, name) => game.players.find(p => p.name === name)

after(() => clients.forEach(c => c.disconnect()))

test("plain request answers without socket.io", async () => {
  const res = await fetch(HOST)
  assert.equal(res.status, 200)
})

test("a full race", { timeout: 30000 }, async () => {
  const a = connect()
  const b = connect({ transports: ["websocket"] })
  const c = connect({ transports: ["websocket"] })
  await Promise.all([once(a, "connect"), once(b, "connect"), once(c, "connect")])

  // polling client upgrades to websocket
  if (a.io.engine.transport.name !== "websocket") await once(a.io.engine, "upgrade")
  assert.equal(a.io.engine.transport.name, "websocket")

  const created = once(a, "updateGame")
  a.emit("create-game", { name: "alice", cid: "c1" })
  let game = await created
  const gid = game._id
  assert.equal(typeof game.quote, "string")
  assert.equal(game.words, game.quote.split(" ").length)
  assert.equal(game.players.length, 1)
  assert.equal(game.players[0].isLeader, true)

  const missing = once(c, "error")
  c.emit("join-game", { gid: "NOPE", name: "carol", cid: "c3" })
  assert.match(await missing, /No game found/)

  const joinedA = update(a, g => g.players.length === 2)
  const joinedB = update(b, g => g.players.length === 2)
  b.emit("join-game", { gid, name: "bob", cid: "c2" })
  await Promise.all([joinedA, joinedB])

  const duplicate = once(c, "error")
  c.emit("join-game", { gid, name: "bob", cid: "c3" })
  assert.match(await duplicate, /already exists/)

  const chat = once(b, "get-message")
  a.emit("send-message", { text: "hi" })
  assert.deepEqual(await chat, { text: "hi" })

  const ready = update(a, g => g.players.every(p => p.isReady))
  a.emit("change-ready", { gid, cid: "c1", isReady: true })
  b.emit("change-ready", { gid, cid: "c2", isReady: true })
  await ready

  // only the leader can start
  const started = update(a, g => g.isStarted, 2000)
  b.emit("timer", { gid })
  await assert.rejects(started)

  const countdown = once(a, "timer")
  const race = once(b, "start-race", 10000)
  const typable = update(a, g => g.isTypable, 10000)
  a.emit("timer", { gid })
  assert.deepEqual(await countdown, { countDown: 5, msg: "Starting Game" })
  await race
  game = await typable
  assert.equal(game.isOpen, false)

  const half = update(b, g => named(g, "alice").percent === 50)
  a.emit("progress", { gid, percent: 50 })
  await half

  const finished = update(a, g => named(g, "alice").percent === 100)
  a.emit("progress", { gid, percent: 100 })
  game = await finished
  assert.equal(named(game, "alice").isWinner, true)
  assert.equal(named(game, "alice").wins, 1)
  assert.ok(named(game, "alice").wpm >= 0)

  const done = once(a, "done")
  b.emit("give-up", { gid })
  const result = await done
  assert.equal(result.winnerID, "c1")
  assert.equal(result.game.isStarted, false)
  assert.equal(result.game.isOpen, true)

  // a leaver drops out of the game and the lead passes on
  const left = update(b, g => g.players.length === 1)
  a.disconnect()
  game = await left
  assert.equal(game.players[0].name, "bob")
  assert.equal(game.players[0].isLeader, true)
})
