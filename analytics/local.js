import puppeteer from "puppeteer"
import checkForge from './forge.js'

const browser = await puppeteer.launch({ headless: false })
// await checkForge({ ...process.env, LOCAL: true }, browser)


// await checkR2(env)
// await checkItch(env, browser)