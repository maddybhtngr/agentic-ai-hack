from fastapi import APIRouter, HTTPException
from typing import List
import json
import os
from models.emergency import (
    EmergencyContact, 
    EmergencyContactCreate, 
    EmergencyContactUpdate,
    NearbyService,
    NearbyServiceCreate,
    NearbyServiceUpdate,
    EmergencyData
)
from models.api_response import APIResponse

router = APIRouter(prefix="/emergency", tags=["emergency"])

# Path to the emergency.json file
EMERGENCY_FILE = os.path.join(os.path.dirname(__file__), "..", "repo", "emergency", "emergency.json")

def load_emergency_data():
    """Load emergency data from JSON file"""
    try:
        if not os.path.exists(EMERGENCY_FILE):
            # Create default emergency data if file doesn't exist
            default_data = {
                "emergency_contacts": [
                    {
                        "id": 1,
                        "name": "Emergency Hotline",
                        "number": "911",
                        "type": "Primary",
                        "status": "active",
                        "responseTime": "< 2 min",
                        "description": "Main emergency response line"
                    }
                ],
                "nearby_services": [
                    {
                        "id": 1,
                        "name": "City General Hospital",
                        "type": "Hospital",
                        "address": "123 Medical Center Dr, Downtown",
                        "phone": "+1 (555) 123-4567",
                        "mapsLink": "https://maps.google.com/?q=123+Medical+Center+Dr",
                        "description": "24/7 Emergency Department with trauma center",
                        "distance": "2.3 km"
                    }
                ]
            }
            os.makedirs(os.path.dirname(EMERGENCY_FILE), exist_ok=True)
            with open(EMERGENCY_FILE, 'w') as f:
                json.dump(default_data, f, indent=2)
            return default_data
        
        with open(EMERGENCY_FILE, 'r') as file:
            data = json.load(file)
            return data
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid emergency data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading emergency data: {str(e)}")

def save_emergency_data(data: dict):
    """Save emergency data to JSON file"""
    try:
        os.makedirs(os.path.dirname(EMERGENCY_FILE), exist_ok=True)
        with open(EMERGENCY_FILE, 'w') as file:
            json.dump(data, file, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving emergency data: {str(e)}")

def get_next_contact_id(contacts: List[dict]) -> int:
    """Get the next available ID for a new emergency contact"""
    if not contacts:
        return 1
    return max(contact["id"] for contact in contacts) + 1

def get_next_service_id(services: List[dict]) -> int:
    """Get the next available ID for a new nearby service"""
    if not services:
        return 1
    return max(service["id"] for service in services) + 1

@router.get("/", response_model=APIResponse)
async def get_all_emergency_data():
    """Get all emergency data (contacts and services)"""
    try:
        data = load_emergency_data()
        return APIResponse(
            success=True,
            message="Emergency data retrieved successfully",
            data=EmergencyData(**data)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load emergency data: {str(e)}")

# Emergency Contacts endpoints
@router.get("/contacts", response_model=APIResponse)
async def get_emergency_contacts():
    """Get all emergency contacts"""
    try:
        data = load_emergency_data()
        contacts = data.get("emergency_contacts", [])
        return APIResponse(
            success=True,
            message="Emergency contacts retrieved successfully",
            data=[EmergencyContact(**contact) for contact in contacts]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load emergency contacts: {str(e)}")

@router.get("/contacts/{contact_id}", response_model=APIResponse)
async def get_emergency_contact(contact_id: int):
    """Get a specific emergency contact by ID"""
    try:
        data = load_emergency_data()
        contacts = data.get("emergency_contacts", [])
        contact = next((contact for contact in contacts if contact["id"] == contact_id), None)
        
        if not contact:
            raise HTTPException(status_code=404, detail="Emergency contact not found")
        
        return APIResponse(
            success=True,
            message="Emergency contact retrieved successfully",
            data=EmergencyContact(**contact)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load emergency contact: {str(e)}")

@router.post("/contacts", response_model=APIResponse)
async def create_emergency_contact(contact_data: EmergencyContactCreate):
    """Create a new emergency contact"""
    try:
        data = load_emergency_data()
        contacts = data.get("emergency_contacts", [])
        
        new_contact = {
            "id": get_next_contact_id(contacts),
            **contact_data.dict()
        }
        
        contacts.append(new_contact)
        data["emergency_contacts"] = contacts
        save_emergency_data(data)
        
        return APIResponse(
            success=True,
            message="Emergency contact created successfully",
            data=EmergencyContact(**new_contact)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create emergency contact: {str(e)}")

@router.put("/contacts/{contact_id}", response_model=APIResponse)
async def update_emergency_contact(contact_id: int, contact_data: EmergencyContactUpdate):
    """Update an emergency contact"""
    try:
        data = load_emergency_data()
        contacts = data.get("emergency_contacts", [])
        
        # Find the contact to update
        contact_index = None
        for i, contact in enumerate(contacts):
            if contact.get("id") == contact_id:
                contact_index = i
                break
        
        if contact_index is None:
            raise HTTPException(status_code=404, detail="Emergency contact not found")
        
        # Update only provided fields
        update_data = contact_data.dict(exclude_unset=True)
        contacts[contact_index].update(update_data)
        
        data["emergency_contacts"] = contacts
        save_emergency_data(data)
        
        return APIResponse(
            success=True,
            message="Emergency contact updated successfully",
            data=EmergencyContact(**contacts[contact_index])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update emergency contact: {str(e)}")

@router.delete("/contacts/{contact_id}", response_model=APIResponse)
async def delete_emergency_contact(contact_id: int):
    """Delete an emergency contact"""
    try:
        data = load_emergency_data()
        contacts = data.get("emergency_contacts", [])
        
        # Find and remove the contact
        original_length = len(contacts)
        contacts = [contact for contact in contacts if contact.get("id") != contact_id]
        
        if len(contacts) == original_length:
            raise HTTPException(status_code=404, detail="Emergency contact not found")
        
        data["emergency_contacts"] = contacts
        save_emergency_data(data)
        
        return APIResponse(
            success=True,
            message="Emergency contact deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete emergency contact: {str(e)}")

# Nearby Services endpoints
@router.get("/services", response_model=APIResponse)
async def get_nearby_services():
    """Get all nearby services"""
    try:
        data = load_emergency_data()
        services = data.get("nearby_services", [])
        return APIResponse(
            success=True,
            message="Nearby services retrieved successfully",
            data=[NearbyService(**service) for service in services]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load nearby services: {str(e)}")

@router.get("/services/{service_id}", response_model=APIResponse)
async def get_nearby_service(service_id: int):
    """Get a specific nearby service by ID"""
    try:
        data = load_emergency_data()
        services = data.get("nearby_services", [])
        service = next((service for service in services if service["id"] == service_id), None)
        
        if not service:
            raise HTTPException(status_code=404, detail="Nearby service not found")
        
        return APIResponse(
            success=True,
            message="Nearby service retrieved successfully",
            data=NearbyService(**service)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load nearby service: {str(e)}")

@router.post("/services", response_model=APIResponse)
async def create_nearby_service(service_data: NearbyServiceCreate):
    """Create a new nearby service"""
    try:
        data = load_emergency_data()
        services = data.get("nearby_services", [])
        
        new_service = {
            "id": get_next_service_id(services),
            **service_data.dict()
        }
        
        services.append(new_service)
        data["nearby_services"] = services
        save_emergency_data(data)
        
        return APIResponse(
            success=True,
            message="Nearby service created successfully",
            data=NearbyService(**new_service)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create nearby service: {str(e)}")

@router.put("/services/{service_id}", response_model=APIResponse)
async def update_nearby_service(service_id: int, service_data: NearbyServiceUpdate):
    """Update a nearby service"""
    try:
        data = load_emergency_data()
        services = data.get("nearby_services", [])
        
        # Find the service to update
        service_index = None
        for i, service in enumerate(services):
            if service.get("id") == service_id:
                service_index = i
                break
        
        if service_index is None:
            raise HTTPException(status_code=404, detail="Nearby service not found")
        
        # Update only provided fields
        update_data = service_data.dict(exclude_unset=True)
        services[service_index].update(update_data)
        
        data["nearby_services"] = services
        save_emergency_data(data)
        
        return APIResponse(
            success=True,
            message="Nearby service updated successfully",
            data=NearbyService(**services[service_index])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update nearby service: {str(e)}")

@router.delete("/services/{service_id}", response_model=APIResponse)
async def delete_nearby_service(service_id: int):
    """Delete a nearby service"""
    try:
        data = load_emergency_data()
        services = data.get("nearby_services", [])
        
        # Find and remove the service
        original_length = len(services)
        services = [service for service in services if service.get("id") != service_id]
        
        if len(services) == original_length:
            raise HTTPException(status_code=404, detail="Nearby service not found")
        
        data["nearby_services"] = services
        save_emergency_data(data)
        
        return APIResponse(
            success=True,
            message="Nearby service deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete nearby service: {str(e)}") 