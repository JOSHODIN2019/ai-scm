# Components

## UI primitives (`frontend/src/components/ui/`)

Copied from `IDRIS/frontend/src/components/ui/` (shadcn/ui on `@base-ui/react`)
as fresh files — the IDRIS source was never modified. One change was made
on top of the copy: `button.tsx` now defaults `nativeButton={false}`
whenever a `render` prop is supplied (e.g. `<Button render={<Link .../>} />`),
which silences a Base UI console warning that also exists in IDRIS's own
identical usage pattern.

`avatar, badge, button, card, dialog, input, label, select, separator, sheet, switch, table, textarea`

## Shared domain components (`frontend/src/components/shared/`)

Built for this project (not in IDRIS, since IDRIS is a different domain):

- `LoadingState` — spinner + label
- `EmptyState` — icon + title + description + optional action
- `ErrorState` — destructive-toned message + retry button
- `RiskBadge` — color-coded Low/Medium/High badge
- `ChangeTypeBadge` — badge for the four change-type values
- `CodeViewer` — line-colored diff viewer (green `+`, red `-`)
- `ToastProvider` / `useToast` — success/error/warning/info toasts,
  auto-dismiss after 4s

## Layout (`frontend/src/features/dashboard/components/`)

`DashboardLayout`, `Sidebar`, `SidebarContent`, `Topbar` — mirrors IDRIS's
dashboard shell structure and responsive behavior (desktop sidebar,
mobile `Sheet` drawer via the hamburger menu, dark-mode toggle in the
topbar).

## Feature pages

| Page | Path | Notes |
|---|---|---|
| Landing | `features/landing/LandingPage.tsx` | Hero, features, how-it-works, about, CTA, footer |
| Login / Register | `features/auth/*Page.tsx` | Shared `AuthLayout` |
| Dashboard overview | `features/dashboard/DashboardHome.tsx` | Project count, recent projects |
| Projects list | `features/projects/ProjectsListPage.tsx` | List + create-project dialog |
| Project detail | `features/projects/ProjectDetailPage.tsx` | Project info, commit history (if repo URL set) + `CommitHistoryList`, changes list, add-change dialog, delete |
| Commit history | `features/projects/components/CommitHistoryList.tsx` | Paginated GitHub commit table with an Analyze button per row (2026-08-25) |
| Change detail | `features/changes/ChangeDetailPage.tsx` | Diff viewer, run analysis, analysis history, evaluate form |
| Evaluation dashboard | `features/evaluations/EvaluationDashboardPage.tsx` | Accuracy, precision/recall/F1 table, confusion matrix |
| Profile | `features/profile/ProfilePage.tsx` | Account info, sign out |

Roadmap stages 15 (changes list), 17 (change details), and 21–27
(analysis screen, classification/risk/explanation display, save,
history, detail) were deliberately consolidated into `ProjectDetailPage`
and `ChangeDetailPage` rather than built as separate routes — the CTO
Operating Principle in `PROJECT_MEMORY.md` calls for the smallest system
that convincingly solves the problem, and a one-analysis-per-page-load
pattern doesn't need six routes to express three concepts (a change, its
diff, and its analyses).

## API service modules (not components, but the equivalent of "keep API
calls in service modules")

`lib/api.ts` (fetch wrapper), `lib/auth/AuthContext.tsx`,
`features/projects/projectsApi.ts`, `features/changes/changesApi.ts`,
`features/analysis/analysisApi.ts`, `features/evaluations/evaluationsApi.ts`.
