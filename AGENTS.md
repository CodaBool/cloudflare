# AGENTS.md

Each top-level folder with a `wrangler.toml` is its own Cloudflare Worker, with its own `package.json` and lockfile. There is no root package and no workspace. Run `npm` and `wrangler` from inside the worker's folder. The code is plain ES modules with no build step, no TypeScript and no linter.

## Active vs. vault

- `readme.md` describes each active worker in one line.
- `vault/` holds deprecated projects. Read them for reference only: leave them unedited and don't import from them.

## Deploying

- On a push to `main`, `.github/workflows/deploy.yml` runs `wrangler deploy` for every active worker whose folder changed. `d3erver` has its own `d3erver.yml`, which runs the tests first. Commit to `main` only when you mean to ship.
- To push without deploying, put `[no ci]` in the commit message.

## Shared state

- `d3erver` uses the D1 database `foundry`; its schema is `d3erver/schema.sql`.
- Secrets are in each worker's `.dev.vars` locally (gitignored; `d3erver/example.dev.vars` lists the keys) and in the Cloudflare/GitHub secrets for deploys. The non-secret config is in the `[vars]` section of `wrangler.toml`.

## Testing d3erver

`npm test` runs mocha against a running `wrangler dev` on `:8787`. Set `TEST=true` in `.dev.vars` before running it. That setting seeds a fake module into D1 and R2 and turns `email()` and `increment()` into no-ops. Without it, a test run sends real emails and writes real download counts. The comment at the top of `test.js` says the opposite and is out of date. CI runs these tests before every deploy. The other workers have no tests.

## Code conventions

- Workers route by hand in their `fetch` handler. `d3erver` uses a `routes` table in `main.js` keyed by `"METHOD /path"`.
- Alerts go out by email through the MailChannels API (`x-api-key` header). For errors in `d3erver`, use the helpers in `util.js`: `email(subject, valueOrError, name, env)`, `errObj`, `getRequestInfo`.
- New `d3erver` handlers should log the way `forge.js` does: a per-request `requestId`, a `[route][requestId]` log prefix, and structured objects passed to `console.*`.
