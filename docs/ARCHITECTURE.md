# Architecture

## System overview

```text
Frontend (React + Vite + TS)
        |  fetch, JSON, Bearer JWT
        v
Backend (FastAPI)
        |
        +--> Database (MongoDB, via Motor async driver)
        |
        +--> AI Service (isolated module)
                |
                +--> Mock analyzer (heuristic, default)
                +--> OpenAI API (real LLM, requires OPENAI_API_KEY)
```

## Why each technology

- **React + Vite + TypeScript** — per PROJECT_MEMORY.md's Free-First Tech
  Policy, and to reuse the exact frontend stack, component library, and
  design tokens from the `IDRIS` project as instructed at the start of
  this session.
- **Tailwind CSS v4 + shadcn/ui (`@base-ui/react` primitives)** — carried
  over from IDRIS so both projects share one visual language (Geist font,
  neutral OKLCH grayscale tokens, light/dark mode).
- **FastAPI + Pydantic** — per PROJECT_MEMORY.md's backend policy. Kept
  even though IDRIS's backend is Node/Express, because EMMA's own spec
  explicitly calls for a Python backend and the instruction to reuse
  IDRIS was scoped to "interface and UI," not the server stack.
- **MongoDB (via Motor, the async driver)** — see the Architectural
  Decision Log in `PROJECT_MEMORY.md` Section 34 for how the SQLite vs.
  MongoDB Atlas conflict in the original spec was resolved.
- **JWT (`python-jose`) + `bcrypt`** — stateless auth suited to a small
  academic app; no session store needed. `bcrypt` is used directly
  (not via `passlib`) because `passlib` 1.7.4 is incompatible with
  `bcrypt` 5.x (see Decision Log).
- **OpenAI Python SDK** — the project's designated LLM provider. Isolated
  behind `app/services/ai_service.py` so the rest of the app never talks
  to OpenAI directly, and a mock analyzer stands in until a real API key
  is configured.

## GitHub integration (added 2026-08-25)

`app/services/github_service.py` isolates the GitHub REST API the same
way `ai_service.py` isolates OpenAI — nothing else calls GitHub
directly. It's additive, not a parallel system: a commit imported from
GitHub becomes an ordinary `software_changes` document (`commit_id`
holds the SHA), so the existing analysis pipeline needs zero changes to
work on it. Public repos work unauthenticated; set
`GITHUB_TOKEN` for higher rate limits or private repos.

## Request flow: analyzing a change

```text
POST /api/changes/{id}/analyze
  -> analyses.py route (auth check, ownership check)
  -> ai_service.analyze_change()
       -> USE_MOCK_AI=true or no key  => heuristic mock analyzer
       -> otherwise                   => OpenAI chat completion
  -> result persisted to analysis_results collection (is_mock flag stored)
  -> returned to frontend, rendered with ChangeTypeBadge + RiskBadge
```

## Environments

- **Local development**: MongoDB Community Server running locally via
  Homebrew (`mongodb-community@7.0`), started with
  `brew services start mongodb/brew/mongodb-community@7.0`.
- **Production target**: MongoDB Atlas. Switching is a one-line change —
  swap `MONGODB_URI` in `backend/.env` from `mongodb://localhost:27017`
  to an `mongodb+srv://...` Atlas connection string. No code changes.
