import checkItch from './itch.js'
import checkForge from './forge.js'
import checkR2 from './r2.js'

export default {
  async fetch(event, env, ctx) {
    const date = new Date()
    if (date.getHours() === 0 && date.getMinutes() < 15) {
      console.log("doing daily [R2 Usage, Itch Sales, Itch Keys]")
      await checkR2(env)
      await checkItch(env)
    } else {
      console.log("doing frequent [forge sales]")
      await checkForge(env)
    }
    return new Response('done')
  },
  async scheduled(event, env, ctx) {
    // doesn't seem to be an easy way to await promise
    const promise = env.worker.fetch(new Request('http://127.0.0.1'))
    ctx.waitUntil(promise)
  }
}
