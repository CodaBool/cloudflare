# Test

One route, `POST /`, that sends an email through MailChannels. A request that passes every check sends a real email, so test only the paths in front of the send. Pass when every check returns its expected status and the `wrangler dev` log shows no errors.

`SECRET` is in `.dev.vars`.

1. Start `npx wrangler dev --port 8787` in the background, logging to a file, and wait for `Ready on http://localhost:8787`.
2. Run the checks:

   ```sh
   H=http://localhost:8787
   SECRET=$(grep '^SECRET=' .dev.vars | cut -d= -f2-)
   curl -s -o /dev/null -w "%{http_code} GET /\n" "$H/"
   curl -s -o /dev/null -w "%{http_code} POST / bad secret\n" -X POST "$H/?secret=wrong"
   curl -s -o /dev/null -w "%{http_code} POST / missing query\n" -X POST "$H/?secret=$SECRET"
   ```

   | Check | Expect |
   | --- | --- |
   | `GET /` | `404` |
   | `POST /` with a wrong secret | `403` |
   | `POST /` with the secret, no `to`/`name`/`from` | `400` |

3. Stop `wrangler dev`.
