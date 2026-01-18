import asyncio
from datetime import datetime, timezone

from fastapi import UploadFile

from app.application.cases.analyze_case import AnalyzeCase
from app.application.cases.create_case_from_upload import CreateCaseFromUpload
from app.application.cases.get_case import GetCase
from app.application.cases.job_ids import new_job_id
from app.application.cases.list_cases import ListCases
from app.application.cases.mapper import to_case_result
from app.domain.case import CaseRecord, CaseUpdate
from app.domain.errors import AnalysisJobNotFound, CaseNotFound, DomainError
from app.repositories.analysis_job_repo import AnalysisJobRepository
from app.repositories.case_repo import CaseRepository
from app.schemas.case import CaseResult
from app.utils.logging import logger
from app.schemas.analysis_job import AnalysisJobResult

class CaseService:
    def __init__(self, repository: CaseRepository):
        self.repository = repository
        self._job_repo: AnalysisJobRepository | None = None

    @property
    def job_repo(self) -> AnalysisJobRepository:
        if self._job_repo is None:
            self._job_repo = AnalysisJobRepository(self.repository.client)
        return self._job_repo

    async def list_cases(self) -> list[CaseResult]:
        use_case = ListCases(self.repository)
        cases = await use_case.execute()
        return [to_case_result(case) for case in cases]

    async def get_case(self, case_id: str) -> CaseResult:
        use_case = GetCase(self.repository)
        case = await use_case.execute(case_id)
        return to_case_result(case)

    async def create_case_from_upload(self, file: UploadFile) -> CaseResult:
        use_case = CreateCaseFromUpload(self.repository)
        case = await use_case.execute(file)
        return to_case_result(case)

    async def analyze_case(self, case_id: str) -> CaseResult:
        use_case = AnalyzeCase(self.repository)
        case = await use_case.execute(case_id)
        return to_case_result(case)

    async def get_analysis_job(self, job_id: str) -> AnalysisJobResult:
        job = await self.job_repo.get(job_id)
        if not job:
            raise AnalysisJobNotFound("Analysis job not found")
        return AnalysisJobResult(**job)

    async def queue_analysis(self, case_id: str) -> CaseResult:
        existing = await self.repository.get(case_id)
        if not existing:
            raise CaseNotFound("Case not found")

        signals = existing.get("signals") or {}
        job_id = new_job_id()
        signals["analysis_queued_at"] = datetime.now(timezone.utc).isoformat()
        signals["analysis_job_id"] = job_id

        await self.job_repo.create(
            {
                "job_id": job_id,
                "case_id": case_id,
                "status": "queued",
                "queued_at": datetime.now(timezone.utc).isoformat(),
            }
        )

        logger.info("analysis.queued", case_id=case_id, job_id=job_id)

        update: CaseUpdate = {"status": "processing", "signals": signals}
        case = await self.repository.update(case_id, update)
        asyncio.create_task(self._run_analysis(case_id, job_id))
        return to_case_result(case)

    async def _run_analysis(self, case_id: str, job_id: str) -> None:
        use_case = AnalyzeCase(self.repository)
        await self.job_repo.update(
            job_id,
            {
                "status": "running",
                "started_at": datetime.now(timezone.utc).isoformat(),
            },
        )
        logger.info("analysis.started", case_id=case_id, job_id=job_id)
        try:
            await use_case.execute(case_id)
            await self.job_repo.update(
                job_id,
                {
                    "status": "completed",
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                },
            )
            logger.info("analysis.completed", case_id=case_id, job_id=job_id)
        except DomainError as e:
            existing = await self.repository.get(case_id)
            signals = (existing or {}).get("signals") or {}
            signals["analysis_failed_at"] = datetime.now(timezone.utc).isoformat()
            signals["analysis_error"] = str(e)
            await self.repository.update(
                case_id,
                {
                    "status": "failed",
                    "explanation": str(e),
                    "signals": signals,
                },
            )
            await self.job_repo.update(
                job_id,
                {
                    "status": "failed",
                    "error": str(e),
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                },
            )
            logger.info("analysis.failed", case_id=case_id, job_id=job_id, error=str(e))
