# Test

Two static pages built by Vite from markdown: `/` (from `full_text.md`) and `/iframe` (from `iframe_text.md`). Pass when the build succeeds, every check returns its expected status, the `wrangler dev` log shows no errors, and the browser console shows no errors.

1. Build: `npm run build`. Any error fails the test.
2. Start `npx wrangler dev --port 8787` in the background, logging to a file, and wait for `Ready on http://localhost:8787`.
3. Fetch both pages, every local asset they reference, and an unknown path:

   ```sh
   for p in / /iframe $(grep -ohE '(src|href)="[^"]+"' dist/index.html dist/iframe.html | cut -d'"' -f2 | grep -v '^http' | sort -u) /no-such-page; do
     p=${p#.}; p=${p#/}
     curl -s -o /dev/null -w "%{http_code} /$p\n" "http://localhost:8787/$p"
   done
   ```

   Expect `200` for each, except `/no-such-page`, which is `404` (`not_found_handling = "404-page"`).
4. Open `http://localhost:8787/` and `http://localhost:8787/iframe` with the `agent-browser` skill. Each renders the rendered markdown text (not raw markdown) and the console has no errors.
5. Stop `wrangler dev`.
