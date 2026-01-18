from typing import Literal

from pydantic import BaseModel


class AnalysisJobResult(BaseModel):
    job_id: str
    case_id: str
    status: Literal["queued", "running", "completed", "failed"]
    error: str | None = None
    queued_at: str | None = None
    started_at: str | None = None
    completed_at: str | None = None
