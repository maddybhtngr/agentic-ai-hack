from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from routers import auth, user, zones, events, emergency, incidents

app = FastAPI(
    title="Crowd Management API",
    description="API for venue crowd management and monitoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving uploaded images
import os
static_dir = os.path.join(os.path.dirname(__file__), "data")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(zones.router)
app.include_router(events.router)
app.include_router(emergency.router)
app.include_router(incidents.router)

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