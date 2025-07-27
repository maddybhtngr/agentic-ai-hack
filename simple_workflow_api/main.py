from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents import run_crowd_monitoring_workflow
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Crowd Monitoring API",
    description="Real-time crowd monitoring system using ADK sequential workflows",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No request models needed - using GET endpoint for crowd monitoring

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Crowd Monitoring API Server",
        "description": "Real-time crowd monitoring with ADK workflow integration",
        "endpoints": {
            "crowd_monitoring": "/api/v1/monitor-crowd"
        },
        "backend_integration": "https://backend-service-178028895966.us-central1.run.app/zones/crowd/details",
        "health_check": "/health"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Crowd Monitoring API",
        "workflows_available": ["crowd_monitoring"],
        "backend_connection": "https://backend-service-178028895966.us-central1.run.app"
    }

# Main Endpoint: Real-time Crowd Monitoring Workflow
@app.get("/api/v1/monitor-crowd")
async def monitor_crowd():
    """
    Triggers the Real-time Crowd Monitoring Sequential Workflow:
    1. Fetch live crowd data from backend API
    2. Analyze crowd density and assess incident risk
    3. Make incident notification decision
    
    Returns real-time crowd analysis with notification recommendations.
    """
    try:
        result = await run_crowd_monitoring_workflow()
        
        # Extract card metrics for frontend integration
        card_metrics = result.get("card_metrics", {})
        
        return {
            "success": True,
            "workflow_type": "crowd_monitoring",
            "description": "Real-time pipeline: Fetch Live Data → Analyze Density → Incident Decision",
            "data": result,
            # Frontend card integration
            "ui_metrics": {
                "confidence_percentage": card_metrics.get("overall_confidence", 90),
                "accuracy_percentage": card_metrics.get("prediction_accuracy", 90), 
                "model_performance": card_metrics.get("model_performance", 90),
                "status": "active",
                "last_updated": "real-time"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Crowd monitoring workflow failed: {str(e)}"
        )

# Get workflow information
@app.get("/api/v1/workflow-info")
async def get_workflow_info():
    """Get information about the crowd monitoring workflow."""
    return {
        "workflow": {
            "name": "Real-time Crowd Monitoring",
            "endpoint": "/api/v1/monitor-crowd",
            "method": "GET",
            "description": "Fetch Live Data → Analyze Density → Incident Decision",
            "agents": ["crowd_data_analyzer", "incident_notifier"],
            "data_source": "https://backend-service-178028895966.us-central1.run.app/zones/crowd/details",
            "density_levels": ["LOW", "MODERATE", "HIGH", "OVERFLOWING"],
            "use_cases": [
                "Real-time crowd safety monitoring",
                "Automatic incident detection", 
                "Emergency notification decisions",
                "Zone-based capacity management"
            ]
        },
        "density_calculation": {
            "LOW": "0-50% of capacity",
            "MODERATE": "51-80% of capacity", 
            "HIGH": "81-100% of capacity",
            "OVERFLOWING": ">100% of capacity"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8002,
        reload=True
    ) 