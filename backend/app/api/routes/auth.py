from fastapi import APIRouter, Depends

from app.api import deps
from app.core.supabase_auth import CurrentUser


router = APIRouter()


@router.get("/me")
def me(user: CurrentUser = Depends(deps.require_user)):
    return {"id": user.id, "email": user.email, "role": user.role}
