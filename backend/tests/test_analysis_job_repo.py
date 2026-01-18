import pytest

from app.repositories.analysis_job_repo import AnalysisJobRepository


class FakeClient:
    def __init__(self, responses: dict[str, object]):
        self.responses = responses
        self.calls = []

    async def post(self, path: str, *, json):
        self.calls.append(("post", path, json))
        return self.responses.get("post")

    async def patch(self, path: str, *, params=None, json=None):
        self.calls.append(("patch", path, params, json))
        return self.responses.get("patch")

    async def get(self, path: str, *, params=None):
        self.calls.append(("get", path, params))
        return self.responses.get("get")


@pytest.mark.asyncio
async def test_create_returns_first_row_when_list():
    client = FakeClient({"post": [{"job_id": "j1"}]})
    repo = AnalysisJobRepository(client)  # type: ignore[arg-type]

    created = await repo.create({"job_id": "j1"})

    assert created == {"job_id": "j1"}


@pytest.mark.asyncio
async def test_update_returns_first_row_when_list():
    client = FakeClient({"patch": [{"job_id": "j1", "status": "running"}]})
    repo = AnalysisJobRepository(client)  # type: ignore[arg-type]

    updated = await repo.update("j1", {"status": "running"})

    assert updated["status"] == "running"


@pytest.mark.asyncio
async def test_get_returns_none_when_empty():
    client = FakeClient({"get": []})
    repo = AnalysisJobRepository(client)  # type: ignore[arg-type]

    row = await repo.get("missing")

    assert row is None
