# Project Map

```text
emma/
├── CLAUDE.md                 Claude Code operating instructions for this project
├── PROJECT_MEMORY.md         Source of truth: vision, rules, roadmap, current status
├── docs/
│   ├── ARCHITECTURE.md       System design, tech choices and why, request flow
│   ├── API.md                Every backend endpoint that actually exists
│   ├── DATABASE.md           MongoDB collections, fields, relationships, indexes
│   ├── COMPONENTS.md         Frontend component inventory and where it came from
│   └── PROJECT_MAP.md        This file
├── screenshots/               (reserved for future visual verification captures)
├── tests/                     (reserved for future automated test suites)
│
├── frontend/                  React + Vite + TypeScript
│   ├── .env.local             VITE_API_URL (points at the backend)
│   ├── components.json        shadcn/ui config, copied from IDRIS
│   └── src/
│       ├── app/
│       │   ├── router.tsx         All routes, lazy-loaded pages
│       │   └── ProtectedRoute.tsx Redirects to /login when unauthenticated
│       ├── components/
│       │   ├── ui/                shadcn/ui primitives (copied from IDRIS)
│       │   ├── shared/             LoadingState, EmptyState, ErrorState, RiskBadge,
│       │   │                       ChangeTypeBadge, CodeViewer, ToastProvider
│       │   └── PageFallback.tsx
│       ├── features/
│       │   ├── landing/            Public marketing page + sections
│       │   ├── auth/                Login, Register, AuthLayout
│       │   ├── dashboard/           DashboardLayout, Sidebar/Topbar, nav items, DashboardHome
│       │   ├── projects/            projectsApi.ts, githubApi.ts, ProjectsListPage,
│       │   │                        ProjectDetailPage, components/CommitHistoryList.tsx
│       │   ├── changes/              changesApi.ts, ChangeDetailPage
│       │   ├── analysis/             analysisApi.ts (AI analyze/list)
│       │   └── profile/              ProfilePage
│       ├── lib/
│       │   ├── api.ts               fetch wrapper (auth header, error unwrapping)
│       │   ├── types.ts             Shared TS types matching backend schemas
│       │   ├── useTheme.ts          Dark/light mode hook -- currently unused; app is
│       │   │                        forced dark-only (index.html), no toggle in the UI
│       │   └── auth/                AuthContext, tokenStorage
│       ├── pages/NotFoundPage.tsx
│       ├── index.css               Design tokens (copied from IDRIS: Tailwind v4 + OKLCH palette)
│       └── App.tsx                 Provider tree: Auth -> Toast -> Router
│
└── backend/                   FastAPI + Motor (MongoDB) + Pydantic
    ├── .env / .env.example    MONGODB_URI, JWT secret, OpenAI key, USE_MOCK_AI, CORS origin
    ├── requirements.txt
    ├── venv/                  Local Python virtualenv (not committed)
    └── app/
        ├── main.py            FastAPI app, CORS, router includes, startup indexes
        ├── core/
        │   ├── config.py      Settings (pydantic-settings, reads .env)
        │   └── security.py    bcrypt hashing, JWT create/decode
        ├── database/mongo.py  Motor client/database accessors
        ├── models/
        │   ├── common.py      PyObjectId helper
        │   └── enums.py       ChangeType, RiskLevel, UserRole
        ├── schemas/           Pydantic request/response models per domain
        ├── services/
        │   ├── auth_service.py     get_current_user dependency
        │   ├── ai_service.py       Isolated AI interface: mock analyzer + OpenAI call
        │   └── github_service.py   Isolated GitHub REST API client
        └── routes/
            ├── auth.py, projects.py, changes.py, analyses.py
```
