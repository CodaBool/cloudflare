import { AutoRouter } from 'itty-router'

const router = AutoRouter()

router.post('/', async (request, env) => {
  const url = new URL(request.url)
	const subject = url.searchParams.get("subject")
	const value = url.searchParams.get("body") // this will be the body of the email. You can include \n for new lines
	const email = url.searchParams.get("to")  // recipient email
	const name = url.searchParams.get("name")  // recipient name
	const from = url.searchParams.get("from")  // senders name
	const secret = url.searchParams.get("secret")  // used for auth

  if (secret !== env.SECRET) {
		return new Response('unauthorized', { status: 403 })
	} else if (!from || !name || !email || !value || !subject) {
		return new Response('missing query', { status: 400 })
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