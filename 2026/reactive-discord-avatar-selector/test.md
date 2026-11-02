# Test

A Worker (`worker/index.js`) with Discord OAuth and a D1 database. Pass when every check returns its expected status and the `wrangler dev` log shows no errors (no `Unhandled worker error`, no stack traces). The auth routes are expected to refuse an anonymous request: that `4xx` is the pass.

Secrets come from `.env` (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `SESSION_SECRET`).

1. Create the local D1 tables: `npm run d1:migrate:local`.
2. Start `npx wrangler dev --port 8787` in the background, logging to a file, and wait for `Ready on http://localhost:8787`.
3. Hit every route without a session:

   ```sh
   H=http://localhost:8787
   for p in / /css /login /callback /admin; do curl -s -o /dev/null -w "%{http_code} GET $p\n" "$H$p"; done
   for p in /select /logout /admin/remove /admin/reset; do curl -s -o /dev/null -w "%{http_code} POST $p\n" -X POST "$H$p"; done
   ```

   | Route | Expect |
   | --- | --- |
   | `GET /` | `200` |
   | `GET /css` | `200` |
   | `GET /login` | `302`, `Location` on `discord.com/oauth2/authorize` |
   | `GET /callback` | `400` (no OAuth state) |
   | `GET /admin` | `401` |
   | `POST /select` | `401` |
   | `POST /logout` | `302` or `303` |
   | `POST /admin/remove` | `401` |
   | `POST /admin/reset` | `401` |

4. Stop `wrangler dev`.
