from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.mongo import get_database
from app.schemas.change import SoftwareChangeCreate, SoftwareChangePublic
from app.schemas.github import ImportCommitRequest
from app.services import github_service
from app.services.auth_service import get_current_user, utc_now_iso
from app.services.github_service import GitHubError

router = APIRouter(prefix="/api", tags=["changes"])


def _to_change_public(doc: dict) -> SoftwareChangePublic:
    return SoftwareChangePublic(
        id=str(doc["_id"]),
        project_id=doc["project_id"],
        commit_id=doc["commit_id"],
        commit_message=doc["commit_message"],
        author=doc["author"],
        changed_files=doc["changed_files"],
        code_diff=doc["code_diff"],
        commit_date=doc["commit_date"],
        created_at=doc["created_at"],
    )


async def _get_owned_project_or_404(project_id: str, user_id: str) -> dict:
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    db = get_database()
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user_id})
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/projects/{project_id}/changes", response_model=list[SoftwareChangePublic])
async def list_changes(project_id: str, current_user: dict = Depends(get_current_user)):
    await _get_owned_project_or_404(project_id, str(current_user["_id"]))
    db = get_database()
    cursor = db.software_changes.find({"project_id": project_id}).sort("created_at", -1)
    return [_to_change_public(doc) async for doc in cursor]


@router.post(
    "/projects/{project_id}/changes",
    response_model=SoftwareChangePublic,
    status_code=status.HTTP_201_CREATED,
)
async def create_change(
    project_id: str, payload: SoftwareChangeCreate, current_user: dict = Depends(get_current_user)
):
    await _get_owned_project_or_404(project_id, str(current_user["_id"]))
    db = get_database()
    doc = {
        "project_id": project_id,
        "commit_id": payload.commit_id,
        "commit_message": payload.commit_message,
        "author": payload.author,
        "changed_files": payload.changed_files,
        "code_diff": payload.code_diff,
        "commit_date": payload.commit_date,
        "created_at": utc_now_iso(),
    }
    result = await db.software_changes.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _to_change_public(doc)


@router.post(
    "/projects/{project_id}/changes/import-github",
    response_model=SoftwareChangePublic,
)
async def import_github_commit(
    project_id: str, payload: ImportCommitRequest, current_user: dict = Depends(get_current_user)
):
    project = await _get_owned_project_or_404(project_id, str(current_user["_id"]))
    if not project.get("repository_url"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This project has no repository URL set.",
        )

    db = get_database()

    # Same commit imported twice returns the existing record rather than
    # creating a duplicate (Section 18) -- (project_id, commit_id) is the
    # natural key, since commit_id already holds the GitHub SHA for
    # imported changes.
    existing = await db.software_changes.find_one(
        {"project_id": project_id, "commit_id": payload.commit_sha}
    )
    if existing:
        return _to_change_public(existing)

    try:
        repo = github_service.parse_repo_url(project["repository_url"])
        commit = await github_service.get_commit(repo, payload.commit_sha)
    except GitHubError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    doc = {
        "project_id": project_id,
        "commit_id": commit.sha,
        "commit_message": commit.message,
        "author": commit.author,
        "changed_files": commit.changed_files,
        "code_diff": commit.code_diff,
        "commit_date": commit.date,
        "created_at": utc_now_iso(),
    }
    result = await db.software_changes.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _to_change_public(doc)


@router.get("/changes/{change_id}", response_model=SoftwareChangePublic)
async def get_change(change_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(change_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Change not found")

    db = get_database()
    change = await db.software_changes.find_one({"_id": ObjectId(change_id)})
    if change is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Change not found")

    await _get_owned_project_or_404(change["project_id"], str(current_user["_id"]))
    return _to_change_public(change)
