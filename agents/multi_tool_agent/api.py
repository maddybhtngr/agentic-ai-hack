from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from orchestrator import WorkflowOrchestrator
import uvicorn

app = FastAPI(title="Multi-Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = WorkflowOrchestrator()

class UserInput(BaseModel):
    text: str

class WorkflowForce(BaseModel):
    text: str
    workflow: str

@app.get("/")
async def root():
    return {
        "message": "Multi-Agent API",
        "endpoints": ["/api/v1/process", "/api/v1/compare", "/api/v1/workflows", "/health"]
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/v1/process")
async def process_input(user_input: UserInput):
    try:
        result = await orchestrator.process_input(user_input.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/compare")
async def compare_workflows(user_input: UserInput):
    try:
        result = await orchestrator.compare_workflows(user_input.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/workflows")
async def get_workflows():
    return orchestrator.get_workflow_info()

@app.post("/api/v1/intent-analysis")
async def force_intent_analysis(user_input: UserInput):
    try:
        result = await orchestrator.process_input(user_input.text, force_workflow="intent_analysis")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/incident-response")
async def force_incident_response(user_input: UserInput):
    try:
        result = await orchestrator.process_input(user_input.text, force_workflow="incident_response")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
