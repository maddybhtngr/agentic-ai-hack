from fastapi import APIRouter, HTTPException
from typing import List
import json
import os
from models.event import (
    EventDetails, 
    EventDetailsUpdate, 
    ScheduleItem, 
    ScheduleItemCreate, 
    ScheduleItemUpdate,
    EventData
)
from models.api_response import APIResponse

router = APIRouter(prefix="/events", tags=["events"])

EVENTS_FILE = os.path.join(os.path.dirname(__file__), "..", "repo", "events", "events.json")

def load_events():
    """Load events data from JSON file"""
    try:
        if os.path.exists(EVENTS_FILE):
            with open(EVENTS_FILE, 'r') as f:
                return json.load(f)
        else:
            # Create default events file if it doesn't exist
            default_events = {
                "event_details": {
                    "name": "Tech Conference 2024",
                    "date": "December 15, 2024",
                    "time": "9:00 AM - 6:00 PM",
                    "location": "Convention Center, Downtown",
                    "address": "123 Main Street, City, State 12345",
                    "capacity": 500,
                    "registered": 342,
                    "description": "Annual technology conference featuring keynote speakers, workshops, and networking opportunities.",
                    "organizer": "Tech Events Inc.",
                    "contact": "+1 (555) 123-4567",
                    "email": "info@techconference.com",
                    "website": "www.techconference.com",
                    "status": "active",
                    "type": "Conference",
                    "category": "Technology"
                },
                "event_schedule": []
            }
            save_events(default_events)
            return default_events
    except Exception as e:
        print(f"Error loading events: {e}")
        return {"event_details": {}, "event_schedule": []}

def save_events(events_data):
    """Save events data to JSON file"""
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(EVENTS_FILE), exist_ok=True)
        with open(EVENTS_FILE, 'w') as f:
            json.dump(events_data, f, indent=2)
    except Exception as e:
        print(f"Error saving events: {e}")
        raise HTTPException(status_code=500, detail="Failed to save events data")

def get_next_schedule_id():
    """Get next available schedule item ID"""
    events_data = load_events()
    schedule = events_data.get("event_schedule", [])
    if not schedule:
        return 1
    return max(item.get("id", 0) for item in schedule) + 1

@router.get("/", response_model=APIResponse)
async def get_events():
    """Get all event data (details and schedule)"""
    try:
        events_data = load_events()
        return APIResponse(
            success=True,
            message="Events data retrieved successfully",
            data=EventData(**events_data)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load events: {str(e)}")

@router.get("/details", response_model=APIResponse)
async def get_event_details():
    """Get event details only"""
    try:
        events_data = load_events()
        return APIResponse(
            success=True,
            message="Event details retrieved successfully",
            data=EventDetails(**events_data.get("event_details", {}))
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load event details: {str(e)}")

@router.put("/details", response_model=APIResponse)
async def update_event_details(details: EventDetailsUpdate):
    """Update event details"""
    try:
        events_data = load_events()
        current_details = events_data.get("event_details", {})
        
        # Update only provided fields
        update_data = details.dict(exclude_unset=True)
        current_details.update(update_data)
        
        events_data["event_details"] = current_details
        save_events(events_data)
        
        return APIResponse(
            success=True,
            message="Event details updated successfully",
            data=EventDetails(**current_details)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update event details: {str(e)}")

@router.get("/schedule", response_model=APIResponse)
async def get_event_schedule():
    """Get event schedule"""
    try:
        events_data = load_events()
        schedule = events_data.get("event_schedule", [])
        return APIResponse(
            success=True,
            message="Event schedule retrieved successfully",
            data=[ScheduleItem(**item) for item in schedule]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load event schedule: {str(e)}")

@router.post("/schedule", response_model=APIResponse)
async def add_schedule_item(item: ScheduleItemCreate):
    """Add a new schedule item"""
    try:
        events_data = load_events()
        schedule = events_data.get("event_schedule", [])
        
        new_item = {
            "id": get_next_schedule_id(),
            **item.dict()
        }
        
        schedule.append(new_item)
        events_data["event_schedule"] = schedule
        save_events(events_data)
        
        return APIResponse(
            success=True,
            message="Schedule item added successfully",
            data=ScheduleItem(**new_item)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add schedule item: {str(e)}")

@router.put("/schedule/{item_id}", response_model=APIResponse)
async def update_schedule_item(item_id: int, item: ScheduleItemUpdate):
    """Update a schedule item"""
    try:
        events_data = load_events()
        schedule = events_data.get("event_schedule", [])
        
        # Find the item to update
        item_index = None
        for i, schedule_item in enumerate(schedule):
            if schedule_item.get("id") == item_id:
                item_index = i
                break
        
        if item_index is None:
            raise HTTPException(status_code=404, detail="Schedule item not found")
        
        # Update only provided fields
        update_data = item.dict(exclude_unset=True)
        schedule[item_index].update(update_data)
        
        events_data["event_schedule"] = schedule
        save_events(events_data)
        
        return APIResponse(
            success=True,
            message="Schedule item updated successfully",
            data=ScheduleItem(**schedule[item_index])
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update schedule item: {str(e)}")

@router.delete("/schedule/{item_id}", response_model=APIResponse)
async def delete_schedule_item(item_id: int):
    """Delete a schedule item"""
    try:
        events_data = load_events()
        schedule = events_data.get("event_schedule", [])
        
        # Find and remove the item
        original_length = len(schedule)
        schedule = [item for item in schedule if item.get("id") != item_id]
        
        if len(schedule) == original_length:
            raise HTTPException(status_code=404, detail="Schedule item not found")
        
        events_data["event_schedule"] = schedule
        save_events(events_data)
        
        return APIResponse(
            success=True,
            message="Schedule item deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete schedule item: {str(e)}") 