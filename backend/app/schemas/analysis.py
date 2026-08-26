from pydantic import BaseModel

from app.models.enums import ChangeType, RiskLevel


class AnalysisPublic(BaseModel):
    id: str
    change_id: str
    change_type: ChangeType
    risk_level: RiskLevel
    explanation: str
    is_mock: bool
    analyzed_at: str
    created_at: str
