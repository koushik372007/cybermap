# AGENTS.md — CRIMEPULSE (Base44 sandbox notes)

Non-obvious findings from bringing this repository up. Nothing here restates the
manifests.

## What this repository actually contains

The working tree on `main` is a **static deploy snapshot**: only `assets/`
(prebuilt `index-*.js` / `index-*.css`) and an `index.html` that loads them.
There is **no source and no `package.json`** in that shape, so a dev server can
only run after the source is restored from history.

The last commit that still had the source is `a34dd55` (parent of `c1c77b4`,
"commit"), which deleted `package.json`, `package-lock.json`, `src/main.jsx`,
`src/styles.css`, `README.md` and `dist/`. Those files were restored verbatim
from `git show c1c77b4^:<path>` so the app can run in live-reload dev mode.
`index.html` was rewritten as a proper dev entry pointing at `/src/main.jsx`.

`vite.config.js` did not exist in any commit even though `@vitejs/plugin-react`
was already a dependency; it was added so the React plugin (Fast Refresh) is
actually applied, and to pin the dev server to port 3000.

## The backend does not exist

`README.md` documents a FastAPI backend (`cd backend; python -m uvicorn
main:app --reload --port 8000`) with SQLite at `backend/crimepulse_demo.db`.
**No `backend/` directory exists in this repository, in any branch or in any
commit** (`git log --all --diff-filter=A --name-only` lists no backend file).
The only API the frontend calls is:

- `GET  http://localhost:8000/api/incidents` → expects `{ items: [...] }`
- `POST http://localhost:8000/api/incidents`

Both live in `src/main.jsx`. The app degrades gracefully: the GET is wrapped in
`.catch(() => {})` and the UI falls back to the synthetic in-browser dataset
(`const base = [...]`, 12 records, dated 2026-10-09).

Consequence for automated checks: the browser's `http://localhost:8000` is the
*viewer's* machine and is not the sandbox, and it is mixed content from the
HTTPS preview, so this request always fails in the preview. That is expected and
harmless — the demo dataset is what renders. Persistent case creation only
works if a backend is added here (and its URL made configurable instead of
hardcoded).

## Running it

```sh
docker compose -f docker-compose.base44.yml up -d --build
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/
```

- Single service `web` (`node:22`) running `npm ci && npm run dev`; the source is
  bind-mounted at `/app`, `node_modules` is a named volume.
- Served on host port 3000 (`vite.config.js` pins `port: 3000, strictPort`).
- Live source check: `curl -s http://localhost:3000/` must contain
  `/src/main.jsx`, and `/src/main.jsx` must return unhashed module source. If the
  `index.html` instead references `/assets/index-*.js`, the prebuilt bundle is
  being served and the edit loop is broken.

## Sandbox-specific notes

- The preview proxy forwards `Host: <port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN`
  to the dev server. Vite allows it via the platform-provided
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var (passed through in compose),
  so no host allowlist is hardcoded in `vite.config.js`. Nothing about this is
  gated on `BASE44_PREVIEW_MODE`.
- `CHOKIDAR_USEPOLLING=true` is set because bind-mounted file watching is
  unreliable in the sandbox.
- No secrets are needed: the app has no authenticated external service. The only
  network dependencies are public and unauthenticated — OpenStreetMap tiles
  (`tile.openstreetmap.org`) and Google Fonts (`fonts.googleapis.com`, imported
  at the top of `src/styles.css`). Both degrade gracefully offline.
- `./assets` is a leftover prebuilt bundle from the static-deploy commits; it is
  untouched and unused by the dev server.
