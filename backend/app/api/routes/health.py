from fastapi import APIRouter


router = APIRouter()


@router.get("/health")
def health():
    return {"status": "Server is running perfectly"}
