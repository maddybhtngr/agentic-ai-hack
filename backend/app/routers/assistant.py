import json
import os
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from pathlib import Path

router = APIRouter(prefix="/assistant", tags=["Assistant"])

class AssistantQuery(BaseModel):
    query: str

class AssistantResponse(BaseModel):
    response: str
    tools_used: List[str] = []

# Path to JSON data files
REPO_PATH = Path(__file__).parent.parent / "repo"

# Tool definitions for Gemini
TOOLS = [
    {
        "functionDeclarations": [
            {
                "name": "get_event_details",
                "description": "Get information about the current event including details, schedule, and capacity.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "get_incidents",
                "description": "Get information about reported, assigned, and resolved incidents.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "status": {
                            "type": "string",
                            "enum": ["reported", "assigned", "resolved", "all"],
                            "description": "Filter incidents by status"
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["CRITICAL", "MODERATE", "GENERAL"],
                            "description": "Filter incidents by priority"
                        },
                        "type": {
                            "type": "string",
                            "enum": ["SECURITY REQUIRED", "CROWD OVERFLOW"],
                            "description": "Filter incidents by type"
                        }
                    },
                    "required": []
                }
            },
            {
                "name": "get_zones",
                "description": "Get information about venue zones including capacity, location, and type.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "zone_type": {
                            "type": "string",
                            "enum": ["entrance", "exit", "vip_area", "stage_area", "rest_area", "food_court"],
                            "description": "Filter zones by type"
                        }
                    },
                    "required": []
                }
            },
            {
                "name": "get_users",
                "description": "Get information about users including admins, staff, and attendees.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_type": {
                            "type": "string",
                            "enum": ["admin", "staff", "attendee"],
                            "description": "Filter users by type"
                        },
                        "role": {
                            "type": "string",
                            "description": "Filter users by role"
                        }
                    },
                    "required": []
                }
            },
            {
                "name": "get_emergency_contacts",
                "description": "Get emergency contact information and nearby services.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "service_type": {
                            "type": "string",
                            "enum": ["Police", "Hospital"],
                            "description": "Filter by service type"
                        }
                    },
                    "required": []
                }
            }
        ]
    }
]

def load_json_file(file_path: Path) -> Dict[str, Any]:
    """Load JSON data from file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        return {"error": f"Failed to load {file_path}: {str(e)}"}

def get_event_details(**kwargs) -> Dict[str, Any]:
    """Get event details from JSON file."""
    file_path = REPO_PATH / "events" / "events.json"
    return load_json_file(file_path)

def get_incidents(status: str = "all", priority: Optional[str] = None, type: Optional[str] = None, **kwargs) -> Dict[str, Any]:
    """Get incidents from JSON file with optional filtering."""
    file_path = REPO_PATH / "incidents" / "incidents.json"
    data = load_json_file(file_path)
    
    if "error" in data:
        return data
    
    # Filter incidents based on parameters
    filtered_data = {}
    
    for status_key in ["reported", "assigned", "resolved"]:
        if status == "all" or status == status_key:
            incidents = data.get(status_key, [])
            
            # Apply filters
            if priority:
                incidents = [inc for inc in incidents if inc.get("incident_priority") == priority]
            if type:
                incidents = [inc for inc in incidents if inc.get("incident_type") == type]
            
            filtered_data[status_key] = incidents
    
    return filtered_data

def get_zones(zone_type: Optional[str] = None, **kwargs) -> Dict[str, Any]:
    """Get zones from JSON file with optional filtering."""
    file_path = REPO_PATH / "zones" / "zones.json"
    data = load_json_file(file_path)
    
    if "error" in data:
        return data
    
    zones = data.get("zones", [])
    
    if zone_type:
        zones = [zone for zone in zones if zone.get("zoneType") == zone_type]
    
    return {"zones": zones}

def get_users(user_type: Optional[str] = None, role: Optional[str] = None, **kwargs) -> Dict[str, Any]:
    """Get users from JSON file with optional filtering."""
    file_path = REPO_PATH / "users" / "users.json"
    data = load_json_file(file_path)
    
    if "error" in data:
        return data
    
    filtered_data = {}
    
    for user_key in ["admins", "staff", "attendees"]:
        users = data.get(user_key, [])
        
        # Apply filters
        if user_type:
            if user_key == user_type + "s":  # Convert singular to plural
                filtered_data[user_key] = users
        elif role:
            users = [user for user in users if user.get("role") == role]
            if users:
                filtered_data[user_key] = users
        else:
            filtered_data[user_key] = users
    
    return filtered_data

def get_emergency_contacts(service_type: Optional[str] = None, **kwargs) -> Dict[str, Any]:
    """Get emergency contacts from JSON file with optional filtering."""
    file_path = REPO_PATH / "emergency" / "emergency.json"
    data = load_json_file(file_path)
    
    if "error" in data:
        return data
    
    filtered_data = {}
    
    # Filter emergency contacts
    contacts = data.get("emergency_contacts", [])
    if service_type:
        contacts = [contact for contact in contacts if contact.get("type") == service_type]
    filtered_data["emergency_contacts"] = contacts
    
    # Filter nearby services
    services = data.get("nearby_services", [])
    if service_type:
        services = [service for service in services if service.get("type") == service_type]
    filtered_data["nearby_services"] = services
    
    return filtered_data

# Tool function mapping
TOOL_FUNCTIONS = {
    "get_event_details": get_event_details,
    "get_incidents": get_incidents,
    "get_zones": get_zones,
    "get_users": get_users,
    "get_emergency_contacts": get_emergency_contacts
}

async def call_gemini_api_with_tools(query: str) -> str:
    """Call Gemini API with proper tool calling implementation."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Error: GEMINI_API_KEY environment variable not set"
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    
    # First call to Gemini to get tool calls
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"""You are an AI assistant for a crowd management system. 
                        You have access to various data sources about events, incidents, zones, users, and emergency contacts.
                        Please help the user with their query: {query}
                        
                        Use the available tools to gather relevant information and provide a comprehensive response."""
                    }
                ]
            }
        ],
        "tools": TOOLS
    }
    
    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # First call to get tool calls
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            # Check if Gemini wants to call tools
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                content = candidate.get("content", {})
                
                # Check for tool calls
                if "parts" in content:
                    for part in content["parts"]:
                        if "functionCall" in part:
                            function_call = part["functionCall"]
                            function_name = function_call.get("name")
                            args = function_call.get("args", {})
                            
                            # Execute the tool function
                            if function_name in TOOL_FUNCTIONS:
                                tool_result = TOOL_FUNCTIONS[function_name](**args)
                                
                                # Second call to Gemini with tool results
                                follow_up_payload = {
                                    "contents": [
                                        {
                                            "role": "user",
                                            "parts": [
                                                {
                                                    "text": f"""Query: {query}
                                                    
                                                    Tool called: {function_name}
                                                    Arguments: {json.dumps(args)}
                                                    Tool result: {json.dumps(tool_result, indent=2)}
                                                    
                                                    Please provide a helpful response based on this data."""
                                                }
                                            ]
                                        }
                                    ]
                                }
                                
                                follow_up_response = await client.post(url, json=follow_up_payload, headers=headers)
                                follow_up_response.raise_for_status()
                                follow_up_result = follow_up_response.json()
                                
                                if "candidates" in follow_up_result and len(follow_up_result["candidates"]) > 0:
                                    follow_up_content = follow_up_result["candidates"][0].get("content", {})
                                    follow_up_parts = follow_up_content.get("parts", [])
                                    if follow_up_parts and len(follow_up_parts) > 0:
                                        return follow_up_parts[0].get("text", "No response generated")
                
                # If no tool calls, extract direct response
                parts = content.get("parts", [])
                if parts and len(parts) > 0:
                    return parts[0].get("text", "No response generated")
            
            return "No response generated from Gemini API"
            
    except Exception as e:
        return f"Error calling Gemini API: {str(e)}"

