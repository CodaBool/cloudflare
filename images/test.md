# Test

Serves the images in `public/` with open CORS under `/img/`. Pass when every check returns its expected status and headers and the `wrangler dev` log shows no errors.

1. Start `npx wrangler dev --port 8787` in the background, logging to a file, and wait for `Ready on http://localhost:8787`.
2. Run the checks:

   ```sh
   H=http://localhost:8787
   curl -s -D - -o /dev/null "$H/img/dnd.webp"
   curl -s -o /dev/null -w "%{http_code} /img/mothership.webp\n" "$H/img/mothership.webp"
   curl -s -o /dev/null -w "%{http_code} /dnd.webp\n" "$H/dnd.webp"
   curl -s -o /dev/null -w "%{http_code} OPTIONS /img/dnd.webp\n" -X OPTIONS "$H/img/dnd.webp"
   ```

   | Check | Expect |
   | --- | --- |
   | `GET /img/dnd.webp` | `200`, `content-type: image/webp`, `access-control-allow-origin: *`, `x-worker: hit` |
   | `GET /img/mothership.webp` | `200` |
   | `GET /dnd.webp` | `200` (plain asset, no worker headers) |
   | `OPTIONS /img/dnd.webp` | `204` |

3. Stop `wrangler dev`.
