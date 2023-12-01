import puppeteer from "@cloudflare/puppeteer"
import email from './util.js'

export default async function forge(env) {
  const browser = await puppeteer.launch(env.BROWSER)
  const page = await browser.newPage()
  await page.goto("https://forge-vtt.com/account/login")
  await page.type('#__BVID__11', 'codabool')
  await page.type('#__BVID__13', env.FORGE_PASSWORD)
  await page.click('.btn-primary')
  await page.waitForNavigation({ waitUntil: 'networkidle0' })
  const cookies = await page.cookies()
  const response = await fetch('https://forge-vtt.com/api//profile/creator/purchases', {
    headers: {
      'Cookie': cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
    }
  })
  await browser.close()
  const data = await response.json()

  let newSales = 0
  for (const mod of data.purchases) {
    const sales = Math.floor(mod.share / 3.7425)
    const { sold } = await env.D1.prepare(`SELECT sold FROM sales WHERE platform = 'forge' AND module = ?`).bind(mod.name).first()
    if (sold !== sales) {
      const res = await env.D1.prepare("UPDATE sales SET sold = ? WHERE platform = 'forge' AND module = ?").bind(sales, mod.name).run()
      if (!res.success) {
        console.error(`failed to update sales for ${mod.name}`)
        await email("D1 sales error", `failed to update sales for ${mod.name}`, "ERROR")
        continue
      }
      newSales += (sales - sold)
    }
  }
  let msg = "no new sales"
  if (newSales) {
    msg = `${newSales} new Forge sales have been made!`
    await email(msg, msg, "Sold")
  } else {
    console.log(msg, `$${Math.floor(data.balance)} total Forge revenue`)
  }
}