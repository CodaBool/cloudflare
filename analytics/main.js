import checkItch from './itch.js'
import checkForge from './forge.js'
import checkR2 from './r2.js'

export default {
  async scheduled(event, env, ctx) {
    const date = new Date()
    if (date.getHours() === 0 && date.getMinutes() < 15) {
      console.log("doing daily [R2 Usage, Itch Sales, Itch Keys]")
      await checkR2(env)
      await checkItch(env)
    } else {
      console.log("doing frequent [forge sales]")
      await checkForge(env)
    }
  }
}
