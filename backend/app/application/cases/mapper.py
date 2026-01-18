from __future__ import annotations

from app.domain.case import CaseRecord
from app.schemas.case import CaseResult


def to_case_result(case: CaseRecord) -> CaseResult:
    return CaseResult.model_validate(case)
