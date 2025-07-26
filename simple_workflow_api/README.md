# Real-time Crowd Monitoring API

A FastAPI server integrated with Google ADK that provides real-time crowd monitoring and incident detection.

## Project Structure

```
simple_workflow_api/
├── agents.py           # ADK crowd monitoring workflow and agents
├── main.py            # FastAPI server with crowd monitoring endpoint  
├── requirements.txt   # Python dependencies
├── .env              # Environment configuration
└── README.md         # This file
```

## Features

🔄 **Real-time Integration** - Fetches live crowd data from backend API  
🤖 **ADK Workflow** - Uses Google Agent Development Kit for intelligent analysis  
📊 **Density Calculation** - Categorizes zones as LOW/MODERATE/HIGH/OVERFLOWING  
🚨 **Incident Detection** - Automatic notification decisions based on crowd levels  
⚡ **GET Endpoint** - Simple API call for instant crowd status  

## Setup

1. **Install dependencies:**
```bash
cd simple_workflow_api
pip install -r requirements.txt
```

2. **Set up environment:**
```bash
# Edit .env file and add your Google AI Studio API key
GOOGLE_API_KEY=your_actual_api_key_here
```

3. **Start backend server (in another terminal):**
```bash
cd ../backend
uvicorn app.main:app --reload --port 8000
```

4. **Run the crowd monitoring server:**
```bash
python main.py
```

Server will be available at: http://localhost:8002

## API Endpoint

### Real-time Crowd Monitoring
**GET** `/api/v1/monitor-crowd`

Fetches live crowd data and analyzes incident risk.

```bash
curl -X GET "http://localhost:8002/api/v1/monitor-crowd"
```

### Other Endpoints

- **GET** `/` - Root information
- **GET** `/health` - Health check  
- **GET** `/api/v1/workflow-info` - Workflow details

## How It Works

### Sequential Workflow:
1. **Crowd Data Analyzer** - Fetches live data from `http://localhost:8000/zones/crowd/details`
2. **Density Calculator** - Calculates occupancy ratios for each zone
3. **Incident Notifier** - Makes notification decisions based on density levels

### Density Levels:
- **LOW**: 0-50% of capacity
- **MODERATE**: 51-80% of capacity  
- **HIGH**: 81-100% of capacity
- **OVERFLOWING**: >100% of capacity

## Testing

Visit http://localhost:8002/docs for interactive API documentation.

## Example Response

```json
{
  "success": true,
  "workflow_type": "crowd_monitoring", 
  "description": "Real-time pipeline: Fetch Live Data → Analyze Density → Incident Decision",
  "data": {
    "workflow": "crowd_monitoring",
    "source": "live_backend_data",
    "results": [
      {
        "agent": "crowd_data_analyzer",
        "response": "Analysis shows 2 zones are OVERFLOWING capacity..."
      },
      {
        "agent": "incident_notifier",
        "response": "🚨 IMMEDIATE NOTIFICATION REQUIRED - Critical zones: Exit, Stage"
      }
    ],
    "status": "completed"
  }
}
```

## Integration Notes

- Requires backend server running on port 8000
- Automatically handles zone capacity calculations
- Provides actionable incident notifications
- Real-time data updates on each API call 
``` 