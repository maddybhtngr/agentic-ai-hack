from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Dict, Optional
import json
import os
import shutil
from datetime import datetime

from models.incident import Incident, IncidentCreate, IncidentUpdate, IncidentStatus, ReporterType, IncidentPriority, IncidentType
from models.api_response import APIResponse

router = APIRouter(prefix="/incidents", tags=["incidents"])

# Path to the incidents.json file
INCIDENTS_FILE = "app/repo/incidents/incidents.json"
# Path to store incident images
INCIDENT_IMAGES_DIR = "app/data/incidents"
# Path to zones.json file
ZONES_FILE = "app/repo/zones/zones.json"

def load_incidents() -> Dict[str, List[dict]]:
    """Load incidents from JSON file"""
    try:
        if not os.path.exists(INCIDENTS_FILE):
            # Create default structure if file doesn't exist
            default_incidents = {
                "reported": [],
                "assigned": [],
                "resolved": []
            }
            os.makedirs(os.path.dirname(INCIDENTS_FILE), exist_ok=True)
            with open(INCIDENTS_FILE, 'w') as f:
                json.dump(default_incidents, f, indent=2)
            return default_incidents
        
        with open(INCIDENTS_FILE, 'r') as file:
            data = json.load(file)
            return {
                "reported": data.get("reported", []),
                "assigned": data.get("assigned", []),
                "resolved": data.get("resolved", [])
            }
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid incidents data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading incidents: {str(e)}")

