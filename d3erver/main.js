import { foundryClient, foundryServer } from './foundry.js'
import { forgeManifest, forgeDownload, forgeLatest } from './forge.js'
import { emailMe } from './other.js'

const routes = {
	"GET /": foundryClient,
	"POST /": foundryServer,
	"GET /forge": forgeDownload,
	"GET /latest": forgeLatest,
	"GET /manifest": forgeManifest,
	"POST /email": emailMe,
}


// for local testing
let ranInit = false
async function init(env) {
	// D1
	await env.D1.prepare("CREATE TABLE IF NOT EXISTS manifests (module TEXT, data TEXT)").run()
	await env.D1.prepare("INSERT INTO manifests (module, data) VALUES ('terminal', '{\"version\": \"1.0.0\"}')").run()

	// R2
	await env.R2.put("terminal-v1.0.0", new TextEncoder().encode("test"))
	ranInit = true
}

export default {
	async fetch(request, env) {
		if (!ranInit && env.TEST === "true") await init(env)
		const { pathname } = new URL(request.url)
		const handler = routes[`${request.method} ${pathname}`]
		if (!handler) return new Response("not found", { status: 404 })
		return handler(request, env)
	}
}
