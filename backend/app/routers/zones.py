from fastapi import APIRouter, HTTPException
from typing import List
import json
import os
import random
from datetime import datetime

from models.zone import Zone, ZoneCreate, ZoneUpdate, ZoneType

router = APIRouter(prefix="/zones", tags=["zones"])

# Path to the zones.json file
ZONES_FILE = "app/repo/zones/zones.json"

def load_zones():
    """Load zones from JSON file"""
    try:
        if not os.path.exists(ZONES_FILE):
            # Create default zones if file doesn't exist
            default_zones = {
                "zones": [
                    {
                        "id": 1,
                        "name": "Main Entrance",
                        "zoneType": "entrance",
                        "x": 10,
                        "y": 10,
                        "width": 15,
                        "height": 15,
                        "centerLat": 40.7128,
                        "centerLng": -74.0060,
                        "radius": 50,
                        "maxCapacity": 200,
                        "createdAt": "2025-01-27T00:00:00.000Z",
                        "updatedAt": "2025-01-27T00:00:00.000Z"
                    }
                ]
            }
            os.makedirs(os.path.dirname(ZONES_FILE), exist_ok=True)
            with open(ZONES_FILE, 'w') as f:
                json.dump(default_zones, f, indent=2)
            return default_zones["zones"]
        
        with open(ZONES_FILE, 'r') as file:
            data = json.load(file)
            return data.get("zones", [])
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid zones data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading zones: {str(e)}")

