from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import get_case_service, require_user
from app.core.supabase_auth import CurrentUser
from app.domain.errors import (
    AnalysisJobNotFound,
    CaseExtractionFailed,
    CaseMissingFile,
    CaseNotFound,
    DomainError,
)
from app.services.case_service import CaseService
from app.schemas.analysis_job import AnalysisJobResult
from app.schemas.case import CaseResponse, CaseResult

router = APIRouter()


@router.get("", response_model=list[CaseResult])
async def list_cases(
    *,
    _: CurrentUser = Depends(require_user),
    service: CaseService = Depends(get_case_service),
) -> Any:
    """List cases for the current user."""
    try:
        return await service.list_cases()
    except DomainError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload", response_model=CaseResponse)
async def upload_case_document(
    *,
    _: CurrentUser = Depends(require_user),
    service: CaseService = Depends(get_case_service),
    file: UploadFile = File(...),
) -> Any:
    """Upload a document to create a new case."""
    try:
        return {"case": await service.create_case_from_upload(file)}
    except DomainError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{case_id}", response_model=CaseResult)
async def get_case(
    case_id: str,
    _: CurrentUser = Depends(require_user),
    service: CaseService = Depends(get_case_service),
) -> Any:
    """Get case details by ID."""
    try:
        return await service.get_case(case_id)
    except CaseNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DomainError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{case_id}/analyze", response_model=CaseResponse)
async def analyze_case(
    *,
    case_id: str,
    _: CurrentUser = Depends(require_user),
    service: CaseService = Depends(get_case_service),
) -> Any:
    """Run the analysis pipeline."""
    try:
        queued = await service.queue_analysis(case_id)
        return {"case": queued}
    except CaseNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except (CaseMissingFile, CaseExtractionFailed) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DomainError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/{job_id}", response_model=AnalysisJobResult)
async def get_analysis_job(
    job_id: str,
    _: CurrentUser = Depends(require_user),
    service: CaseService = Depends(get_case_service),
) -> Any:
    """Get analysis job status by job ID."""
    try:
        return await service.get_analysis_job(job_id)
    except AnalysisJobNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DomainError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
