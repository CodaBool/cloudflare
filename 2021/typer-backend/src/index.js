import { DurableObject } from "cloudflare:workers"
import { Server, preflight } from "./socketio.js"
import { setup } from "./typer.js"

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return preflight(request)
    // the old nginx proxy served socket.io on /typer, so any path carrying the EIO query goes to the game
    if (!new URL(request.url).searchParams.has("EIO")) return new Response("typer socket server")
    return env.TYPER.getByName("global").fetch(request)
  },
}

// one global instance holds every socket, game and timer, like the old single node process
export class Typer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    this.io = new Server()
    setup(this.io)
  }

  fetch(request) {
    return this.io.handle(request)
  }
}
