import { DurableObject } from "cloudflare:workers"
import { Server, preflight } from "./socketio.js"
import { setup } from "./slap.js"

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return preflight(request)
    // the old nginx proxy served socket.io on /slap, so any path carrying the EIO query goes to the game
    if (!new URL(request.url).searchParams.has("EIO")) return new Response("slap socket server")
    return env.SLAP.getByName("global").fetch(request)
  },
}

// one global instance holds every socket, room and player, like the old single node process
export class Slap extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    this.io = new Server()
    setup(this.io)
  }

  fetch(request) {
    return this.io.handle(request)
  }
}
