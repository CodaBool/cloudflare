import { AutoRouter, json } from 'itty-router'

const router = AutoRouter()

router.post('/', async (request, env) => {
  const text = await request.text()
  if (!valid) {
    return new Response("unauthorized", { status: 403 })
  }
  const body = JSON.parse(text)

  if (body.type === InteractionType.PING) {
    return json({ type: InteractionResponseType?.PONG }, { status: 200 })
  }

  if (body.type !== InteractionType.APPLICATION_COMMAND) {
    return json({ error: 'rejecting non-command interaction' }, { status: 502 })
  }

  if (body.data.name === CMD.ADD_TO_ALLOWLIST_COMMAND.name) {
    
    const value = body.data.options.find(o => o.name === "username").value

    return json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `you provided ${value}` },
    }, { status: 200 })
  }

  return new Response("not found", { status: 404 })
})


export default { fetch: router.fetch }