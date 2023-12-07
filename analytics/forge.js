import email from './util.js'

export default async function forge(env, browser) {
  const page = await browser.newPage()
  await page.goto("https://forge-vtt.com/account/login")
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  const inputElements = await page.evaluate(() => {
    // Get all input elements on the page
    const inputs = document.getElementsByTagName('input');

    // Convert NodeList to Array and map to extract relevant information
    return Array.from(inputs).map(input => ({
      type: input.type,
      name: input.name,
      value: input.value
    }));
  })


  console.log('Input Elements:', inputElements)

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

  const MODULES = {
    "terminal": 0,
  }

  // add up totals for each module
  for (const p of data.purchases) {
    MODULES[p.name] = MODULES[p.name] + p.share
  }

  for (const [name, revenue] of Object.entries(MODULES)) {
    const sales = Math.floor(revenue / 3.7425)

    let sold
    if (env.LOCAL) {
      const raw = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/711eb5718fbac6ce40d9482751fdfc64/d1/database/64163431-5f3e-4f6d-90e4-4a07d177374f/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.CF_TOKEN}`},
        body: `{"params":["${name}"],"sql":"SELECT sold FROM sales WHERE platform = 'forge' AND module = ?;"}`
      })
      const res = await raw.json()
      sold = res?.result[0]?.results[0].sold
    } else {
      const res = await env.D1.prepare(`SELECT sold FROM sales WHERE platform = 'forge' AND module = ?`).bind(name).first()
      sold = res.sold
    }
    console.log("sales", sales, "sold", sold)
    if (sold !== sales) {


      if (env.LOCAL) {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/711eb5718fbac6ce40d9482751fdfc64/d1/database/64163431-5f3e-4f6d-90e4-4a07d177374f/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.CF_TOKEN}`},
          body: `{"params":[${sales}, "${name}"],"sql":"UPDATE sales SET sold = ? WHERE platform = 'forge' AND module = ?;"}`
        })
        newSales += (sales - sold)
      } else {
        const res = await env.D1.prepare("UPDATE sales SET sold = ? WHERE platform = 'forge' AND module = ?").bind(sales, name).run()
        if (!res.success) {
          console.error(`failed to update sales for ${name}`)
          await email("D1 sales error", `failed to update sales for ${name}`, "ERROR")
          continue
        }
        newSales += (sales - sold)
      }
    }
  }
  console.log("new sales", newSales)
  let msg = "no new sales"
  if (newSales && !env.LOCAL) {
    msg = `${newSales} new Forge sales have been made!`
    await email(msg, msg, "Sold")
  } else {
    console.log(msg, `$${Math.floor(data.balance)} total Forge revenue`)
  }
}