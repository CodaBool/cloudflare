import puppeteer from "puppeteer"
import checkForge from './forge.js'
import checkItch from './itch.js'
import checkR2 from './r2.js'

const env = { ...process.env, LOCAL: true }

await checkR2(env)

let browser = await puppeteer.launch({ headless: false })
await checkForge({ ...process.env, LOCAL: true }, browser)
browser = await puppeteer.launch({ headless: false })
await checkItch(env, browser)