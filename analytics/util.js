export default async function email(subject, value, name) {
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
