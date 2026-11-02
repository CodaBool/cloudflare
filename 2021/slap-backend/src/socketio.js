// Minimal Socket.IO server for a Durable Object, so unchanged socket.io-client v4 front ends can connect.
// Speaks Engine.IO protocol 4 and Socket.IO protocol 5: polling, websocket, the polling -> websocket upgrade,
// rooms, broadcasts and acks on the "/" namespace. Binary attachments and other namespaces are not supported.
// slap/src/socketio.js and typer/src/socketio.js are the same file; change both together.

const PING_INTERVAL = 25000
const PING_TIMEOUT = 20000
const MAX_PAYLOAD = 1e6
const SEPARATOR = "\x1e"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

export function preflight(request) {
  return new Response(null, {
    status: 204,
    headers: { ...CORS, "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*" },
  })
}

function text(body, status = 200) {
  return new Response(body, {
    status,
    headers: { ...CORS, "Content-Type": "text/plain; charset=UTF-8", "Cache-Control": "no-store" },
  })
}

// https://github.com/socketio/engine.io-protocol#transports errors
const ERRORS = {
  0: "Transport unknown",
  1: "Session ID unknown",
  2: "Bad handshake method",
  3: "Bad request",
  5: "Unsupported protocol version",
}
function engineError(code) {
  return new Response(JSON.stringify({ code, message: ERRORS[code] }), {
    status: 400,
    headers: { ...CORS, "Content-Type": "application/json" },
  })
}

// same shape as the base64id package socket.io uses: 20 url-safe characters
function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(15))
  return btoa(String.fromCharCode(...bytes)).replace(/\//g, "_").replace(/\+/g, "-")
}

function encode(type, data, ackId) {
  return `${type}${ackId ?? ""}${data === undefined ? "" : JSON.stringify(data)}`
}

function decode(str) {
  const type = Number(str[0])
  if (type === 5 || type === 6) throw new Error("binary packets are not supported")
  let i = 1
  let nsp = "/"
  if (str[i] === "/") {
    const end = str.indexOf(",", i)
    nsp = end === -1 ? str.slice(i) : str.slice(i, end)
    i = end === -1 ? str.length : end + 1
  }
  let id = ""
  while (i < str.length && str[i] >= "0" && str[i] <= "9") id += str[i++]
  return {
    type,
    nsp,
    id: id === "" ? undefined : Number(id),
    data: i < str.length ? JSON.parse(str.slice(i)) : undefined,
  }
}

export class Server {
  constructor() {
    this.engines = new Map()
    this.rooms = new Map()
    this.handlers = []
    // mirrors io.sockets.sockets and io.sockets.adapter.rooms from socket.io
    this.sockets = { sockets: new Map(), adapter: { rooms: this.rooms } }
  }

  on(event, fn) {
    if (event === "connection") this.handlers.push(fn)
  }

  to(room) {
    return new Broadcast(this, [room])
  }

  in(room) {
    return this.to(room)
  }

  emit(event, ...args) {
    new Broadcast(this, []).emit(event, ...args)
  }

  async handle(request) {
    const params = new URL(request.url).searchParams
    if (params.get("EIO") !== "4") return engineError(5)
    const transport = params.get("transport")
    const sid = params.get("sid")

    if (transport === "websocket") {
      if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") return engineError(3)
      return this.handleWebSocket(sid)
    }
    if (transport !== "polling") return engineError(0)

    if (!sid) {
      if (request.method !== "GET") return engineError(2)
      const engine = this.open()
      return text("0" + engine.handshake(["websocket"]))
    }

    const engine = this.engines.get(sid)
    if (!engine || engine.transport !== "polling") return engineError(1)

    if (request.method === "GET") {
      // two long-polls at once is a broken client, socket.io closes the session for it too
      if (engine.poll) {
        engine.close("transport error")
        return engineError(3)
      }
      if (engine.buffer.length) return text(engine.drain())
      // mid-upgrade the client only polls to be released, a poll left hanging stalls the upgrade until the next ping
      if (engine.upgrading) return text("6")
      return text(await new Promise(resolve => (engine.poll = resolve)))
    }

    if (request.method === "POST") {
      const body = await request.text()
      if (body.length > MAX_PAYLOAD) {
        engine.close("transport error")
        return engineError(3)
      }
      for (const packet of body.split(SEPARATOR)) engine.onPacket(packet)
      return text("ok")
    }

    return engineError(2)
  }

