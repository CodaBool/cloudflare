import email from './util.js'

const MODULES = {
  2331647: "terminal",
  2413937: "maps-in-cyberspace",
}

async function generateKeys(env, package_name) {
  const data = {
    package_name,
    quantity: env.BATCH_SIZE, // 100 max
    dry_run: env.DRY_RUN,
  }
  const res = await fetch("https://api.foundryvtt.com/_api/packages/issue-key", {
    headers: {
      'Authorization': `APIKey:codabool_${env.FOUNDRY_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    method: "POST",
  })
  const body = await res.json()
  if (body.status !== "success" || body.keys.length !== env.BATCH_SIZE) {
    console.error("failed generating keys", body)
    return
  }
  return body.keys
}

export default async function itch(env, browser) {
  console.log("checking Itch")

  // get games
  const myGames = await fetch("https://itch.io/api/1/key/my-games", {
    headers: { 'Authorization': `Bearer ${env.ITCH_TOKEN}` }
  })
  const myGamesData = await myGames.json()
  const ids = new Map()
  if (myGamesData.errors) {
    console.error(myGamesData.errors[0])
    return
  }
  myGamesData.games.forEach(game => {
    console.log(`${game.title} purchased ${game.purchases_count} times with ${game.views_count} views`)
    ids.set(game.id, game)
  })

  let added = 0
  for (const [id, game] of ids) {
    if (game.min_price === 0) {
      // update DB
      if (env.LOCAL) {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/711eb5718fbac6ce40d9482751fdfc64/d1/database/64163431-5f3e-4f6d-90e4-4a07d177374f/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.CF_TOKEN}`
          },
          body: `{"params":[${game.views_count}, ${game.purchases_count}, "${MODULES[id]}"],"sql":"UPDATE sales SET views = ?, sold = ? WHERE module = ? AND platform = 'itch';"}`
        })
      } else {
        const { meta } = await env.D1.prepare(`UPDATE sales SET views = ?, sold = ? WHERE module = ? AND platform = 'itch'`).bind(game.views_count, game.purchases_count, MODULES[id]).run()
        console.log(`update D1 purchases table (${meta.rows_written}rows written )`)
      }
      console.log("skipping puppeteer action, it's a free module with no keys")
      continue
    }
    const page = await browser.newPage()
    await page.goto(`https://itch.io/game/external-keys/${id}`)

    // login
    await page.type('input[name="username"]', 'codabool')
    await page.type('input[name="password"]', env.ITCH_PASSWORD)
    const buttons = await page.$$('button')
    await buttons[1].click()
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    // keys
    await page.goto(`https://itch.io/game/external-keys/${id}`)

    // find current remaining keys
    const tbody = await page.$('tbody')
    const secondTd = await tbody.$$('td').then(tds => tds[1])
    let keys = await page.evaluate(el => el.textContent, secondTd)
    keys = Number(keys)

    const log = `${game.title} has ${keys}/${env.MINIMUM} keys`
    console.log(log)
    if (keys < env.MINIMUM && !env.DEBUG) {
      await email(log, `${log} adding ${env.BATCH_SIZE} now. Verify at https://itch.io/game/external-keys/${id}/other`, "Low Keys")
      console.log(`adding ${env.BATCH_SIZE} keys`)

      // fetch keys
      const generated = await generateKeys(env, MODULES[id])
      if (!generated) {
        console.error("failed to generate foundry keys for", game.title)
        return
      }

      // insert keys
      await page.select('select[name="keys[type]"]', 'other')

      const textarea = await page.$('textarea')
      let keyText = ""
      generated.forEach(text => {
        keyText += text + "\n"
      })
      await textarea.type(keyText)

      const btns = await page.$$('button')
      await btns[btns.length - 1].click()
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      keys += env.BATCH_SIZE
      added += env.BATCH_SIZE
    }

    if (keys < env.MINIMUM && env.DEBUG) {
      console.log("in debug mode skipping", env.BATCH_SIZE, "key insert")
      await email(log, `${log} skipping adding ${env.BATCH_SIZE} since DEBUG is on. If you want to add keys. Go to https://foundryvtt.com/creators/generate-keys (optimal generation is 17 keys/month) and enter the emailed keys at https://itch.io/game/external-keys/${id}/other`, "Low Keys")
    }

    // Close the browser
    await browser.close()

    // update DB
    if (env.LOCAL) {
      await fetch(
        `https://api.cloudflare.com/client/v4/accounts/711eb5718fbac6ce40d9482751fdfc64/d1/database/64163431-5f3e-4f6d-90e4-4a07d177374f/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.CF_TOKEN}`
        },
        body: `{"params":[${keys}, ${game.views_count}, ${game.purchases_count}, "${MODULES[id]}"],"sql":"UPDATE sales SET keys = ?, views = ?, sold = ? WHERE module = ? AND platform = 'itch';"}`
      })
    } else {
      const { meta } = await env.D1.prepare(`UPDATE sales SET keys = ?, views = ?, sold = ? WHERE module = ? AND platform = 'itch'`).bind(keys, game.views_count, game.purchases_count, MODULES[id]).run()
      console.log(`update D1 purchases table (${meta.rows_written}rows written )`)
    }

    console.log(`currently at ${keys} keys, verify at https://itch.io/game/external-keys/${id}/other for ${game.title}`)
  }

  console.log(`added ${added} keys today`)
  if (added) {
    await email(`generated ${added} keys`, `Verify at https://itch.io/dashboard`, "Low Keys")
  }
}
