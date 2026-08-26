# Academic Demonstration Script

A ready-made walkthrough for a project defense, following the core user
flow from `PROJECT_MEMORY.md` Section 41.

## Live demo (recommended — no setup needed)

- **App**: https://ai-scm-flame.vercel.app
- The Render free-tier backend sleeps after inactivity — if the first
  request feels slow (~30-50s), that's it waking up. Load the app a
  minute before presenting to warm it up.

## Local setup (alternative, if you want to demo offline or edit live)

1. `brew services start mongodb/brew/mongodb-community@7.0`
2. Backend: `cd backend && ./venv/bin/uvicorn app.main:app --port 8001`
3. Frontend: `cd frontend && npm run dev`
4. Open http://localhost:5174

## Live walkthrough (the core flow)

1. **Landing page** (`/`) — explain the research problem: AI-assisted,
   not AI-automated, software change review, powered by OpenAI.
2. **Register** a fresh account live, to show the flow works from zero.
3. **Dashboard** → **New project** → give it a name and a real public
   GitHub repository URL (e.g. your own repo).
4. **Project detail** → the **Commit history** table loads automatically,
   showing real commits pulled straight from GitHub: SHA, message,
   author, date.
5. Click **Analyze** next to any commit — the system retrieves that
   exact commit's diff from GitHub and takes you straight to its detail
   page. Point out you never typed a commit message or pasted a diff —
   it all came from GitHub.
6. **Change detail** → point out the colorized diff viewer → click
   **Analyze with AI**.
7. Show the result: change-type badge, risk badge, and the explanation
   text. Point out it is *not* labeled "Mock AI result" — proving it's a
   real OpenAI call, not the heuristic fallback.
8. Optionally repeat step 5 with a second commit to show the commit
   list, pagination, and duplicate-import protection (re-clicking
   Analyze on an already-imported commit returns the same record instead
   of creating a new one).
9. If a GitHub URL isn't available live, **Add change manually** on the
   project page is the fallback path — same downstream analysis.

## Talking points if asked about limitations

- The system is advisory only — it does not modify code and does not
  replace developer judgment (Section 9).
- Software changes are collected two ways: automatically from a real
  GitHub repository's commit history, or entered manually as a fallback.
  GitHub import is the primary path.
- The AI-assessed risk level is exactly that — an assessment, not a
  guarantee. Different runs or different commits can reasonably get
  different risk calls for similar-looking changes; that's expected of
  an LLM-based judgment call, not a bug.
- Public GitHub repos work without any credentials (60 requests/hour).
  A `GITHUB_TOKEN` can be added for private repos or a higher rate limit.
