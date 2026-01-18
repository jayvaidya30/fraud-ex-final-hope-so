from typing import Any
from uuid import uuid4

from app.repositories.base import BaseRepository
from app.services.supabase_postgrest import SupabasePostgrest
from app.domain.case import CaseCreate, CaseRecord, CaseUpdate

class CaseRepository(BaseRepository[CaseRecord]):
    def __init__(self, client: SupabasePostgrest):
        self.client = client
        self.table = "/cases"

    async def get(self, id: str) -> CaseRecord | None:
        rows = await self.client.get(
            self.table,
            params={"case_id": f"eq.{id}", "select": "*"}
        )
        if rows and len(rows) > 0:
            return rows[0]
        return None

    async def list(self, filters: dict[str, Any] | None = None) -> list[CaseRecord]:
        params = {
            "select": "case_id,status,risk_score,explanation,signals,created_at",
            "order": "created_at.desc",
        }
        # TODO: Implement complex filtering from filters dict
        rows = await self.client.get(self.table, params=params)
        return rows or []

    async def create(self, obj_in: CaseCreate) -> CaseRecord:
        if "case_id" not in obj_in:
            obj_in["case_id"] = str(uuid4())
        
        created = await self.client.post(self.table, json=obj_in)
        # Supabase returns a list of created objects if Prefer: return=representation is sent
        if isinstance(created, list) and created:
            return created[0]
        return created if created else obj_in

    async def update(self, id: str, obj_in: CaseUpdate) -> CaseRecord:
        updated = await self.client.patch(
            self.table,
            params={"case_id": f"eq.{id}"},
            json=obj_in
        )
        if isinstance(updated, list) and updated:
            return updated[0]
        return {}

    async def delete(self, id: str) -> bool:
        # Note: Delete not implemented in SupabasePostgrest wrapper yet needs extension
        return False
