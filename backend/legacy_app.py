"""Deprecated entrypoint. Use app.main:app instead."""

from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
def check_health():
    return {"status": "Deprecated. Use app.main:app"}