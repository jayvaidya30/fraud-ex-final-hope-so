from __future__ import annotations

from dataclasses import dataclass
import uuid

from fastapi import UploadFile

from app.domain.case import CaseCreate, CaseRecord
from app.repositories.case_repo import CaseRepository
from app.services import storage


@dataclass(frozen=True)
class CreateCaseFromUpload:
    repository: CaseRepository

    async def execute(self, file: UploadFile) -> CaseRecord:
        file_path = storage.save_upload(file)

        case_id = str(uuid.uuid4())
        new_case: CaseCreate = {
            "case_id": case_id,
            "status": "uploaded",
            "signals": {"original_file": str(file_path), "filename": file.filename},
        }
        return await self.repository.create(new_case)
