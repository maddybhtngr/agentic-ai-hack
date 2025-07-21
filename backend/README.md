# Backend - FastAPI Service

This directory contains the FastAPI backend server and API for the agentic-ai-hack project.

## Getting Started

### Prerequisites
- Python 3.8 or higher
- pip

### Installation
```bash
pip install -r requirements.txt
```

### Development
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Copy `env.example` to `.env` and configure:
```bash
cp env.example .env
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── zones.py         # Zone management endpoints
│   │   └── crowd.py         # Crowd monitoring endpoints
│   └── models/              # Pydantic models
│       ├── __init__.py
│       ├── user.py          # User models
│       └── zone.py          # Zone models
├── requirements.txt          # Python dependencies
├── env.example              # Environment variables template
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout

### Zones
- `GET /zones` - Get all zones
- `POST /zones` - Create new zone
- `GET /zones/{zone_id}` - Get specific zone
- `PUT /zones/{zone_id}` - Update zone
- `DELETE /zones/{zone_id}` - Delete zone

### Crowd Monitoring
- `GET /crowd/heatmap` - Get crowd heatmap data
- `GET /crowd/zones/{zone_id}/density` - Get zone density
- `GET /crowd/analytics` - Get crowd analytics 