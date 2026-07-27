"""VeriGen API Entry Point."""
from fastapi import FastAPI
from .runtime.routes import router

app = FastAPI(
    title="VeriGen AI Media Engine",
    description="Production-grade AI media orchestration powered by Genblaze and Backblaze B2.",
    version="1.0.0"
)

app.include_router(router)

@app.get("/")
async def root():
    return {
        "name": "VeriGen API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }
