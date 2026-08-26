from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.mongo import get_database
from app.schemas.analysis import AnalysisPublic
from app.services.ai_service import analyze_change
from app.services.auth_service import get_current_user, utc_now_iso

router = APIRouter(prefix="/api", tags=["analyses"])


def _to_analysis_public(doc: dict) -> AnalysisPublic:
    return AnalysisPublic(
        id=str(doc["_id"]),
        change_id=doc["change_id"],
        change_type=doc["change_type"],
        risk_level=doc["risk_level"],
        explanation=doc["explanation"],
        is_mock=doc["is_mock"],
        analyzed_at=doc["analyzed_at"],
        created_at=doc["created_at"],
    )


async def _get_owned_change(change_id: str, user_id: str) -> dict:
    if not ObjectId.is_valid(change_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Change not found")

    db = get_database()
    change = await db.software_changes.find_one({"_id": ObjectId(change_id)})
    if change is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Change not found")

    project = await db.projects.find_one({"_id": ObjectId(change["project_id"]), "user_id": user_id})
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Change not found")

    return change


@router.post("/changes/{change_id}/analyze", response_model=AnalysisPublic, status_code=status.HTTP_201_CREATED)
async def create_analysis(change_id: str, current_user: dict = Depends(get_current_user)):
    change = await _get_owned_change(change_id, str(current_user["_id"]))

    result = await analyze_change(
        commit_message=change["commit_message"],
        changed_files=change["changed_files"],
        code_diff=change["code_diff"],
    )

    db = get_database()
    now = utc_now_iso()
    doc = {
        "change_id": change_id,
        "change_type": result.change_type,
        "risk_level": result.risk_level,
        "explanation": result.explanation,
        "is_mock": result.is_mock,
        "analyzed_at": now,
        "created_at": now,
    }
    inserted = await db.analysis_results.insert_one(doc)
    doc["_id"] = inserted.inserted_id
    return _to_analysis_public(doc)


@router.get("/changes/{change_id}/analyses", response_model=list[AnalysisPublic])
async def list_analyses(change_id: str, current_user: dict = Depends(get_current_user)):
    await _get_owned_change(change_id, str(current_user["_id"]))
    db = get_database()
    cursor = db.analysis_results.find({"change_id": change_id}).sort("created_at", -1)
    return [_to_analysis_public(doc) async for doc in cursor]