async def call_gemini_api(query: str, tools_used: List[str] = []) -> str:
    """Call Gemini API with tool calling."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Error: GEMINI_API_KEY environment variable not set"
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    
    # Prepare the request payload
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"""You are an AI assistant for a crowd management system. 
                        You have access to various data sources about events, incidents, zones, users, and emergency contacts.
                        Please help the user with their query: {query}
                        
                        If tools were used to gather data, here are the results:
                        {json.dumps(tools_used, indent=2) if tools_used else "No tools were used."}
                        
                        Provide a helpful, informative response based on the available data."""
                    }
                ]
            }
        ],
        "tools": TOOLS
    }
    
    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            
            # Extract the response text
            if "candidates" in result and len(result["candidates"]) > 0:
                content = result["candidates"][0].get("content", {})
                parts = content.get("parts", [])
                if parts and len(parts) > 0:
                    return parts[0].get("text", "No response generated")
            
            return "No response generated from Gemini API"
            
    except Exception as e:
        return f"Error calling Gemini API: {str(e)}"

@router.post("/", response_model=AssistantResponse)
async def assistant_query(query_request: AssistantQuery):
    """
    Process a query using AI assistant with tool calling capabilities.
    
    The assistant can access:
    - Event details and schedule
    - Incident reports and status
    - Zone information and capacity
    - User data (admins, staff, attendees)
    - Emergency contacts and nearby services
    """
    try:
        # Use the advanced tool calling implementation
        response = await call_gemini_api_with_tools(query_request.query)
        
        # For tracking purposes, we'll check what tools might have been used
        query = query_request.query.lower()
        tools_used = []
        
        # Simple keyword detection for tracking (not used for actual tool calling)
        if any(word in query for word in ["event", "schedule", "venue", "capacity"]):
            tools_used.append("get_event_details")
        
        if any(word in query for word in ["incident", "report", "security", "crowd"]):
            tools_used.append("get_incidents")
        
        if any(word in query for word in ["zone", "area", "location"]):
            tools_used.append("get_zones")
        
        if any(word in query for word in ["user", "staff", "attendee", "admin"]):
            tools_used.append("get_users")
        
        if any(word in query for word in ["emergency", "contact", "hospital", "police"]):
            tools_used.append("get_emergency_contacts")
        
        return AssistantResponse(
            response=response,
            tools_used=tools_used
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant error: {str(e)}")

@router.get("/tools")
async def get_available_tools():
    """Get list of available tools for the assistant."""
    return {
        "tools": [
            {
                "name": tool["functionDeclarations"][0]["name"],
                "description": tool["functionDeclarations"][0]["description"]
            }
            for tool in TOOLS
        ]
    } 