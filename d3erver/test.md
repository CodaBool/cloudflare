# Test

d3erver has a mocha suite in `test.js`; CI runs it before every deploy. Pass when `npm test` passes and the `wrangler dev` log shows no unexpected errors. The negative tests trigger `[ERROR]` log lines on purpose (`module test which does not exist`, `wrong secret`, `R2 object missing`); those are expected. Anything else, like a stack trace or an `Unhandled` error, fails the test.

1. Set `TEST=true` in `.dev.vars`. It seeds a fake module into D1 and R2 and turns `email()` and `increment()` into no-ops, so the run sends no real emails or download counts. Note the old value to restore in step 5.
2. Start `npx wrangler dev --port 8787` in the background, logging to a file, and wait for `Ready on http://localhost:8787`. The tests need this port.
3. Run `npm test`. Every test passes.
4. Stop `wrangler dev`.
5. Restore the old `TEST` value in `.dev.vars`.
