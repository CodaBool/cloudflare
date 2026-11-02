# AGENTS.md

`slap-2021` is the multiplayer socket server for the Egyptian Rat Screw (slap) three.js game. It is a Cloudflare Worker plus one Durable Object. It replaces `slap.mjs`, a socket.io server that ran on an EC2 box behind nginx and pm2. The repo-level `AGENTS.md` also applies.

- Live: https://slap-2021.codabool.workers.dev, first deployed 2026-11-02 by hand with `npx wrangler deploy`.
- Front end: `../slap-frontend`, a Next.js app hosted on Vercel. It has its own `.git`. It reads the server URL from `NEXT_PUBLIC_SOCKET_DOMAIN` and connects with `io(url, { path: "/slap" })`.
- Original server: `../slap-frontend/slap.mjs`. When a game handler's behavior is in doubt, it is the reference.

## Files

- `src/index.js`: the Worker. `OPTIONS` gets a CORS preflight. A request with an `EIO` query param goes to the Durable Object `getByName("global")`, whatever its path is, so `/slap/` and `/socket.io/` both work. Any other request gets plain text.
- `src/socketio.js`: a hand-written Socket.IO server that speaks Engine.IO protocol 4 and Socket.IO protocol 5. It supports polling, websocket, the polling-to-websocket upgrade, rooms, broadcasts and acks on `/`. It has no binary packets and no other namespaces. It mimics the parts of the socket.io API that `slap.js` uses: `io.on("connection")`, `io.to(room).emit`, `io.in(room).fetchSockets()`, `io.sockets.adapter.rooms`, `socket.join/leave/broadcast.to(room).emit`.
- `src/slap.js`: the game handlers, ported from `slap.mjs` almost line for line.
- `test.js`: the `node --test` smoke test, using `socket.io-client`. `HOST` picks the target and defaults to `http://localhost:8787`.
- `test.html`: a one-page socket check for the browser, opened as `test.html?host=...`.

## `socketio.js` is shared

`../typer-backend/src/socketio.js` is the same file. After any change, copy it across and keep the two identical: `diff ../typer-backend/src/socketio.js src/socketio.js` should print nothing. Then run the tests in both folders. The comment at the top of the file calls the folders `slap/` and `typer/`. They are `slap-backend/` and `typer-backend/`.

When the protocol misbehaves, compare against https://socket.io/docs/v4/socket-io-protocol/ and https://github.com/socketio/engine.io-protocol. Two things that already bit:

- **Upgrade stall (fixed).** During the upgrade, socket.io-client keeps long-polling until the server releases it with a noop (`6`). The first port noop'd only a poll that was already pending, so a poll that arrived after the probe hung until the 25s ping. Symptom: `wrangler dev` logs `GET /slap/ 200 OK (24985ms)`, and the test fails with `timed out waiting for "upgrade"`. The fix is `engine.upgrading`, which answers every poll with `6` from `2probe` until `5`.
- **A hung poll is the first clue.** Any `GET /slap/ 200` in the dev log that takes about 25000ms means a poll waited for the ping instead of getting data or a noop.

## Game behavior that differs from `slap.mjs`

- `join` counts the room being joined, so seats come out as `order` 1, 2, 3… in join order. The original counted the socket's own id room, so every joiner got 2. The front end handles orders 1 to 4. Leavers' seats are not renumbered.
- The 5-player cap is skipped when `data.id` is set, and the front end always sets it (`pages/index.js`). So in practice there is still no cap, just as before.
- A `join` that arrives before `init` is logged and ignored. The original crashed.

## Design choices

- **One global Durable Object.** A player's room is only known after `join`, so every socket shares one instance, just as they shared the old single Node process. All state is in memory and is lost when the object restarts, as it was after the old daily pm2 restart.
- **Plain `ws.accept()`, no WebSocket Hibernation.** Hibernation would evict the in-memory rooms and players. The cost is Durable Object duration billing while any socket is open. Rework this only if the bill demands it.

## Verify a change

Run everything from this folder, with background processes logging to your scratchpad.

1. `npm install`. The first time, npm warns that the esbuild and workerd install scripts haven't been approved. Wrangler still runs.
2. `npx wrangler dev --port 8787`, then wait for `Ready on http://localhost:8787`. Port 8797 may already be in use by another session's typer dev server, so don't kill processes by a broad name pattern. Kill them by PID.
3. `npm test`. It covers the plain-text answer, the polling-to-websocket upgrade, a websocket-only client, `init`, `join` with seat orders, chat that never echoes to the sender, `update`/`reset`, and `leave` on disconnect. Fix the code, not the test, unless the test contradicts `slap.mjs`.
4. For changes that affect gameplay, also run the real front end. In `../slap-frontend`, run `npm install`, then `NEXT_PUBLIC_SOCKET_DOMAIN=http://localhost:8787 NEXT_PUBLIC_DECK_SIZE=52 npx next dev -p 3000`. Then use the `agent-browser` skill with two named sessions (for example `AGENT_BROWSER_SESSION=slapA` and `slapB`) so each player gets its own `localStorage`:
   - Each session: enter a name in the modal, click Save, then click Play.
   - A clicks "Create New Room". The URL becomes `/game?id=<CODE>`.
   - B fills the "6 Character Code" box with that code and clicks "Join with Code".
   - Both tabs list both names at the top right. The `wrangler dev` log shows `✈️ ... Order: 2`.
   - In A, press `Control` to open the panel. Fill "Enter Message" and click "Send". Then `agent-browser get text body` in B shows the message.
   - "Reset Game" in A logs `update {... state: "win"}` in B's console, which `agent-browser console` shows. Console output can lag a few seconds.
   - `agent-browser close` on B. The dev log shows `🚪 Name: bob`.
   - The game page is a WebGL canvas, so `snapshot -i` finds nothing until the `Control` panel is open. Use screenshots to see the 3D view.
5. Stop every process you started.

## Deploy

- `npx wrangler deploy` from this folder deploys by hand. The repo's `deploy.yml` also deploys changed worker folders on a push to `main`, so confirm with the owner before you push. Deploy while nobody is playing: each deploy restarts the Durable Object, which drops every socket and wipes in-memory games. socket.io-client reconnects on its own, but any game in progress is lost.
- The first deploy created the Durable Object through migration `v1`. Add a new migration tag for any class rename.
- After deploying, run `HOST=https://slap-2021.codabool.workers.dev npm test`.
- The front end goes live only when `NEXT_PUBLIC_SOCKET_DOMAIN` in Vercel is set to the worker URL and the front end is redeployed. That is the owner's step. The old EC2, Packer, Terraform, nginx and pm2 setup, and the front end's `deploy.yml` that pushes `slap.mjs` to the `sock` repo, are legacy. Leave them alone.
