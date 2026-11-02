# AGENTS.md

`typer-2021` is the multiplayer socket server for the type racer game: a Cloudflare Worker plus one Durable Object, live at https://typer-2021.codabool.workers.dev. It replaced a pm2 + nginx + EC2 + MongoDB setup. The front end is in `2021/typer-frontend`, a separate git repo (`p08-type-racer`) that talks to this server through `socket.io-client`. This folder sits in the `cloudflare` workers repo under `2021/`, so the repo-level `AGENTS.md` applies too.

## How it works

- `src/index.js`: the Worker. It sends any request with an `EIO` query param to the single Durable Object `getByName("global")` and answers anything else with plain text. Any path is accepted, so clients can use the default `/socket.io/` (the front end does) or the old nginx `/typer`.
- `src/socketio.js`: a hand-written Socket.IO server (Engine.IO protocol 4, Socket.IO protocol 5). It supports polling, websocket, the polling-to-websocket upgrade, rooms, broadcasts and acks on `/`. It has no binary support and only the `/` namespace. `2021/slap-backend/src/socketio.js` is the same file, so make every fix in both copies. When the protocol misbehaves, compare against https://socket.io/docs/v4/socket-io-protocol/ and https://github.com/socketio/engine.io-protocol.
- `src/typer.js`: the game handlers. `src/data.js` holds the quotes.

Design decisions:

- **No database.** Games live in a `Map` in the Durable Object and expire 45 minutes after creation (`findGame` enforces it). Nothing outlives a game: the front end keeps a player's lifetime wins in `localStorage`. `updateGame` and `done` send the shape the front end expects: `_id` is the room code, each player has a 24-hex `_id`, and `createdAt` is an ISO string. Check the front end before you change this shape. The Durable Object has SQLite storage from the `v1` migration, but nothing uses it.
- **One global Durable Object.** A player moves into a game's room through `join-game`, so every socket has to share one instance. State is gone once every socket disconnects.
- **Plain `ws.accept()`, no WebSocket Hibernation.** Hibernation evicts the in-memory games and drops the `setInterval` race clocks. The cost is Durable Object duration billing while any socket is connected.
- **Game rules:**
  - Every race end goes through `finishRace`, which sends `done` with `{ winnerID, game }` to the whole game. That covers everyone finishing, the last player giving up, the 120s clock running out, and the last unfinished player leaving.
  - If nobody reaches 100%, the highest percent wins and gets `wins++`.
  - A player who disconnects is removed from their game and the rest get `updateGame`. If the leader leaves, the next player becomes leader. When the last player leaves, the game is deleted.
  - The countdown and race clock are tracked per game (`clocks`). Any reset stops them, and a second `timer` restarts the countdown instead of running two.
  - `create-game` refuses a room code that already exists. A request naming a missing game is ignored.

## Front end

`2021/typer-frontend` reads its server URL from `VITE_SOCKET_URL` (`constants/index.js`). Its `src/pages/online.jsx`, `Components/Lobby.jsx` and `Components/CountDown.jsx` already handle the `done` payload, leader handover (from `game.players[].isLeader`, matched by `cid`) and leavers dropping out of `updateGame`. Recheck them after you change the server's events or game shape.

To run it against a local worker: `VITE_SOCKET_URL=http://localhost:8787 npx vite` from that folder. Two tabs in one browser share the `localStorage` name, and the second join is rejected as a duplicate, so play a two-player race from two separate browser sessions (separate `agent-browser` sessions work).

## Test

Pass when `npm test` is green, the browser page shows a websocket connection with a quote, and the `wrangler dev` log shows no uncaught errors and no stack traces.

1. Run `npm install`.
2. Start `npx wrangler dev --port 8787` in the background, logging to a file, and wait for `Ready on http://localhost:8787`. If another worker (often `slap-backend`) holds 8787, use another port and pass `HOST=http://localhost:<port>` to `npm test`. Any edit under `src/` hot-reloads the server and wipes the Durable Object, which fails a test run in progress.
3. Run `npm test`. It takes about 10 seconds because the countdown ticks in real time. `test.js` covers the plain-text answer, the polling-to-websocket upgrade, `create-game`, the `join-game` errors (missing game, duplicate name), `send-message`, `change-ready`, the leader-only `timer`, the countdown, `start-race`, `progress`, the winner and wpm, `give-up` ending the race with `done`, and leader handover on disconnect. The clock-timeout ending takes 2 minutes and has no automated test, so check it by hand when you touch it.
4. In another background process, serve this folder: `python3 -m http.server 8788`. Use the `agent-browser` skill to open `http://localhost:8788/test.html?host=http://localhost:8787`. Done when the page shows status `connected`, transport `websocket`, a game code and a quote, and the browser console has no errors.
5. Stop every background process.

## Deploy

- The workers repo's `.github/workflows/deploy.yml` runs `wrangler deploy` for every changed folder with a `wrangler.toml` on a push to `main`, so pushing to `main` ships. Confirm with the owner first. `npm run deploy` deploys by hand. No secrets or vars are needed.
- Add a new migration tag in `wrangler.toml` for any Durable Object class rename.
- Each deploy restarts the Durable Object: every socket drops and every game is lost. socket.io-client reconnects by itself, but deploy while nobody is playing.
- After deploying, run `HOST=https://typer-2021.codabool.workers.dev npm test` against the live worker.
