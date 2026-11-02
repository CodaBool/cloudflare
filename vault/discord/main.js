import { AutoRouter, json } from 'itty-router'
import { verifyKey, InteractionType, InteractionResponseType } from 'discord-interactions'
import { Client } from 'ssh2'
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

  if (body.type === InteractionType.PING) {
    return json({ type: InteractionResponseType?.PONG }, { status: 200 })
  }

  if (body.type !== InteractionType.APPLICATION_COMMAND) {
    return json({ error: 'rejecting non-command interaction' }, { status: 502 })
  }

  if (body.data.name === CMD.ADD_TO_ALLOWLIST_COMMAND.name) {
    
    const value = body.data.options.find(o => o.name === "username").value

    // likely needs to be wrapped in promise res rej, with an await
    const conn = new Client()
    conn.on('ready', () => {
      console.log('Client :: ready');
    }).connect({
      host: env.SERVER_IP,
      port: 22,
      username: 'REPLACE',
      password: env.SSH_PASSWORD
    })

    return json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `you provided ${value}` },
    }, { status: 200 })
  }

  return new Response("not found", { status: 404 })
})


export default { fetch: router.fetch }