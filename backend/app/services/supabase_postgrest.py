from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings


class SupabasePostgrest:
    def __init__(self, *, access_token: str):
        if not settings.supabase_url or not settings.supabase_anon_key:
            raise RuntimeError("Supabase is not configured (SUPABASE_URL / SUPABASE_ANON_KEY missing)")

        self._base_url = settings.supabase_url.rstrip("/") + "/rest/v1"
        self._headers = {
            "apikey": settings.supabase_anon_key,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

    async def get(self, path: str, *, params: dict[str, Any] | None = None) -> Any:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(self._base_url + path, headers=self._headers, params=params)
            response.raise_for_status()
            if not response.content:
                return None
            return response.json()

    async def post(self, path: str, *, json: Any) -> Any:
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {**self._headers, "Prefer": "return=representation"}
            response = await client.post(self._base_url + path, headers=headers, json=json)
            response.raise_for_status()
            if not response.content:
                return None
            return response.json()

    async def patch(self, path: str, *, params: dict[str, Any] | None = None, json: Any) -> Any:
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {**self._headers, "Prefer": "return=representation"}
            response = await client.patch(self._base_url + path, headers=headers, params=params, json=json)
            response.raise_for_status()
            if not response.content:
                return None
            return response.json()
