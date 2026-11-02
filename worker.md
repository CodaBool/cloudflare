# Discord slash command Worker

Build a Cloudflare Worker that handles Discord slash command interactions and forwards them to the owner's self-hosted **cmd service** through a Cloudflare Tunnel hostname. It replaces an AWS Lambda (`discord_slash`) that used SSH.

## Commands (register with Discord; names and options must match exactly)

- `minecraft_allowlist`, string option `username`: anyone can run it.
- `factorio_allowlist`, string option `input`: anyone can run it.
- `factorio_command`, string option `input`: admin only. Check `member.user.id` (or `user.id` in DMs) against the `ADMIN_USER_ID` var, never a display name.

## cmd service contract (shared with the home-server side; change both together)

`POST https://<CMD_HOST>/cmd` with headers `CF-Access-Client-Id`, `CF-Access-Client-Secret`, `X-Cmd-Secret` and body `{ "cmd": <command name>, "arg": <option value> }`. The reply is `{ "ok": bool, "output": string }`.

## Steps

1. Follow this repo's existing Worker layout, tooling, and Wrangler config conventions. Done when the new Worker builds and passes type-checking alongside the others.
2. `fetch` handler: verify the Ed25519 signature (`X-Signature-Ed25519`, `X-Signature-Timestamp`, raw body) with WebCrypto against `DISCORD_PUBLIC_KEY`, and return 401 on failure. Answer PING with `{ type: 1 }`.
3. For a command: reply immediately with a deferred response (`{ type: 5 }`), then in `ctx.waitUntil` call the cmd service and `PATCH https://discord.com/api/v10/webhooks/<application_id>/<token>/messages/@original` with `output`. Turn timeouts and non-200 replies into a readable error message, so the reply never stays stuck on "thinking…".
4. Add a register script that PUTs the three commands to the Discord application. Secrets: `DISCORD_PUBLIC_KEY`, `DISCORD_APP_ID`, `DISCORD_BOT_TOKEN`, `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`, `CMD_SECRET`; vars: `CMD_HOST`, `ADMIN_USER_ID`. Leave all values unset; the owner fills them in with `wrangler secret put`.
5. Verify: unit-test signature rejection, PING, the admin gate, and the deferred-then-PATCH flow with mocked `fetch`. Done when those tests pass. The owner then sets the app's Interactions Endpoint URL to the deployed Worker.
