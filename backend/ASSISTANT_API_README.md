# Assistant API Documentation

The Assistant API provides an intelligent interface to query the crowd management system's data using AI-powered tool calling with Google's Gemini API.

## Overview

The Assistant API can access and provide information about:
- **Events**: Event details, schedule, capacity, and registration
- **Incidents**: Reported, assigned, and resolved incidents with filtering
- **Zones**: Venue zones with capacity, location, and type information
- **Users**: Admins, staff, and attendees with their details
- **Emergency Contacts**: Emergency services and nearby facilities

## Setup

### Prerequisites

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Set your Gemini API key as an environment variable:
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```

3. Start the backend server:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

## API Endpoints

### POST /assistant

Process a query using AI assistant with tool calling capabilities.

**Request Body:**
```json
{
  "query": "What are the event details?"
}
```

**Response:**
```json
{
  "response": "Based on the event data, here are the details...",
  "tools_used": ["get_event_details"]
}
```

### GET /assistant/tools

Get list of available tools for the assistant.

**Response:**
```json
{
  "tools": [
    {
      "name": "get_event_details",
      "description": "Get information about the current event including details, schedule, and capacity."
    },
    {
      "name": "get_incidents",
      "description": "Get information about reported, assigned, and resolved incidents."
    },
    // ... more tools
  ]
}
```

## Available Tools

### 1. get_event_details
Retrieves comprehensive event information including:
- Event name, date, time, location
- Capacity and registration numbers
- Event schedule
- Organizer details

**Example Query:** "What are the event details?"

### 2. get_incidents
Retrieves incident information with optional filtering:
- **Status**: reported, assigned, resolved, all
- **Priority**: CRITICAL, MODERATE, GENERAL
- **Type**: SECURITY REQUIRED, CROWD OVERFLOW

**Example Queries:**
- "Show me all incidents"
- "Are there any critical incidents?"
- "What security incidents are reported?"

### 3. get_zones
Retrieves zone information with optional filtering:
- **Zone Types**: entrance, exit, vip_area, stage_area, rest_area, food_court
- Zone capacity and location details

**Example Queries:**
- "What zones are available?"
- "What is the capacity of the main arena?"
- "Show me all food court zones"

### 4. get_users
Retrieves user information with optional filtering:
- **User Types**: admin, staff, attendee
- **Roles**: Security, Administrator, Event Attendee, etc.

**Example Queries:**
- "Who are the staff members?"
- "Show me all attendees"
- "Who are the security staff?"

### 5. get_emergency_contacts
Retrieves emergency contact information:
- **Service Types**: Police, Hospital
- Emergency hotlines and nearby services

**Example Queries:**
- "What emergency contacts are available?"
- "Where is the nearest hospital?"
- "What police contacts are available?"

## Usage Examples

### Using curl

```bash
# Basic query
curl -X POST "http://localhost:8000/assistant" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the event details?"}'

# Query with specific information request
curl -X POST "http://localhost:8000/assistant" \
  -H "Content-Type: application/json" \
  -d '{"query": "Are there any critical incidents that need attention?"}'

# Get available tools
curl -X GET "http://localhost:8000/assistant/tools"
```

### Using Python

```python
import requests

# Test the assistant
def query_assistant(query):
    response = requests.post(
        "http://localhost:8000/assistant",
        json={"query": query}
    )
    return response.json()

# Example usage
result = query_assistant("What is the current event status?")
print(result["response"])
print(f"Tools used: {result['tools_used']}")
```

### Using JavaScript/Fetch

```javascript
// Query the assistant
async function queryAssistant(query) {
    const response = await fetch('http://localhost:8000/assistant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
    });
    return await response.json();
}

// Example usage
const result = await queryAssistant("Show me all zones and their capacities");
console.log(result.response);
console.log("Tools used:", result.tools_used);
```

## Testing

Run the test script to see the assistant in action:

```bash
cd backend
python test_assistant.py
```

This will test various queries and show how the assistant responds with different types of information.

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Successful response
- `500`: Internal server error (check logs for details)

Common issues:
1. **Missing GEMINI_API_KEY**: Set the environment variable
2. **Invalid API key**: Check your Gemini API key
3. **Server not running**: Start the backend server first

## Data Sources

The assistant reads from JSON files in the `/repo` directory:
- `/repo/events/events.json` - Event information
- `/repo/incidents/incidents.json` - Incident reports
- `/repo/zones/zones.json` - Zone configurations
- `/repo/users/users.json` - User data
- `/repo/emergency/emergency.json` - Emergency contacts

## Advanced Features

### Tool Calling
The assistant uses Gemini's tool calling feature to:
1. Analyze the user's query
2. Determine which tools are needed
3. Call the appropriate tools with parameters
4. Provide a comprehensive response based on the data

### Intelligent Filtering
The assistant can apply filters to data based on:
- Time ranges
- Priority levels
- Status categories
- User types
- Zone types

### Context Awareness
The assistant maintains context about:
- Current event status
- Active incidents
- Zone capacities
- Staff assignments

## Security Notes

- The API key should be kept secure and not exposed in client-side code
- Consider implementing authentication for production use
- The assistant only reads data, it doesn't modify any information
- All data access is logged for audit purposes

## Troubleshooting

1. **Assistant not responding**: Check if GEMINI_API_KEY is set
2. **Empty responses**: Verify the JSON data files exist and are readable
3. **Tool calling errors**: Check the tool function implementations
4. **Network errors**: Ensure the backend server is running on the correct port 