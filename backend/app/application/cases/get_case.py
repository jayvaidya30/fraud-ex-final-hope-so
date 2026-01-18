from __future__ import annotations

from dataclasses import dataclass

from app.domain.case import CaseRecord
from app.domain.errors import CaseNotFound
from app.repositories.case_repo import CaseRepository


@dataclass(frozen=True)
class GetCase:
    repository: CaseRepository

    async def execute(self, case_id: str) -> CaseRecord:
        case = await self.repository.get(case_id)
        if not case:
            raise CaseNotFound("Case not found")
        return case
