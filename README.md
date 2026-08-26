# AI-Driven Software Configuration Management System

An academic research project: pull a real commit from GitHub (or enter
one manually), analyze its commit message, changed files, and code diff
with OpenAI, and get a change-type classification and an AI-assessed
risk level. See `PROJECT_MEMORY.md` for the full spec, decision log, and
current status.

## Live

- **App**: https://ai-scm-flame.vercel.app
- **API**: https://ai-scm-backend.onrender.com (docs at `/docs`)
- **Database**: MongoDB Atlas (`cluster0.rllp3bl.mongodb.net`)

The Render free-tier backend sleeps after inactivity — the first request
after a while can take ~30-50s to wake it up.

## Stack

- **Frontend**: React + Vite + TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: FastAPI + Pydantic
- **Database**: MongoDB (local Community Server for dev; MongoDB Atlas in production)
- **AI**: OpenAI API, behind an isolated service with a mock fallback
- **GitHub integration**: pulls real commit history and diffs via the GitHub REST API

## Prerequisites (local development)

- Node.js and npm
- Python 3.11+
- MongoDB running locally: `brew services start mongodb/brew/mongodb-community@7.0`
  (installed via `brew install mongodb-community@7.0` from the `mongodb/brew` tap)

## Running locally

**Backend:**
```bash
cd backend
./venv/bin/uvicorn app.main:app --reload --port 8001
```
Health check: `curl http://localhost:8001/api/health`
Interactive API docs: http://localhost:8001/docs

**Frontend:**
```bash
cd frontend
npm run dev
```
App: http://localhost:5174 (pinned in `vite.config.ts` — 5173 is used by
another project on this machine)

## Configuration

Copy `backend/.env.example` to `backend/.env` (already done for local dev)
and set:
- `MONGODB_URI` — local MongoDB by default; production points this at
  MongoDB Atlas instead (set directly in Render's environment variables,
  not committed to the repo).
- `OPENAI_API_KEY` / `USE_MOCK_AI` — set `USE_MOCK_AI=false` and a real
  key to use the OpenAI API; leave `USE_MOCK_AI=true` to use the free
  heuristic mock analyzer instead. The mock is never presented as a real
  model output — every result it produces is marked `is_mock: true`
  end-to-end, visible in the UI.
- `GITHUB_TOKEN` — optional. Public repos work unauthenticated (60 req/hr).

## Testing

```bash
cd backend
./venv/bin/python -m pytest        # unit tests + live integration tests
```

Integration tests (`tests/test_api_integration.py`) run against the real
FastAPI app and local MongoDB — the MongoDB service above must be
running. Every test uses a unique throwaway email and cleans up after
itself. AI-related tests force the mock analyzer via a fixture, so the
suite never makes a real (billed) OpenAI call.

## Demo

See `docs/DEMO_SCRIPT.md` for a ready-made academic-defense walkthrough.

## Documentation

- `docs/ARCHITECTURE.md` — system design and technology choices
- `docs/API.md` — endpoint reference
- `docs/DATABASE.md` — collections, fields, relationships
- `docs/COMPONENTS.md` — frontend component inventory
- `docs/PROJECT_MAP.md` — where everything lives
- `docs/DEMO_SCRIPT.md` — academic demonstration walkthrough
- `PROJECT_MEMORY.md` — project rules, roadmap, and current status (source of truth)
