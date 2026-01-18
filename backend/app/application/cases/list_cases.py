from __future__ import annotations

from dataclasses import dataclass

from app.domain.case import CaseRecord
from app.repositories.case_repo import CaseRepository


@dataclass(frozen=True)
class ListCases:
    repository: CaseRepository

    async def execute(self) -> list[CaseRecord]:
        return await self.repository.list()
