# AI-Driven Software Configuration Management System

An academic research project: analyze software changes (commit message,
changed files, code diff) with an LLM, get a change-type classification
and an AI-assessed risk level, and evaluate predictions against expected
labels with accuracy/precision/recall/F1/confusion-matrix metrics. See
`PROJECT_MEMORY.md` for the full spec, decision log, and current status.

## Stack

- **Frontend**: React + Vite + TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: FastAPI + Pydantic
- **Database**: MongoDB (local Community Server for dev; MongoDB Atlas for production)
- **AI**: OpenAI API, behind an isolated service with a mock fallback

## Prerequisites

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
App: http://localhost:5173

## Configuration

Copy `backend/.env.example` to `backend/.env` (already done for local dev)
and set:
- `MONGODB_URI` — local MongoDB by default; swap to a MongoDB Atlas
  connection string for production, no code change needed.
- `OPENAI_API_KEY` / `USE_MOCK_AI` — set `USE_MOCK_AI=false` and a real
  key to use the OpenAI API; leave `USE_MOCK_AI=true` to use the free
  heuristic mock analyzer instead. The mock is never presented as a real
  model output — every result it produces is marked `is_mock: true`
  end-to-end, visible in the UI.

## Testing

```bash
cd backend
./venv/bin/python -m pytest        # unit tests + live integration tests
```

Integration tests (`tests/test_api_integration.py`) run against the real
FastAPI app and local MongoDB — the MongoDB service above must be
running. Every test uses a unique throwaway email and cleans up after
itself, so it's safe to run against a database that also holds demo
data. AI-related tests force the mock analyzer via a fixture, so the
suite never makes a real (billed) OpenAI call.

## Demo

See `docs/DEMO_SCRIPT.md` for a ready-made academic-defense walkthrough,
including a pre-seeded demo account (`demo.account@example.com` /
`demo12345`) with a real, non-fabricated 6-case evaluation already run
against the live OpenAI API.

## Documentation

- `docs/ARCHITECTURE.md` — system design and technology choices
- `docs/API.md` — endpoint reference
- `docs/DATABASE.md` — collections, fields, relationships
- `docs/COMPONENTS.md` — frontend component inventory
- `docs/PROJECT_MAP.md` — where everything lives
- `docs/DEMO_SCRIPT.md` — academic demonstration walkthrough
- `PROJECT_MEMORY.md` — project rules, roadmap, and current status (source of truth)
