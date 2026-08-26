# Database

MongoDB (Motor async driver). Local dev connects to a Homebrew-managed
`mongodb-community@7.0` instance at `mongodb://localhost:27017`;
production should point `MONGODB_URI` at a MongoDB Atlas cluster instead
(no code change required — see `docs/ARCHITECTURE.md`).

Database name: `ai_scm` (`MONGODB_DB_NAME` in `.env`).

## Collections

### `users`
```text
_id             ObjectId (PK)
full_name       str
email           str, unique index
password_hash   str (bcrypt)
role            "developer" | "admin"
created_at      ISO 8601 str
```

### `projects`
```text
_id             ObjectId (PK)
user_id         str (owner, indexed)
project_name    str
repository_url  str | null
description     str | null
created_at      ISO 8601 str
updated_at      ISO 8601 str
```

### `software_changes`
```text
_id             ObjectId (PK)
project_id      str (indexed)
commit_id       str
commit_message  str
author          str
changed_files   list[str]
code_diff       str
commit_date     str
created_at      ISO 8601 str
```

### `analysis_results`
```text
_id             ObjectId (PK)
change_id       str (indexed)
change_type     "Bug Fix" | "New Feature" | "Refactoring" | "Configuration Change"
risk_level      "Low" | "Medium" | "High"
explanation     str
is_mock         bool   -- true when produced by the heuristic mock analyzer,
                           not a real OpenAI call (Section 40 data-integrity rule)
analyzed_at     ISO 8601 str
created_at      ISO 8601 str
```

## Relationships

```text
users 1───* projects
projects 1───* software_changes
software_changes 1───* analysis_results
```

Ownership is enforced at the API layer: every route re-derives the
`user_id` chain (change -> project -> user) before returning or mutating
a document, rather than trusting client-supplied IDs alone.

## Indexes

Created at app startup (`app/main.py` lifespan):
- `users.email` (unique)
- `projects.user_id`
- `software_changes.project_id`
- `software_changes.(project_id, commit_id)` (non-unique — speeds up the
  GitHub duplicate-import lookup; not unique on purpose, see
  `PROJECT_MEMORY.md` §34 for why)
- `analysis_results.change_id`
