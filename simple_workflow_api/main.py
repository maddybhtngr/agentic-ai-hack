from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents import run_data_processing_workflow, run_content_analysis_workflow, run_crowd_monitoring_workflow
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Sequential Workflow API",
    description="API server with 2 endpoints triggering different ADK sequential workflows",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class WorkflowInput(BaseModel):
    text: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "This is sample text to process through the workflow"
            }
        }

class CrowdInput(BaseModel):
    crowd: str  # LOW, MODERATE, HIGH
    
    class Config:
        json_schema_extra = {
            "example": {
                "crowd": "HIGH"
            }
        }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Sequential Workflow API Server",
        "description": "2 endpoints with different ADK sequential workflows",
        "endpoints": {
            "data_processing": "/api/v1/process-data",
            "content_analysis": "/api/v1/analyze-content",
            "crowd_monitoring": "/api/v1/monitor-crowd"
        },
        "health_check": "/health"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Sequential Workflow API",
        "workflows_available": ["data_processing", "content_analysis", "crowd_monitoring"]
    }

# Endpoint 1: Data Processing Workflow (Extract → Validate → Format)
@app.post("/api/v1/process-data")
async def process_data(input_data: WorkflowInput):
    """
    Triggers the Data Processing Sequential Workflow:
    1. Extract data from input text
    2. Validate the extracted data  
    3. Format the final output
    """
    try:
        result = await run_data_processing_workflow(input_data.text)
        return {
            "success": True,
            "workflow_type": "data_processing",
            "description": "Sequential pipeline: Extract → Validate → Format",
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Data processing workflow failed: {str(e)}"
        )

# Endpoint 2: Content Analysis Workflow (Analyze → Summarize → Score)  
@app.post("/api/v1/analyze-content")
async def analyze_content(input_data: WorkflowInput):
    """
    Triggers the Content Analysis Sequential Workflow:
    1. Analyze content characteristics
    2. Summarize the content
    3. Score the content quality
    """
    try:
        result = await run_content_analysis_workflow(input_data.text)
        return {
            "success": True,
            "workflow_type": "content_analysis", 
            "description": "Sequential pipeline: Analyze → Summarize → Score",
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Content analysis workflow failed: {str(e)}"
        )

# Endpoint 3: Crowd Monitoring Workflow (Analyze Crowd → Incident Decision)
@app.post("/api/v1/monitor-crowd")
async def monitor_crowd(crowd_data: CrowdInput):
    """
    Triggers the Crowd Monitoring Sequential Workflow:
    1. Analyze crowd data and assess incident risk
    2. Make incident notification decision
    """
    try:
        # Convert Pydantic model to dict
        crowd_dict = crowd_data.dict()
        result = await run_crowd_monitoring_workflow(crowd_dict)
        return {
            "success": True,
            "workflow_type": "crowd_monitoring",
            "description": "Sequential pipeline: Analyze Crowd → Incident Decision",
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Crowd monitoring workflow failed: {str(e)}"
        )

# Get workflow information
@app.get("/api/v1/workflows")
async def get_workflow_info():
    """Get information about available workflows."""
    return {
        "available_workflows": {
            "data_processing": {
                "endpoint": "/api/v1/process-data",
                "description": "Extract → Validate → Format pipeline",
                "agents": ["data_extractor", "data_validator", "output_formatter"],
                "use_cases": ["Data cleaning", "Text processing", "Content validation"]
            },
            "content_analysis": {
                "endpoint": "/api/v1/analyze-content", 
                "description": "Analyze → Summarize → Score pipeline",
                "agents": ["content_analyzer", "content_summarizer", "content_scorer"],
                "use_cases": ["Content evaluation", "Quality scoring", "Text analysis"]
            },
            "crowd_monitoring": {
                "endpoint": "/api/v1/monitor-crowd",
                "description": "Analyze Crowd → Incident Decision pipeline", 
                "agents": ["crowd_data_analyzer", "incident_notifier"],
                "use_cases": ["Crowd safety monitoring", "Incident detection", "Emergency notifications"]
            }
        },
        "total_workflows": 3
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8002,
        reload=True
    ) 