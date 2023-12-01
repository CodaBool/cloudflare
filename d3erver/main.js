import { Router } from 'itty-router'
import { foundryClient, foundryServer } from './foundry.js'
import { forgeManifest, forgeDownload } from './forge.js'

const router = Router()
router.get("/", foundryClient)
router.post("/", foundryServer)
router.get("/forge", forgeDownload)
router.get("/manifest", forgeManifest)
router.all('*', () => new Response('Not Found.', { status: 404 }))

export default {
	async fetch(request, env) {
		return router.handle(request, env)
	}
}
