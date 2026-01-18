from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any, TypedDict, cast

import httpx
from fastapi import Header, HTTPException, status
from jose import jwt, jwk

from app.core.config import settings


@dataclass(frozen=True)
class CurrentUser:
    id: str
    email: str | None
    role: str | None
    raw_claims: dict


class _JwksCache(TypedDict):
    fetched_at: float
    jwks: dict[str, Any] | None


_JWKS_CACHE: _JwksCache = {"fetched_at": 0.0, "jwks": None}
_JWKS_TTL_SECONDS = 10 * 60


async def _fetch_user_via_supabase(token: str) -> CurrentUser:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase auth is not configured (SUPABASE_URL/SUPABASE_ANON_KEY missing)",
        )

    url = settings.supabase_url.rstrip("/") + "/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        # Supabase auth endpoints expect the project's public API key.
        "apikey": settings.supabase_anon_key,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code == 401:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed")
        resp.raise_for_status()
        data = resp.json() or {}

    if not (data.get("id") or data.get("sub")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")

    return CurrentUser(
        id=str(data.get("id") or data.get("sub") or ""),
        email=data.get("email"),
        role=(data.get("role") or (data.get("app_metadata") or {}).get("role")),
        raw_claims=data,
    )


async def _get_jwks() -> dict[str, Any]:
    jwks_url = settings.supabase_jwks_url
    if not jwks_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase auth is not configured (SUPABASE_URL missing)",
        )

    now = time.time()
    cached_jwks = _JWKS_CACHE.get("jwks")
    cached_at = _JWKS_CACHE.get("fetched_at", 0.0)
    if cached_jwks is not None and now - cached_at < _JWKS_TTL_SECONDS:
        return cached_jwks

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(jwks_url)
        response.raise_for_status()
        jwks = cast(dict[str, Any], response.json())

    _JWKS_CACHE["jwks"] = jwks
    _JWKS_CACHE["fetched_at"] = now
    return jwks


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")
    return parts[1].strip()


async def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    token = _extract_bearer_token(authorization)

    try:
        header = jwt.get_unverified_header(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header")

    # Preferred: RS256 verification via JWKS when kid is present.
    kid = header.get("kid")
    issuer = settings.supabase_jwt_issuer_value
    issuer_options = {"verify_iss": bool(issuer)}
    if kid:
        jwks = await _get_jwks()
        keys = jwks.get("keys") or []
        jwk_dict = next((k for k in keys if k.get("kid") == kid), None)
        if not jwk_dict:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown signing key")

        try:
            key = jwk.construct(jwk_dict)
            public_pem = key.to_pem().decode("utf-8")
            claims = jwt.decode(
                token,
                public_pem,
                algorithms=["RS256"],
                audience=settings.supabase_jwt_audience,
                issuer=issuer,
                options={"verify_aud": True, **issuer_options},
            )
        except Exception:
            # If local verification fails for any reason, fall back to Supabase API validation.
            return await _fetch_user_via_supabase(token)
    else:
        # Fallback: HS256 verification for Supabase tokens that don't include a kid.
        if settings.supabase_jwt_secret:
            try:
                claims = jwt.decode(
                    token,
                    settings.supabase_jwt_secret,
                    algorithms=["HS256"],
                    audience=settings.supabase_jwt_audience,
                    issuer=issuer,
                    options={"verify_aud": True, **issuer_options},
                )
            except Exception:
                return await _fetch_user_via_supabase(token)
        else:
            return await _fetch_user_via_supabase(token)

    if not claims.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")

    return CurrentUser(
        id=str(claims.get("sub") or ""),
        email=claims.get("email"),
        role=claims.get("role"),
        raw_claims=claims,
    )