def save_incidents(incidents: Dict[str, List[dict]]):
    """Save incidents to JSON file"""
    try:
        os.makedirs(os.path.dirname(INCIDENTS_FILE), exist_ok=True)
        with open(INCIDENTS_FILE, 'w') as file:
            json.dump(incidents, file, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving incidents: {str(e)}")

def get_next_id(incidents: Dict[str, List[dict]]) -> int:
    """Get the next available ID for a new incident"""
    all_incidents = incidents["reported"] + incidents["assigned"] + incidents["resolved"]
    if not all_incidents:
        return 1
    return max(incident["id"] for incident in all_incidents) + 1

def save_incident_image(file: UploadFile, incident_id: int) -> str:
    """Save uploaded image for an incident"""
    try:
        # Create images directory if it doesn't exist
        os.makedirs(INCIDENT_IMAGES_DIR, exist_ok=True)
        
        # Get file extension
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.jpg'
        
        # Create filename with incident ID
        filename = f"{incident_id}{file_extension}"
        file_path = os.path.join(INCIDENT_IMAGES_DIR, filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the relative path for storage in JSON
        return f"/static/incidents/{filename}"
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving image: {str(e)}")

def load_zones() -> List[dict]:
    """Load zones from JSON file"""
    try:
        if not os.path.exists(ZONES_FILE):
            return []
        
        with open(ZONES_FILE, 'r') as file:
            data = json.load(file)
            return data.get("zones", [])
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid zones data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading zones: {str(e)}")

def validate_zone_id(zone_id: int) -> bool:
    """Validate if zone ID exists"""
    zones = load_zones()
    return any(zone["id"] == zone_id for zone in zones)

def find_incident_by_id(incidents: Dict[str, List[dict]], incident_id: int) -> tuple:
    """Find incident by ID and return (status, incident, index)"""
    for status in ["reported", "assigned", "resolved"]:
        for i, incident in enumerate(incidents[status]):
            if incident["id"] == incident_id:
                return status, incident, i
    return None, None, None

@router.get("/", response_model=APIResponse)
async def get_all_incidents():
    """Get all incidents across all statuses"""
    incidents = load_incidents()
    all_incidents = incidents["reported"] + incidents["assigned"] + incidents["resolved"]
    return APIResponse(
        success=True,
        message="All incidents retrieved successfully",
        data=all_incidents
    )

@router.get("/reported", response_model=APIResponse)
async def get_reported_incidents():
    """Get all reported incidents"""
    incidents = load_incidents()
    return APIResponse(
        success=True,
        message="Reported incidents retrieved successfully",
        data=incidents["reported"]
    )

@router.get("/assigned", response_model=APIResponse)
async def get_assigned_incidents():
    """Get all assigned incidents"""
    incidents = load_incidents()
    return APIResponse(
        success=True,
        message="Assigned incidents retrieved successfully",
        data=incidents["assigned"]
    )

@router.get("/resolved", response_model=APIResponse)
async def get_resolved_incidents():
    """Get all resolved incidents"""
    incidents = load_incidents()
    return APIResponse(
        success=True,
        message="Resolved incidents retrieved successfully",
        data=incidents["resolved"]
    )

@router.get("/{incident_id}", response_model=APIResponse)
async def get_incident(incident_id: int):
    """Get a specific incident by ID"""
    incidents = load_incidents()
    status, incident, _ = find_incident_by_id(incidents, incident_id)
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return APIResponse(
        success=True,
        message="Incident retrieved successfully",
        data=incident
    )

@router.post("/", response_model=APIResponse)
async def create_incident(
    reporter: str = Form(...),
    reporter_name: str = Form(...),
    incident_priority: str = Form(...),
    incident_type: str = Form(...),
    incident_summary: str = Form(...),
    incident_details: str = Form(...),
    additional_image: Optional[UploadFile] = File(None),
    zone_id: Optional[int] = Form(None),
    is_broadcast: bool = Form(False)
):
    """Create a new incident with optional image upload"""
    incidents = load_incidents()
    
    # Validate enums
    if reporter not in ReporterType:
        raise HTTPException(status_code=400, detail="Invalid reporter type")
    
    if incident_priority not in IncidentPriority:
        raise HTTPException(status_code=400, detail="Invalid incident priority")
    
    if incident_type not in IncidentType:
        raise HTTPException(status_code=400, detail="Invalid incident type")
    
    # Validate zone_id if provided and not broadcasting
    if not is_broadcast and zone_id is not None:
        if not validate_zone_id(zone_id):
            raise HTTPException(status_code=400, detail="Invalid zone ID")
    elif is_broadcast:
        zone_id = None  # Set zone_id to None when broadcasting
    
    # Get next ID for the incident
    incident_id = get_next_id(incidents)
    
    # Handle image upload if provided
    image_path = None
    if additional_image:
        image_path = save_incident_image(additional_image, incident_id)
    
    new_incident = {
        "id": incident_id,
        "reporter": reporter,
        "reporter_name": reporter_name,
        "incident_priority": incident_priority,
        "incident_type": incident_type,
        "status": "REPORTED",
        "resolver": None,
        "creation_time": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "incident_summary": incident_summary,
        "incident_details": incident_details,
        "additional_image": image_path,
        "zone_id": zone_id,
        "is_broadcast": is_broadcast
    }
    
    # Add to reported incidents
    incidents["reported"].append(new_incident)
    save_incidents(incidents)
    
    return APIResponse(
        success=True,
        message="Incident created successfully",
        data=new_incident
    )

@router.put("/{incident_id}", response_model=APIResponse)
async def update_incident(incident_id: int, incident_data: IncidentUpdate):
    """Update an existing incident"""
    incidents = load_incidents()
    status, incident, index = find_incident_by_id(incidents, incident_id)
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Update only provided fields
    update_data = incident_data.dict(exclude_unset=True)
    
    # Handle status changes
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status not in IncidentStatus:
            raise HTTPException(status_code=400, detail="Invalid incident status")
        
        # Remove from current status list
        incidents[status.lower()].pop(index)
        
        # Add to new status list
        incident["status"] = new_status
        incidents[new_status.lower()].append(incident)
        status = new_status.lower()
    
    # Update other fields
    for field, value in update_data.items():
        if field != "status":
            incident[field] = value
    
    incident["updated_at"] = datetime.utcnow().isoformat() + "Z"
    
    save_incidents(incidents)
    
    return APIResponse(
        success=True,
        message="Incident updated successfully",
        data=incident
    )

@router.delete("/{incident_id}", response_model=APIResponse)
async def delete_incident(incident_id: int):
    """Delete an incident"""
    incidents = load_incidents()
    status, incident, index = find_incident_by_id(incidents, incident_id)
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Remove from current status list
    incidents[status].pop(index)
    save_incidents(incidents)
    
    return APIResponse(
        success=True,
        message=f"Incident '{incident['incident_summary']}' deleted successfully",
        data=None
    )

@router.post("/{incident_id}/assign", response_model=APIResponse)
async def assign_incident(incident_id: int, resolver_data: dict):
    """Assign an incident to a resolver"""
    incidents = load_incidents()
    status, incident, index = find_incident_by_id(incidents, incident_id)
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    if incident["status"] != "REPORTED":
        raise HTTPException(status_code=400, detail="Only reported incidents can be assigned")
    
    # Remove from reported list
    incidents["reported"].pop(index)
    
    # Update incident
    incident["status"] = "ASSIGNED"
    incident["resolver"] = resolver_data.get("resolver")
    incident["updated_at"] = datetime.utcnow().isoformat() + "Z"
    
    # Add to assigned list
    incidents["assigned"].append(incident)
    save_incidents(incidents)
    
    return APIResponse(
        success=True,
        message=f"Incident assigned to {resolver_data.get('resolver')} successfully",
        data=incident
    )

@router.post("/{incident_id}/resolve", response_model=APIResponse)
async def resolve_incident(incident_id: int):
    """Mark an incident as resolved"""
    incidents = load_incidents()
    status, incident, index = find_incident_by_id(incidents, incident_id)
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    if incident["status"] != "ASSIGNED":
        raise HTTPException(status_code=400, detail="Only assigned incidents can be resolved")
    
    # Remove from assigned list
    incidents["assigned"].pop(index)
    
    # Update incident
    incident["status"] = "RESOLVED"
    incident["updated_at"] = datetime.utcnow().isoformat() + "Z"
    
    # Add to resolved list
    incidents["resolved"].append(incident)
    save_incidents(incidents)
    
    return APIResponse(
        success=True,
        message="Incident resolved successfully",
        data=incident
    )

@router.get("/zones/available", response_model=APIResponse)
async def get_available_zones():
    """Get available zones for incident assignment"""
    zones = load_zones()
    return APIResponse(
        success=True,
        message="Available zones retrieved successfully",
        data=zones
    )

@router.get("/stats/summary", response_model=APIResponse)
async def get_incident_stats():
    """Get incident statistics"""
    incidents = load_incidents()
    
    stats = {
        "total_incidents": len(incidents["reported"]) + len(incidents["assigned"]) + len(incidents["resolved"]),
        "reported_count": len(incidents["reported"]),
        "assigned_count": len(incidents["assigned"]),
        "resolved_count": len(incidents["resolved"]),
        "critical_count": 0,
        "moderate_count": 0,
        "general_count": 0
    }
    
    # Count by priority
    all_incidents = incidents["reported"] + incidents["assigned"] + incidents["resolved"]
    for incident in all_incidents:
        priority = incident.get("incident_priority", "GENERAL")
        if priority == "CRITICAL":
            stats["critical_count"] += 1
        elif priority == "MODERATE":
            stats["moderate_count"] += 1
        else:
            stats["general_count"] += 1
    
    return APIResponse(
        success=True,
        message="Incident statistics retrieved successfully",
        data=stats
    ) 