import { AutoRouter } from 'itty-router'

const router = AutoRouter()

router.post('/', async (request, env) => {
  const url = new URL(request.url)
	let subject = url.searchParams.get("subject")
	const email = url.searchParams.get("to")  // recipient email
	const name = url.searchParams.get("name")  // recipient name
	const from = url.searchParams.get("from")  // senders name
	const secret = url.searchParams.get("secret")  // used for auth
  const body = await request.json()
  let value = url.searchParams.get("body")

  if (secret !== env.SECRET) {
		return new Response('unauthorized', { status: 403 })
	} else if (!from || !name || !email) {
		return new Response('missing query', { status: 400 })
	}

  // self host uptime kuma
  if (body["monitor"]) {
    value = body["monitor"] + " is down"
    subject = body["monitor"] + " is down"
  }

  const mail = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
        personalizations: [{
            to: [{ email, name }],
        }],
        from: {
          email: `mail@codabool.com`,
          name: from,
        },
        content: [{ type: 'text/plain', value }],
        subject,
    })
  })

  const text = await mail.text()
  if (!mail.ok || mail.status > 399) {
    console.error(`Error sending email: ${mail.status} ${mail.statusText} ${text}`)
    return new Response("not found", { status: 404 })
  }

  return new Response("email sent", { status: 200 })
})

export default { fetch: router.fetch }