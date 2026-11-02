# Test

A single static page in `site/`, no build step. Pass when every check returns its expected status, the `wrangler dev` log shows no errors, and the browser console shows no errors.

1. Start `npx wrangler dev --port 8787` in the background, logging to a file, and wait for `Ready on http://localhost:8787`.
2. Fetch the page and its favicon:

   ```sh
   for p in / /favicon-32x32.gif; do curl -s -o /dev/null -w "%{http_code} $p\n" "http://localhost:8787$p"; done
   ```

   Expect `200` for each.
3. Open `http://localhost:8787/` with the `agent-browser` skill. The page renders and the console has no errors.
4. Stop `wrangler dev`.
