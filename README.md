# PLNR Web

Vite + React SPA for guest planning (landing + plan flow). Separate git repository — no shared packages with `app/` or `backend/`.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

### Env

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `http://localhost:8088/api/v1` |

Backend must allow CORS for `http://localhost:5173`.

## Scripts

```bash
npm run dev      # Vite dev server
npm test         # Vitest
npm run build    # Production build → dist/
```

## Layout

```
src/
  constants/   # plan types, flows, theme
  lib/         # API client, plan answers, helpers
  pages/       # route pages
  components/  # UI + plan flow widgets
```

Talks to the Laravel API over HTTP only.
