import puppeteer from "puppeteer"
// import checkForge from './forge.js'
import checkItch from './itch.js'
// import checkR2 from './r2.js'

// Forge now has a captcha
// R2 graphql query is now broken
// just do itch key checking
const env = { ...process.env, LOCAL: true, DEBUG: true, BATCH_SIZE: 17, MINIMUM: 70, DRY_RUN: true }

// await checkR2(env)

// let browser = await puppeteer.launch({ headless: false })
// await checkForge({ ...process.env, LOCAL: true }, browser)
let browser = await puppeteer.launch({ headless: false })
await checkItch(env, browser)
