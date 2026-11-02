# Test

A Vite + React single-page app served from `dist/` as static assets. Pass when the build succeeds, every check returns its expected status, the `wrangler dev` log shows no errors, and the browser console shows no errors.

1. Build: `npm run build`. Any error fails the test.
2. Start `npx wrangler dev --port 8787` in the background, logging to a file, and wait for `Ready on http://localhost:8787`.
3. Fetch `/`, every local asset `dist/index.html` references, and an unknown path:

   ```sh
   for p in / $(grep -oE '(src|href)="[^"]+"' dist/index.html | cut -d'"' -f2 | grep -v '^http') /no-such-page; do
     p=${p#.}; p=${p#/}
     curl -s -o /dev/null -w "%{http_code} /$p\n" "http://localhost:8787/$p"
   done
   ```

   Expect `200` for each. `/no-such-page` is `200` too: the SPA fallback serves `index.html`.
4. Open `http://localhost:8787/` with the `agent-browser` skill. The page renders content (not a blank root) and the console has no errors.
5. Stop `wrangler dev`.
