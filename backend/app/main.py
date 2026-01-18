import time
import uuid

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.utils.logging import configure_logging, logger


def create_app() -> FastAPI:
    configure_logging()
    application = FastAPI(title="FraudEx Backend")

    @application.middleware("http")
    async def add_request_id_and_log(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        start = time.perf_counter()
        response: Response | None = None
        try:
            response = await call_next(request)
        except Exception:
            logger.exception(
                "request.failed",
                method=request.method,
                path=request.url.path,
                request_id=request_id,
            )
            raise
        finally:
            duration_ms = (time.perf_counter() - start) * 1000.0
            logger.info(
                "request",
                method=request.method,
                path=request.url.path,
                status=getattr(response, "status_code", 500),
                duration_ms=round(duration_ms, 2),
                request_id=request_id,
            )

        if response is not None:
            response.headers["X-Request-ID"] = request_id
            return response
        return Response(status_code=500)

    @application.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        request_id = getattr(request.state, "request_id", None) or str(uuid.uuid4())
        logger.exception(
            "unhandled_exception",
            path=request.url.path,
            method=request.method,
            request_id=request_id,
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"},
            headers={"X-Request-ID": request_id},
        )

    @application.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        request_id = getattr(request.state, "request_id", None) or str(uuid.uuid4())
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers={"X-Request-ID": request_id},
        )

    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    if settings.environment != "prod":
        application.add_middleware(
            CORSMiddleware,
            allow_origins=allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    application.include_router(api_router)
    return application


app = create_app()