  handleWebSocket(sid) {
    let engine
    if (sid) {
      engine = this.engines.get(sid)
      if (!engine) return engineError(1)
      if (engine.transport !== "polling" || engine.probing) return engineError(3)
      engine.probing = true
    }

    const { 0: client, 1: ws } = new WebSocketPair()
    ws.accept()

    if (!engine) {
      engine = this.open(ws)
      ws.send("0" + engine.handshake([]))
    }

    ws.addEventListener("message", ({ data }) => {
      if (typeof data !== "string") return
      if (engine.ws === ws) return engine.onPacket(data)
      // upgrade from polling: probe, then "5" switches the session over to this websocket
      if (data === "2probe") {
        ws.send("3probe")
        engine.upgrading = true
        engine.noop()
      } else if (data === "5") {
        engine.upgrade(ws)
      } else {
        engine.probing = engine.upgrading = false
        ws.close(1002, "bad upgrade")
      }
    })
    const onClose = () => {
      if (engine.ws === ws) engine.close("transport close")
      else engine.probing = engine.upgrading = false
    }
    ws.addEventListener("close", onClose)
    ws.addEventListener("error", onClose)

    return new Response(null, { status: 101, webSocket: client })
  }

  open(ws) {
    const engine = new Engine(this, randomId(), ws)
    this.engines.set(engine.sid, engine)
    engine.schedulePing()
    return engine
  }

  connect(engine) {
    const socket = new Socket(this, engine)
    this.sockets.sockets.set(socket.id, socket)
    socket.join(socket.id)
    engine.send("4" + encode(0, { sid: socket.id }))
    for (const fn of this.handlers) {
      try {
        fn(socket)
      } catch (err) {
        console.error("connection handler error", err)
      }
    }
    return socket
  }
}

class Engine {
  constructor(server, sid, ws) {
    this.server = server
    this.sid = sid
    this.ws = ws ?? null
    this.transport = ws ? "websocket" : "polling"
    this.buffer = []
    this.poll = null
    this.probing = false
    this.upgrading = false
    this.closed = false
    this.socket = null
  }

  handshake(upgrades) {
    return JSON.stringify({
      sid: this.sid,
      upgrades,
      pingInterval: PING_INTERVAL,
      pingTimeout: PING_TIMEOUT,
      maxPayload: MAX_PAYLOAD,
    })
  }

  send(packet) {
    if (this.closed) return
    if (this.transport === "websocket") {
      try {
        this.ws.send(packet)
      } catch {
        this.close("transport error")
      }
      return
    }
    this.buffer.push(packet)
    if (this.poll) this.respond(this.drain())
  }

  drain() {
    return this.buffer.splice(0).join(SEPARATOR)
  }

  respond(body) {
    const resolve = this.poll
    this.poll = null
    resolve(body)
  }

  // releases a pending long-poll so the client can finish the upgrade
  noop() {
    if (this.poll) this.respond("6")
  }

  upgrade(ws) {
    this.ws = ws
    this.transport = "websocket"
    this.probing = this.upgrading = false
    this.noop()
    for (const packet of this.buffer.splice(0)) ws.send(packet)
  }

  schedulePing() {
    clearTimeout(this.pingTimer)
    clearTimeout(this.pongTimer)
    this.pingTimer = setTimeout(() => {
      this.send("2")
      this.pongTimer = setTimeout(() => this.close("ping timeout"), PING_TIMEOUT)
    }, PING_INTERVAL)
  }

