import pytest

from app.application.cases.get_case import GetCase
from app.application.cases.list_cases import ListCases
from app.domain.errors import CaseNotFound


class FakeCaseRepo:
    def __init__(self, data):
        self._data = data

    async def list(self, filters=None):
        return list(self._data.values())

    async def get(self, case_id: str):
        return self._data.get(case_id)


@pytest.mark.asyncio
async def test_list_cases_returns_rows():
    repo = FakeCaseRepo({"c1": {"case_id": "c1", "status": "uploaded"}})
    use_case = ListCases(repo)

    rows = await use_case.execute()

    assert rows == [{"case_id": "c1", "status": "uploaded"}]


@pytest.mark.asyncio
async def test_get_case_returns_row():
    repo = FakeCaseRepo({"c1": {"case_id": "c1", "status": "uploaded"}})
    use_case = GetCase(repo)

    row = await use_case.execute("c1")

    assert row["case_id"] == "c1"


@pytest.mark.asyncio
async def test_get_case_missing_raises():
    repo = FakeCaseRepo({})
    use_case = GetCase(repo)

    with pytest.raises(CaseNotFound):
        await use_case.execute("missing")
