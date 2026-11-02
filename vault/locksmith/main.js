import puppeteer from "@cloudflare/puppeteer"

// at least do 17 a month to meet min payments
const BATCH_SIZE = 1 // max is 100
const MINIMUM = 50
const DRY_RUN = true

// itch ID to Foundry package name
const MODULES = {
  2331647: "terminal",
}

async function itch(env) {
  const res = await fetch("https://itch.io/api/1/key/my-games", {
    headers: {'Authorization': `Bearer ${env.ITCH_TOKEN}`}
  })
  const data = await res.json()
  const ids = new Map()
	if (data.errors) {
		console.error(data.errors[0])
		return []
	}
  data.games.forEach(game => {
    console.log(`${game.title}: purchased ${game.purchases_count} with ${game.views_count} views`)
    ids.set(game.id, game)
  })
  return ids
}

async function foundry(env, package_name) {
  const data = {
    package_name,
    quantity: BATCH_SIZE, // 100 max
    dry_run: DRY_RUN,
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
  if (body.status !== "success" || body.keys.length !== BATCH_SIZE) {
    console.error("failed generating keys", body)
    return
  }
  return body.keys
}

export default {
  async scheduled(event, env, ctx) {
		const ids = await itch(env)
		let added = 0
		for (const [id, game] of ids) {
			// console.log(`==== Puppeteer for ${game.title} ====`)
			const browser = await puppeteer.launch(env.BROWSER)
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
	
			console.log(`${game.title} has ${keys}/${MINIMUM-keys} keys`)
			if (keys < MINIMUM) {
				console.log(`adding ${BATCH_SIZE} keys`)
	
				// fetch keys
				const generated = await foundry(env, MODULES[id])
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
				await btns[btns.length -1].click()
				await page.waitForNavigation({ waitUntil: 'networkidle0' })
	
				keys += BATCH_SIZE
				added += BATCH_SIZE
			}
	
			// Close the browser
			await browser.close()
	
			// update DB
			const res = await env.D1.prepare(`UPDATE itch SET purchases = ${game.purchases_count}, keys = ${keys}, views = '${game.views_count}' WHERE module = '${MODULES[id]}'`).run()
			if (res.errors.length) {
				console.error(res.errors[0])
			} else {
				console.log("updated D1 purchases table (", res?.meta?.rows_written, "rows written )")
			}
		
			console.log(`${keys} keys available, verify at https://itch.io/game/external-keys/${id}/other for ${game.title}`)
		}

		return new Response(`added ${added} keys in total`)
	},
}