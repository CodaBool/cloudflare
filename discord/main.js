import { AutoRouter, json } from 'itty-router'
import { verifyKey, InteractionType, InteractionResponseType, InteractionResponseFlags } from 'discord-interactions'
import CMD from './commands.js'

const router = AutoRouter()

router.post('/', async (request, env) => {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp')
  const text = await request.text()
  const valid = verifyKey(text, signature, timestamp, env.PUBLIC_KEY)
  if (!valid) {
    return new Response("unauthorized", { status: 403 })
  }
  const body = JSON.parse(text)

  // DEBUG
  console.log("parsed", body)
  console.log("InteractionType", InteractionType)
  console.log("InteractionResponseType", InteractionResponseType)

  if (body.type === InteractionType.PING) {
    return json({ type: InteractionResponseType?.PONG }, { status: 200 })
  }

  if (body.type === InteractionType.APPLICATION_COMMAND) {
    console.log("this is a user command", body.data.name, "vs", CMD.ADD_TO_ALLOWLIST_COMMAND.name)
    switch (body.data.name) {
      case CMD.ADD_TO_ALLOWLIST_COMMAND.name: {
        return json({ 
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "content here" },
        }, { status: 200 })
      }
      default: return json({ error: 'Unknown Type' }, { status: 400 })
    }
  }

  return new Response("ok", { status: 200 })
})


export default { fetch: router.fetch }