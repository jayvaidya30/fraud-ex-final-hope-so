import pytest

from app.domain.errors import AnalysisJobNotFound
from app.services.case_service import CaseService


class FakeJobRepo:
    def __init__(self, job):
        self._job = job

    async def get(self, job_id: str):
        return self._job


class FakeRepo:
    def __init__(self):
        self.client = object()


@pytest.mark.asyncio
async def test_get_analysis_job_missing_raises():
    service = CaseService(FakeRepo())
    service._job_repo = FakeJobRepo(None)

    with pytest.raises(AnalysisJobNotFound):
        await service.get_analysis_job("missing")


@pytest.mark.asyncio
async def test_get_analysis_job_returns_job():
    job = {
        "job_id": "j1",
        "case_id": "c1",
        "status": "queued",
        "queued_at": "2026-01-15T00:00:00Z",
    }
    service = CaseService(FakeRepo())
    service._job_repo = FakeJobRepo(job)

    result = await service.get_analysis_job("j1")

    assert result.job_id == "j1"
    assert result.status == "queued"
