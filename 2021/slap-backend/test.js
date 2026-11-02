// Smoke test against a running worker: `npx wrangler dev --port 8787`, then `npm test`.
// Set HOST to test another deployment, e.g. HOST=https://slap-2021.codabool.workers.dev npm test
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { io } from "socket.io-client"

const HOST = process.env.HOST || "http://localhost:8787"
const clients = []

// path matches the old nginx location, websocket-only skips the polling handshake
function connect(opts = {}) {
  const socket = io(HOST, { path: "/slap", forceNew: true, reconnection: false, ...opts })
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

function silent(socket, event, ms = 500) {
  return new Promise((resolve, reject) => {
    const fail = () => reject(new Error(`unexpected "${event}"`))
    socket.once(event, fail)
    setTimeout(() => {
      socket.off(event, fail)
      resolve()
    }, ms)
  })
}

after(() => clients.forEach(c => c.disconnect()))

test("plain request answers without socket.io", async () => {
  const res = await fetch(HOST)
  assert.equal(res.status, 200)
})

test("two players share a room", async () => {
  const a = connect()
  const b = connect({ transports: ["websocket"] })
  await Promise.all([once(a, "connect"), once(b, "connect")])

  // polling client upgrades to websocket
  if (a.io.engine.transport.name !== "websocket") await once(a.io.engine, "upgrade")
  assert.equal(a.io.engine.transport.name, "websocket")

  const initA = once(a, "init")
  a.emit("init", { name: "alice", uid: "u1" })
  const room = await initA
  assert.match(room, /^[A-Z0-9]{1,6}$/)

  const initB = once(b, "init")
  b.emit("init", { name: "bob", uid: "u2" })
  assert.notEqual(await initB, room)

  const joinA = once(a, "join")
  const joinB = once(b, "join")
  b.emit("join", { rkey: room })
  const [gamersA, gamersB] = await Promise.all([joinA, joinB])
  assert.deepEqual(gamersA.map(p => p.name).sort(), ["alice", "bob"])
  assert.deepEqual(gamersB, gamersA)
  // the host keeps seat 1 and the joiner takes the next one
  assert.deepEqual(Object.fromEntries(gamersA.map(p => [p.name, p.order])), { alice: 1, bob: 2 })

  // chat goes to everyone else in the room, never back to the sender
  const chat = once(b, "chat")
  const echo = silent(a, "chat")
  a.emit("chat", { msg: "hi" })
  assert.deepEqual(await chat, { msg: "hi" })
  await echo

  const resetA = once(a, "reset")
  const resetB = once(b, "reset")
  const update = once(b, "update")
  a.emit("update", { state: "win" })
  await Promise.all([resetA, resetB])
  assert.deepEqual(await update, { state: "win" })

  const leave = once(a, "leave")
  b.disconnect()
  assert.equal((await leave).name, "bob")
})