def save_zones(zones: List[dict]):
    """Save zones to JSON file"""
    try:
        os.makedirs(os.path.dirname(ZONES_FILE), exist_ok=True)
        with open(ZONES_FILE, 'w') as file:
            json.dump({"zones": zones}, file, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving zones: {str(e)}")

def get_next_id(zones: List[dict]) -> int:
    """Get the next available ID for a new zone"""
    if not zones:
        return 1
    return max(zone["id"] for zone in zones) + 1

def generate_crowd_count(max_capacity: int) -> int:
    """Generate random crowd count for a zone
    
    Args:
        max_capacity: Maximum capacity of the zone
        
    Returns:
        Random count between 0 and 125% of max capacity
    """
    # Generate count between 0 and 125% of max capacity
    max_count = int(max_capacity * 1.25)
    return random.randint(0, max_count)

@router.get("/", response_model=List[Zone])
async def get_all_zones():
    """Get all zones"""
    zones = load_zones()
    return zones

@router.get("/types", response_model=List[str])
async def get_zone_types():
    """Get all available zone types"""
    return [zone_type.value for zone_type in ZoneType]

@router.get("/crowd/details")
async def get_all_zones_crowd_details():
    """Get crowd details for all zones with random count generation"""
    zones = load_zones()
    
    crowd_details = []
    for zone in zones:
        count = generate_crowd_count(zone["maxCapacity"])
        crowd_details.append({
            "count": count,
            "maxCapacity": zone["maxCapacity"],
            "zoneId": zone["id"],
            "zoneName": zone["name"],
            "lastUpdated": datetime.utcnow().isoformat() + "Z"
        })
    
    return {
        "zones": crowd_details,
        "totalZones": len(zones),
        "lastUpdated": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/{zone_id}", response_model=Zone)
async def get_zone(zone_id: int):
    """Get a specific zone by ID"""
    zones = load_zones()
    zone = next((zone for zone in zones if zone["id"] == zone_id), None)
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    return zone

@router.get("/{zone_id}/details")
async def get_zone_crowd_details(zone_id: int):
    """Get crowd details for a specific zone with random count generation"""
    zones = load_zones()
    zone = next((zone for zone in zones if zone["id"] == zone_id), None)
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    # Generate random crowd count
    count = generate_crowd_count(zone["maxCapacity"])
    
    return {
        "count": count,
        "maxCapacity": zone["maxCapacity"],
        "zoneId": zone_id,
        "zoneName": zone["name"],
        "lastUpdated": datetime.utcnow().isoformat() + "Z"
    }

@router.post("/", response_model=Zone)
async def create_zone(zone_data: ZoneCreate):
    """Create a new zone"""
    zones = load_zones()
    
    # Validate zone type
    if zone_data.zoneType not in ZoneType:
        raise HTTPException(status_code=400, detail="Invalid zone type")
    
    # Validate coordinates
    if not (0 <= zone_data.x <= 100 and 0 <= zone_data.y <= 100):
        raise HTTPException(status_code=400, detail="X and Y coordinates must be between 0 and 100")
    
    # Validate dimensions
    if not (1 <= zone_data.width <= 100):
        raise HTTPException(status_code=400, detail="Width must be between 1 and 100")
    
    if not (1 <= zone_data.height <= 100):
        raise HTTPException(status_code=400, detail="Height must be between 1 and 100")
    
    if not (-90 <= zone_data.centerLat <= 90):
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
    
    if not (-180 <= zone_data.centerLng <= 180):
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
    
    # Check for duplicate names
    if any(zone["name"] == zone_data.name for zone in zones):
        raise HTTPException(status_code=400, detail="Zone name already exists")
    
    new_zone = {
        "id": get_next_id(zones),
        "name": zone_data.name,
        "zoneType": zone_data.zoneType,
        "x": zone_data.x,
        "y": zone_data.y,
        "width": zone_data.width,
        "height": zone_data.height,
        "centerLat": zone_data.centerLat,
        "centerLng": zone_data.centerLng,
        "radius": zone_data.radius,
        "maxCapacity": zone_data.maxCapacity,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "updatedAt": datetime.utcnow().isoformat() + "Z"
    }
    
    zones.append(new_zone)
    save_zones(zones)
    
    return new_zone

@router.put("/{zone_id}", response_model=Zone)
async def update_zone(zone_id: int, zone_data: ZoneUpdate):
    """Update an existing zone"""
    zones = load_zones()
    zone_index = next((i for i, zone in enumerate(zones) if zone["id"] == zone_id), None)
    
    if zone_index is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    zone = zones[zone_index]
    
    # Update only provided fields
    update_data = zone_data.dict(exclude_unset=True)
    
    # Validate zone type if provided
    if "zoneType" in update_data and update_data["zoneType"] not in ZoneType:
        raise HTTPException(status_code=400, detail="Invalid zone type")
    
    # Validate coordinates if provided
    if "x" in update_data and not (0 <= update_data["x"] <= 100):
        raise HTTPException(status_code=400, detail="X coordinate must be between 0 and 100")
    
    if "y" in update_data and not (0 <= update_data["y"] <= 100):
        raise HTTPException(status_code=400, detail="Y coordinate must be between 0 and 100")
    
    if "width" in update_data and not (1 <= update_data["width"] <= 100):
        raise HTTPException(status_code=400, detail="Width must be between 1 and 100")
    
    if "height" in update_data and not (1 <= update_data["height"] <= 100):
        raise HTTPException(status_code=400, detail="Height must be between 1 and 100")
    
    if "centerLat" in update_data and not (-90 <= update_data["centerLat"] <= 90):
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
    
    if "centerLng" in update_data and not (-180 <= update_data["centerLng"] <= 180):
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
    
    # Check for duplicate names if name is being updated
    if "name" in update_data:
        if any(z["name"] == update_data["name"] and z["id"] != zone_id for z in zones):
            raise HTTPException(status_code=400, detail="Zone name already exists")
    
    # Update the zone
    for field, value in update_data.items():
        zone[field] = value
    
    zone["updatedAt"] = datetime.utcnow().isoformat() + "Z"
    
    save_zones(zones)
    
    return zone

@router.delete("/{zone_id}")
async def delete_zone(zone_id: int):
    """Delete a zone"""
    zones = load_zones()
    zone = next((zone for zone in zones if zone["id"] == zone_id), None)
    
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    # Remove the zone
    zones = [z for z in zones if z["id"] != zone_id]
    save_zones(zones)
    
    return {"success": True, "message": f"Zone '{zone['name']}' deleted successfully"} 