  onPacket(packet) {
    switch (packet[0]) {
      case "1":
        return this.close("transport close")
      case "3":
        return this.schedulePing()
      case "4":
        return this.onMessage(packet.slice(1))
    }
  }

  onMessage(message) {
    let packet
    try {
      packet = decode(message)
    } catch (err) {
      console.error("bad socket.io packet", err.message)
      return this.close("parse error")
    }
    if (packet.nsp !== "/") {
      if (packet.type === 0) this.send("4" + `4${packet.nsp},` + JSON.stringify({ message: "Invalid namespace" }))
      return
    }
    if (packet.type === 0) {
      if (!this.socket) this.socket = this.server.connect(this)
      return
    }
    this.socket?.onPacket(packet)
  }

  close(reason) {
    if (this.closed) return
    this.closed = true
    clearTimeout(this.pingTimer)
    clearTimeout(this.pongTimer)
    this.server.engines.delete(this.sid)
    if (this.poll) this.respond("1")
    if (this.ws) {
      try {
        this.ws.close(1000, reason)
      } catch {}
    }
    this.socket?.onClose(reason)
  }
}

class Socket {
  constructor(server, engine) {
    this.server = server
    this.engine = engine
    this.id = randomId()
    this.rooms = new Set()
    this.listeners = new Map()
    this.connected = true
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(fn)
  }

  emit(event, ...args) {
    this.engine.send("4" + encode(2, [event, ...args]))
  }

  join(room) {
    this.rooms.add(room)
    if (!this.server.rooms.has(room)) this.server.rooms.set(room, new Set())
    this.server.rooms.get(room).add(this.id)
  }

  leave(room) {
    this.rooms.delete(room)
    const members = this.server.rooms.get(room)
    if (!members) return
    members.delete(this.id)
    if (!members.size) this.server.rooms.delete(room)
  }

  to(room) {
    return new Broadcast(this.server, [room], this.id)
  }

  get broadcast() {
    return new Broadcast(this.server, [], this.id)
  }

  disconnect() {
    this.engine.send("4" + encode(1))
    this.onClose("server namespace disconnect")
  }

  onPacket({ type, id, data }) {
    if (type === 1) return this.onClose("client namespace disconnect")
    if (type !== 2 || !Array.isArray(data)) return
    const [event, ...args] = data
    if (id !== undefined) args.push((...res) => this.engine.send("4" + encode(3, res, id)))
    this.dispatch(event, args)
  }

  dispatch(event, args) {
    for (const fn of this.listeners.get(event) ?? []) {
      // handlers are often async, so catch both throws and rejections
      Promise.resolve()
        .then(() => fn(...args))
        .catch(err => console.error(`"${event}" handler error`, err))
    }
  }

  onClose(reason) {
    if (!this.connected) return
    this.connected = false
    for (const room of [...this.rooms]) this.leave(room)
    this.server.sockets.sockets.delete(this.id)
    this.dispatch("disconnect", [reason])
  }
}

class Broadcast {
  constructor(server, rooms, except) {
    this.server = server
    this.rooms = rooms
    this.except = except
  }

  to(room) {
    return new Broadcast(this.server, [...this.rooms, room], this.except)
  }

  targets() {
    const { sockets } = this.server.sockets
    const ids = this.rooms.length
      ? new Set(this.rooms.flatMap(room => [...(this.server.rooms.get(room) ?? [])]))
      : new Set(sockets.keys())
    ids.delete(this.except)
    return [...ids].map(id => sockets.get(id)).filter(Boolean)
  }

  emit(event, ...args) {
    const packet = "4" + encode(2, [event, ...args])
    for (const socket of this.targets()) socket.engine.send(packet)
  }

  async fetchSockets() {
    return this.targets()
  }
}
