from __future__ import annotations

from typing import TypedDict


class AnalysisJobRecord(TypedDict, total=False):
    job_id: str
    case_id: str
    status: str
    error: str | None
    queued_at: str | None
    started_at: str | None
    completed_at: str | None
