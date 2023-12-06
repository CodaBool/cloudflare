
// increment CloudFlare D1, SQLite for record keeping
export async function increment(env, platform, module) {
	if (env.TEST === "true") return
	try {
		let date = new Date()
		date = date.getFullYear() + "-" + (date.getMonth() + 1)
		
		const { meta } = await env.D1.prepare(`UPDATE downloads SET total = total + 1 WHERE year_month = '${date}' and platform = '${platform}' AND module = '${module}'`).run()

		if (!meta.changes) {
			await env.D1.prepare(`INSERT OR IGNORE INTO downloads (platform, module, total, year_month) VALUES ('${platform}', '${module}', 1, '${date}')`).run()
		}
	} catch(err) {
		console.error("D1", err)
		await email("increment error", JSON.stringify(err, null, 2), "ERROR", env)
	}
}

// email myself
export async function email(subject, value, name, env) {
	if (env.TEST === "true") return
	const mail = await fetch("https://api.mailchannels.net/tx/v1/send", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			personalizations: [{
				to: [{ email: "codabool@pm.me", name: "CodaBool" }],
			}],
			from: {email: "d3erver@codabool.com", name },
			content: [{ type: 'text/plain', value }],
			subject,
		})
	})
	
	const text = await mail.text()
	if (!mail.ok || mail.status > 299) {
		console.error(`Error sending email: ${mail.status} ${mail.statusText} ${text}`)
		return
	}
	console.log("email =", mail.statusText)
}
