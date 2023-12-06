import puppeteer from "@cloudflare/puppeteer"
import checkItch from './itch.js'
import checkForge from './forge.js'
import checkR2 from './r2.js'

export default {
  async fetch(request, env) {
    const browser = await puppeteer.launch(env.BROWSER)
    const date = new Date()
    if (date.getHours() === 0 && date.getMinutes() < 15) {
      console.log("doing daily [R2 Usage, Itch Sales, Itch Keys]")
      await checkR2(env)
      await checkItch(env, browser)
    } else {
      console.log("doing frequent [forge sales]")
      await checkForge(env, browser)
    }
    return new Response('done')
  },
  async scheduled(event, env, ctx) {
    await env.worker.fetch(new Request('http://localhost'))
  }
}
