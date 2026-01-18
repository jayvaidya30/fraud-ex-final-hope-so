from typing import Literal

from pydantic import BaseModel


class CaseCreateResponse(BaseModel):
    case_id: str


class CaseResult(BaseModel):
    case_id: str
    status: Literal["uploaded", "processing", "analyzed", "failed"]
    risk_score: int | None = None
    signals: dict | None = None
    explanation: str | None = None
    created_at: str | None = None


class CaseResponse(BaseModel):
    case: CaseResult
