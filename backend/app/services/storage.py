import shutil
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_upload(upload_file: UploadFile) -> str:
    """
    Saves the uploaded file to disk and returns the relative path.
    """
    try:
        file_path = UPLOAD_DIR / upload_file.filename
        # Avoid overwriting existing files with same name? For MVP, maybe overwrite or append timestamp.
        # Let's append timestamp to be safe.
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        safe_filename = f"{timestamp}_{upload_file.filename}"
        file_path = UPLOAD_DIR / safe_filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        return str(file_path)
    finally:
        upload_file.file.close()
