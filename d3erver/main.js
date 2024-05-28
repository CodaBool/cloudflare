// import { Router } from 'itty-router'
import { AutoRouter, json } from 'itty-router'

import { foundryClient, foundryServer } from './foundry.js'
import { forgeManifest, forgeDownload, forgeLatest } from './forge.js'
import { emailMe } from './other.js'

const router = AutoRouter()

router.get("/", foundryClient)
	.post("/", foundryServer)
	.get("/forge", forgeDownload)
	.get("/latest", forgeLatest)
	.get("/manifest", forgeManifest)
	.post("/email", emailMe)


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
		return router.fetch(request, env)
	}
}
