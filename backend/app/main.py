from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.database.mongo import close_client, get_database
from app.routes import analyses, auth, changes, projects

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = get_database()
    await db.users.create_index("email", unique=True)
    await db.projects.create_index("user_id")
    await db.software_changes.create_index("project_id")
    # Non-unique: speeds up the duplicate-commit lookup in
    # import_github_commit(). Not a unique constraint on purpose --
    # manual "Add change" entry (commit_id is free text there) must keep
    # working exactly as it did before this feature, and a hard unique
    # constraint would risk breaking it on an accidental duplicate.
    await db.software_changes.create_index([("project_id", 1), ("commit_id", 1)])
    await db.analysis_results.create_index("change_id")
    yield
    close_client()


app = FastAPI(title="AI-Driven Software Configuration Management System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(changes.router)
app.include_router(analyses.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
