from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from routers.auth import router as auth_router
from routers.user import router as user_router
from routers.zones import router as zones_router
from routers.events import router as events_router
from routers.emergency import router as emergency_router
from routers.incidents import router as incidents_router
from routers.cctv import router as cctv_router
from routers.assistant import router as assistant_router

app = FastAPI(
    title="Crowd Management API",
    description="API for venue crowd management and monitoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving uploaded images
import os
static_dir = os.path.join(os.path.dirname(__file__), "data")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(zones_router)
app.include_router(events_router)
app.include_router(emergency_router)
app.include_router(incidents_router)
app.include_router(cctv_router)
app.include_router(assistant_router)

@app.get("/")
async def root():
    return {"message": "Crowd Management API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    import sys
    import os
    # Add the parent directory to Python path so we can import app
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 