# Academic Demonstration Script

A ready-made walkthrough for a project defense, following the core user
flow from `PROJECT_MEMORY.md` Section 41.

## Setup (before presenting)

1. `brew services start mongodb/brew/mongodb-community@7.0`
2. Backend: `cd backend && ./venv/bin/uvicorn app.main:app --port 8001`
3. Frontend: `cd frontend && npm run dev`
4. Open http://localhost:5173

## Pre-built evaluation dataset

A demo account already has a real, non-fabricated evaluation run on it —
useful to jump straight to the Evaluation page without re-entering data
live:

- **Login**: `demo.account@example.com` / `demo12345`
- Project: "Evaluation Dataset" — 6 hand-picked, unambiguous software
  changes (one clear-cut example of each change type, split across Low
  and High expected risk), each analyzed by the real OpenAI API
  (`gpt-4o-mini`, not the mock) and evaluated against expected labels.
- Results (captured 2026-08-24): **100% change-type accuracy** (6/6,
  perfect diagonal confusion matrix across all four classes) and **67%
  risk-level accuracy** (4/6) — the model rated two "Low"-risk changes as
  "Medium." That's a genuine, interesting finding worth mentioning live:
  the LLM appears to skew cautious on risk for small, isolated changes
  rather than a flaw in the evaluation pipeline itself.

## Live walkthrough (the core flow)

1. **Landing page** (`/`) — explain the research problem: AI-assisted,
   not AI-automated, software change review.
2. **Register** a fresh account live, to show the flow works from zero
   (not just the pre-seeded demo account).
3. **Dashboard** → **New project** → fill in a project name.
4. **Project detail** → **Add change** → use a real or invented commit:
   commit id, message, author, changed files (one per line), diff,
   date.
5. **Change detail** → point out the colorized diff viewer → click
   **Analyze with AI**.
6. Show the result: change-type badge, risk badge, and the explanation
   text. Point out it is *not* labeled "Mock AI result" — proving it's a
   real model call, not the heuristic fallback.
7. **Evaluate this prediction** → enter what you believe the correct
   labels should have been → **Save evaluation**.
8. Navigate to **Evaluation** in the sidebar → show accuracy,
   precision/recall/F1 per class, and the confusion matrix updating with
   the new record folded in.

## Talking points if asked about limitations

- The system is advisory only — it does not modify code and does not
  replace developer judgment (Section 9).
- Software changes are entered manually right now; automated collection
  from real open-source repositories (GitHub API import) was designed
  into the roadmap (Phase 7) but deliberately deferred as optional,
  since it wasn't required to demonstrate the core research objectives.
- Evaluation metrics are only as good as the expected labels a human
  enters — same as any supervised-evaluation setup.
