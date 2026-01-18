from __future__ import annotations

from typing import Any, Literal, TypedDict

CaseStatus = Literal["uploaded", "processing", "analyzed", "failed"]


class CaseSignals(TypedDict, total=False):
    original_file: str
    filename: str
    extracted_text_preview: str
    # Additional computed signals are stored dynamically.


class CaseRecord(TypedDict, total=False):
    case_id: str
    status: CaseStatus
    risk_score: int
    explanation: str
    signals: CaseSignals | dict[str, Any]
    created_at: str


class CaseCreate(TypedDict, total=False):
    case_id: str
    status: CaseStatus
    signals: CaseSignals | dict[str, Any]


class CaseUpdate(TypedDict, total=False):
    status: CaseStatus
    risk_score: int
    explanation: str
    signals: CaseSignals | dict[str, Any]
