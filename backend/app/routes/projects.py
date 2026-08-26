from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database.mongo import get_database
from app.schemas.github import GitHubCommitListResponse, GitHubCommitSummary
from app.schemas.project import ProjectCreate, ProjectPublic, ProjectUpdate
from app.services import github_service
from app.services.auth_service import get_current_user, utc_now_iso
from app.services.github_service import GitHubError

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _to_project_public(doc: dict) -> ProjectPublic:
    return ProjectPublic(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        project_name=doc["project_name"],
        repository_url=doc.get("repository_url"),
        description=doc.get("description"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


async def _get_owned_project(project_id: str, user_id: str) -> dict:
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db = get_database()
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user_id})
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("", response_model=list[ProjectPublic])
async def list_projects(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.projects.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    return [_to_project_public(doc) async for doc in cursor]


@router.post("", response_model=ProjectPublic, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    now = utc_now_iso()
    doc = {
        "user_id": str(current_user["_id"]),
        "project_name": payload.project_name,
        "repository_url": payload.repository_url,
        "description": payload.description,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.projects.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _to_project_public(doc)


@router.get("/{project_id}", response_model=ProjectPublic)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = await _get_owned_project(project_id, str(current_user["_id"]))
    return _to_project_public(project)


@router.patch("/{project_id}", response_model=ProjectPublic)
async def update_project(
    project_id: str, payload: ProjectUpdate, current_user: dict = Depends(get_current_user)
):
    await _get_owned_project(project_id, str(current_user["_id"]))

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if updates:
        updates["updated_at"] = utc_now_iso()
        db = get_database()
        await db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": updates})

    project = await _get_owned_project(project_id, str(current_user["_id"]))
    return _to_project_public(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    await _get_owned_project(project_id, str(current_user["_id"]))
    db = get_database()

    change_ids = [
        str(doc["_id"])
        async for doc in db.software_changes.find({"project_id": project_id}, {"_id": 1})
    ]

    if change_ids:
        await db.analysis_results.delete_many({"change_id": {"$in": change_ids}})
        await db.software_changes.delete_many({"project_id": project_id})

    await db.projects.delete_one({"_id": ObjectId(project_id)})


@router.get("/{project_id}/github/commits", response_model=GitHubCommitListResponse)
async def list_github_commits(
    project_id: str,
    page: int = Query(default=1, ge=1),
    current_user: dict = Depends(get_current_user),
):
    project = await _get_owned_project(project_id, str(current_user["_id"]))
    if not project.get("repository_url"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This project has no repository URL set.",
        )

    try:
        repo = github_service.parse_repo_url(project["repository_url"])
        commits, has_more = await github_service.list_commits(repo, page=page)
    except GitHubError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    return GitHubCommitListResponse(
        commits=[GitHubCommitSummary(**vars(c)) for c in commits],
        page=page,
        has_more=has_more,
    )
