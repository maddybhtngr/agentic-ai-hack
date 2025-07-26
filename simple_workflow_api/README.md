# Sequential Workflow API Server

A FastAPI server with 2 endpoints that trigger different ADK sequential workflows.

## Project Structure

```
simple_workflow_api/
├── agents.py           # ADK sequential workflows and agents
├── main.py            # FastAPI server with 2 endpoints  
├── requirements.txt   # Python dependencies
├── .env              # Environment configuration
└── README.md         # This file
```

## Setup

1. **Install dependencies:**
```bash
cd simple_workflow_api
pip install -r requirements.txt
```

2. **Set up environment:**
```bash
# Copy and edit .env file
cp .env .env.local

# Add your Google AI Studio API key
GOOGLE_API_KEY=your_actual_api_key_here
```

3. **Run the server:**
```bash
python main.py
```

Server will be available at: http://localhost:8002

## API Endpoints

### 1. Data Processing Workflow
**POST** `/api/v1/process-data`

Sequential pipeline: **Extract → Validate → Format**

```bash
curl -X POST "http://localhost:8002/api/v1/process-data" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world, this is sample data to process!"}'
```

### 2. Content Analysis Workflow  
**POST** `/api/v1/analyze-content`

Sequential pipeline: **Analyze → Summarize → Score**

```bash
curl -X POST "http://localhost:8002/api/v1/analyze-content" \
  -H "Content-Type: application/json" \
  -d '{"text": "What is artificial intelligence? How does machine learning work?"}'
```

### 3. Other Endpoints

- **GET** `/` - Root information
- **GET** `/health` - Health check
- **GET** `/api/v1/workflows` - Workflow information

## Workflows Overview

### Workflow 1: Data Processing
1. **Extract Agent** - Processes and extracts data
2. **Validator Agent** - Validates extracted data
3. **Formatter Agent** - Formats final output

### Workflow 2: Content Analysis  
1. **Analyzer Agent** - Analyzes content characteristics
2. **Summarizer Agent** - Creates content summary
3. **Scorer Agent** - Scores content quality

## Testing

Visit http://localhost:8002/docs for interactive API documentation (Swagger UI).

## Example Responses

**Data Processing:**
```json
{
  "success": true,
  "workflow_type": "data_processing",
  "description": "Sequential pipeline: Extract → Validate → Format",
  "data": {
    "workflow": "data_processing",
    "results": [...]
  }
}
```

**Content Analysis:**
```json
{
  "success": true, 
  "workflow_type": "content_analysis",
  "description": "Sequential pipeline: Analyze → Summarize → Score",
  "data": {
    "workflow": "content_analysis",
    "results": [...]
  }
}
``` 