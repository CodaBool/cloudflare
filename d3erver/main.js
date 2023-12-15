import { Router } from 'itty-router'
import { foundryClient, foundryServer } from './foundry.js'
import { forgeManifest, forgeDownload, forgeLatest } from './forge.js'

const router = Router()
router.get("/", foundryClient)
router.post("/", foundryServer)
router.get("/forge", forgeDownload)
router.get("/latest", forgeLatest)
router.get("/manifest", forgeManifest)
router.all('*', () => new Response('Not Found.', { status: 404 }))

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
		return router.handle(request, env)
	}
}
