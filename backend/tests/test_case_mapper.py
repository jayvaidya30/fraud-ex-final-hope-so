import pytest

from app.application.cases.mapper import to_case_result


@pytest.mark.asyncio
async def test_to_case_result_includes_created_at():
    case = {
        "case_id": "c1",
        "status": "uploaded",
        "created_at": "2026-01-15T00:00:00Z",
    }

    result = to_case_result(case)

    assert result.created_at == "2026-01-15T00:00:00Z"
