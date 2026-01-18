from fastapi import APIRouter, Depends

from app.api.routes.analytics import router as analytics_router
from app.api.routes.auth import router as auth_router
from app.api.routes.cases import router as cases_router
from app.api.routes.health import router as health_router
from app.core.rate_limit import rate_limit

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(
	auth_router,
	prefix="/auth",
	tags=["auth"],
	dependencies=[Depends(rate_limit)],
)
api_router.include_router(
	cases_router,
	prefix="/cases",
	tags=["cases"],
	dependencies=[Depends(rate_limit)],
)
api_router.include_router(
	analytics_router,
	prefix="/analytics",
	tags=["analytics"],
	dependencies=[Depends(rate_limit)],
)

