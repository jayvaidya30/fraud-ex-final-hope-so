from __future__ import annotations

from typing import Any, cast

from app.domain.analysis_job import AnalysisJobRecord
from app.services.supabase_postgrest import SupabasePostgrest


class AnalysisJobRepository:
    def __init__(self, client: SupabasePostgrest):
        self.client = client
        self.table = "/analysis_jobs"

    async def create(self, obj_in: AnalysisJobRecord) -> AnalysisJobRecord:
        created = await self.client.post(self.table, json=obj_in)
        if isinstance(created, list) and created:
            return cast(AnalysisJobRecord, created[0])
        if isinstance(created, dict):
            return cast(AnalysisJobRecord, created)
        return obj_in

    async def update(self, job_id: str, obj_in: AnalysisJobRecord) -> AnalysisJobRecord:
        updated = await self.client.patch(
            self.table,
            params={"job_id": f"eq.{job_id}"},
            json=obj_in,
        )
        if isinstance(updated, list) and updated:
            return cast(AnalysisJobRecord, updated[0])
        if isinstance(updated, dict):
            return cast(AnalysisJobRecord, updated)
        return obj_in

    async def get(self, job_id: str) -> AnalysisJobRecord | None:
        rows = await self.client.get(
            self.table,
            params={"job_id": f"eq.{job_id}", "select": "*"},
        )
        if rows and len(rows) > 0:
            return rows[0]
        return None
