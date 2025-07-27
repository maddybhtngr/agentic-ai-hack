# 🏢 Venue Management MCP Server

> **Production-Ready FastMCP Server with HTTP Transport & In-Memory Database**

A comprehensive Model Context Protocol (MCP) server for managing venues and their facilities with location-based services, Google Maps integration, and real-time facility discovery. Built with modern FastMCP architecture and HTTP transport for seamless AI model integration.

## 🌟 Features

### 🏗️ Venue Management
- **Register Venues**: Add venues with GPS coordinates, contact details, and descriptions
- **Venue Details**: Get comprehensive venue information including all facilities
- **List All Venues**: Browse all registered venues with facility counts

### 🏥 Facility Management
- **Multiple Facility Types**: Medical centers, food courts, exit gates, network areas, smoking areas, restrooms, security, parking, information desks, emergency exits
- **Detailed Information**: Contact persons, phone numbers, operating hours, capacity
- **Custom Data**: Additional facility-specific information in JSON format

### 📍 Location-Based Services
- **Nearest Venue Finder**: Find closest venues based on user coordinates
- **Facility Search**: Find nearest facilities of specific types (e.g., medical centers)
- **Distance Calculation**: Accurate distance using Haversine formula
- **Search Radius**: Configurable maximum search distance

### 🗺️ Google Maps Integration
- **Direct Maps Links**: Click-to-open Google Maps for any venue/facility
- **Directions**: Get turn-by-turn directions to facilities
- **Location Search**: Search by name and coordinates

### 🔍 Advanced Search
- **Name Search**: Find facilities by name or description
- **Type Filtering**: Filter by facility type
- **Venue-Specific Search**: Search within specific venues only

## 🚀 Installation & Quick Start

### Prerequisites
- Python 3.8+
- FastMCP package

### Setup
1. **Install Dependencies**:
   ```bash
   # Core dependencies
   pip install -r requirements.txt
   
   # Or install minimal (core only):
   pip install fastmcp>=0.6.0
   ```

2. **Run the MCP Server**:
   ```bash
   python server.py
   ```
   Server starts on: `http://localhost:8000/mcp/`

3. **Production Deployment**:
   ```bash
   # For production, consider using gunicorn or similar
   pip install gunicorn
   gunicorn --bind 0.0.0.0:8000 -w 4 server:app
   ```

### Architecture
- ✅ **FastMCP HTTP Transport** - Modern MCP protocol implementation
- ✅ **In-Memory SQLite Database** - No external DB required
- ✅ **Pre-loaded Sample Data** - Ready to test immediately
- ✅ **Production-Ready** - Clean, generic, deployable anywhere
- ✅ **7 MCP Tools** - Complete venue & facility management API

## 📊 Sample Data Included

The server comes with pre-loaded sample data for testing:

- **3 Venues**: Central Plaza Mall, Tech Park Convention Center, Metro City Hospital
- **14 Facilities**: Medical centers, food courts, parking, exits, restrooms, WiFi zones
- **Delhi/NCR Locations**: Real GPS coordinates for testing
- **Complete Contact Info**: Phone, email, operating hours, capacity

## 🛠️ Available Tools

### 1. `register_venue`
Register a new venue with location and details.

**Parameters**:
- `name` (required): Venue name
- `latitude` (required): GPS latitude
- `longitude` (required): GPS longitude
- `address`: Full address
- `description`: Venue description
- `contact_email`: Contact email
- `contact_phone`: Contact phone
- `operating_hours`: Operating hours (e.g., "9:00 AM - 10:00 PM")
- `capacity`: Maximum capacity

**Example**:
```json
{
  "name": "Central Mall",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "Connaught Place, New Delhi, India",
  "description": "Large shopping mall with multiple facilities",
  "contact_email": "info@centralmall.com",
  "contact_phone": "+91-11-12345678",
  "operating_hours": "10:00 AM - 10:00 PM",
  "capacity": 5000
}
```

### 2. `register_facility`
Register a facility within a venue.

**Facility Types**:
- `medical_center`: Medical centers and first aid
- `food_court`: Food courts and restaurants
- `exit_gate`: Exit gates and emergency exits
- `network_area`: WiFi zones and charging stations
- `smoking_area`: Designated smoking areas
- `restroom`: Restrooms and washrooms
- `security`: Security checkpoints
- `parking`: Parking areas
- `information_desk`: Information and help desks
- `emergency_exit`: Emergency exits

**Parameters**:
- `venue_id` (required): ID of the parent venue
- `facility_type` (required): Type from the list above
- `name` (required): Facility name
- `latitude` (required): GPS latitude
- `longitude` (required): GPS longitude
- `description`: Facility description
- `contact_person`: Person in charge
- `contact_phone`: Contact phone
- `contact_email`: Contact email
- `capacity`: Facility capacity
- `operating_hours`: Operating hours
- `additional_info`: Additional JSON data

**Example**:
```json
{
  "venue_id": 1,
  "facility_type": "medical_center",
  "name": "Central Mall Medical Center",
  "latitude": 28.6140,
  "longitude": 77.2091,
  "description": "24/7 medical center with emergency services",
  "contact_person": "Dr. Smith",
  "contact_phone": "+91-11-87654321",
  "contact_email": "medical@centralmall.com",
  "operating_hours": "24/7"
}
```

### 3. `find_nearest_venue`
Find the nearest venue to user's location.

**Parameters**:
- `user_latitude` (required): User's current latitude
- `user_longitude` (required): User's current longitude
- `max_distance`: Maximum distance in km (default: 10)

### 4. `find_nearest_facilities`
Find nearest facilities of a specific type.

**Parameters**:
- `user_latitude` (required): User's current latitude
- `user_longitude` (required): User's current longitude
- `facility_type` (required): Type of facility to search
- `venue_id`: Optional - search within specific venue
- `max_distance`: Maximum distance in km (default: 5)
- `limit`: Maximum results (default: 10)

### 5. `get_venue_details`
Get detailed information about a venue and all its facilities.

**Parameters**:
- `venue_id` (required): ID of the venue

### 6. `list_all_venues`
List all registered venues.

**Parameters**:
- `include_facilities`: Include facility counts (default: true)

### 7. `search_facilities_by_name`
Search facilities by name or description.

**Parameters**:
- `search_term` (required): Search term
- `facility_type`: Optional - filter by type
- `venue_id`: Optional - search within venue

## 📱 AI Model Integration

### Connection Setup
Your AI model can connect to this MCP server using the configuration:

```json
{
  "mcpServers": {
    "venue-management": {
      "command": "python",
      "args": ["/path/to/venue_mcp_server.py"],
      "env": {}
    }
  }
}
```

### Usage Examples

1. **User asks: "Where's the nearest medical center?"**
   ```python
   # AI model calls:
   find_nearest_facilities(
       user_latitude=user_lat,
       user_longitude=user_lon,
       facility_type="medical_center",
       max_distance=5
   )
   # Returns nearest medical centers with Google Maps links
   ```

2. **User asks: "Show me all facilities in this mall"**
   ```python
   # AI model calls:
   find_nearest_venue(user_latitude=user_lat, user_longitude=user_lon)
   # Then:
   get_venue_details(venue_id=found_venue_id)
   # Returns all facilities with clickable maps links
   ```

3. **User asks: "Find food courts nearby"**
   ```python
   # AI model calls:
   find_nearest_facilities(
       user_latitude=user_lat,
       user_longitude=user_lon,
       facility_type="food_court",
       max_distance=3
   )
   # Returns food courts with directions
   ```

## 🗄️ Database Schema

The server uses SQLite with two main tables:

### Venues Table
```sql
CREATE TABLE venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    operating_hours TEXT,
    capacity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Facilities Table
```sql
CREATE TABLE facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id INTEGER NOT NULL,
    facility_type TEXT NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    description TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    capacity INTEGER,
    operating_hours TEXT,
    additional_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues (id)
);
```

## 🎯 Use Cases

### 🏥 Emergency Situations
- **Medical Emergency**: Find nearest medical center with contact details
- **Evacuation**: Locate all exit gates and emergency exits
- **Security**: Find security checkpoints and emergency contacts

### 🍽️ Visitor Services
- **Dining**: Find food courts and restaurants
- **Facilities**: Locate restrooms, information desks
- **Connectivity**: Find network areas and charging stations

### 🚗 Navigation
- **Parking**: Find available parking areas
- **Exits**: Locate exit gates for easy departure
- **Accessibility**: Find accessible facilities

### 📊 Venue Management
- **Analytics**: Track facility usage and visitor patterns
- **Operations**: Manage contact information and operating hours
- **Maintenance**: Keep facility information updated

## 🔧 Customization

### Adding New Facility Types
Edit the `facility_type` enum in the tool schema:

```python
"facility_type": {
    "type": "string",
    "enum": ["medical_center", "food_court", "your_new_type"],
    "description": "Type of facility"
}
```

### Custom Search Radius
Adjust default search distances in tool calls:

```python
max_distance = arguments.get("max_distance", 10)  # Change default
```

### Google Maps Customization
Modify the Google Maps URL generation:

```python
def generate_google_maps_url(latitude: float, longitude: float, name: str = "") -> str:
    # Customize URL format here
    return f"https://www.google.com/maps/search/{name}/@{latitude},{longitude},17z"
```

## 📡 API Usage Examples

### 1. Find Nearest Medical Center
**Use Case**: "Where's the nearest medical center?"

**MCP Tool Call**:
```python
find_nearest_facilities(
    user_latitude=28.6145,
    user_longitude=77.2085,
    facility_type="medical_center",
    max_distance=5,
    limit=3
)
```

**Response**:
```json
{
  "success": true,
  "user_location": {"latitude": 28.6145, "longitude": 77.2085},
  "facility_type": "medical_center",
  "facilities_found": 1,
  "facilities": [
    {
      "id": 2,
      "venue_id": 1,
      "venue_name": "Central Plaza Mall",
      "facility_type": "medical_center",
      "name": "Central Mall Medical Center",
      "latitude": 28.6140,
      "longitude": 77.2091,
      "description": "24/7 medical center with emergency services",
      "contact_person": "Dr. Smith",
      "contact_phone": "+91-11-87654321",
      "contact_email": "medical@centralmall.com",
      "operating_hours": "24/7",
      "capacity": 50,
      "distance_km": 0.06,
      "google_maps_url": "https://www.google.com/maps/search/Central Mall Medical Center/@28.6140,77.2091,17z",
      "directions_url": "https://www.google.com/maps/dir/?api=1&destination=28.6140,77.2091"
    }
  ]
}
```

### 2. Register New Venue
**Use Case**: "Add a new shopping mall"

**MCP Tool Call**:
```python
register_venue(
    name="Phoenix MarketCity",
    latitude=28.5562,
    longitude=77.3410,
    address="LBS Marg, Kurla West, Mumbai",
    description="Premium shopping and entertainment destination",
    contact_email="info@phoenixmarketcity.com",
    contact_phone="+91-22-61234567",
    operating_hours="10:00 AM - 11:00 PM",
    capacity=8000
)
```

**Response**:
```json
{
  "success": true,
  "message": "Venue registered successfully",
  "venue": {
    "id": 4,
    "name": "Phoenix MarketCity",
    "latitude": 28.5562,
    "longitude": 77.3410,
    "address": "LBS Marg, Kurla West, Mumbai",
    "description": "Premium shopping and entertainment destination",
    "contact_email": "info@phoenixmarketcity.com",
    "contact_phone": "+91-22-61234567",
    "operating_hours": "10:00 AM - 11:00 PM",
    "capacity": 8000,
    "google_maps_url": "https://www.google.com/maps/search/Phoenix MarketCity/@28.5562,77.3410,17z"
  }
}
```

### 3. Find Nearest Venue
**Use Case**: "What venue am I closest to?"

**MCP Tool Call**:
```python
find_nearest_venue(
    user_latitude=28.6145,
    user_longitude=77.2085,
    max_distance=10
)
```

**Response**:
```json
{
  "success": true,
  "user_location": {"latitude": 28.6145, "longitude": 77.2085},
  "venues_found": 2,
  "venues": [
    {
      "id": 1,
      "name": "Central Plaza Mall",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "Connaught Place, New Delhi",
      "distance_km": 0.08,
      "facility_count": 6,
      "google_maps_url": "https://www.google.com/maps/search/Central Plaza Mall/@28.6139,77.2090,17z",
      "directions_url": "https://www.google.com/maps/dir/?api=1&destination=28.6139,77.2090"
    },
    {
      "id": 3,
      "name": "Metro City Hospital",
      "latitude": 28.6150,
      "longitude": 77.2070,
      "address": "Parliament Street, New Delhi",
      "distance_km": 0.18,
      "facility_count": 4,
      "google_maps_url": "https://www.google.com/maps/search/Metro City Hospital/@28.6150,77.2070,17z",
      "directions_url": "https://www.google.com/maps/dir/?api=1&destination=28.6150,77.2070"
    }
  ]
}
```

### 4. Search Facilities by Name
**Use Case**: "Find all WiFi zones"

**MCP Tool Call**:
```python
search_facilities_by_name(
    search_term="wifi",
    facility_type="network_area"
)
```

**Response**:
```json
{
  "success": true,
  "search_term": "wifi",
  "facilities_found": 2,
  "facilities": [
    {
      "id": 8,
      "venue_name": "Central Plaza Mall",
      "name": "Central WiFi Zone",
      "facility_type": "network_area",
      "description": "High-speed WiFi and charging stations",
      "operating_hours": "10:00 AM - 10:00 PM",
      "capacity": 100,
      "google_maps_url": "https://www.google.com/maps/search/Central WiFi Zone/@28.6141,77.2089,17z"
    },
    {
      "id": 14,
      "venue_name": "Tech Park Convention Center",
      "name": "Conference WiFi Hub",
      "facility_type": "network_area",
      "description": "Business-grade WiFi for conferences",
      "operating_hours": "8:00 AM - 8:00 PM",
      "capacity": 200,
      "google_maps_url": "https://www.google.com/maps/search/Conference WiFi Hub/@28.5895,77.2565,17z"
    }
  ]
}
```

### 5. Get Venue Details
**Use Case**: "Tell me about Central Plaza Mall"

**MCP Tool Call**:
```python
get_venue_details(venue_id=1)
```

**Response**:
```json
{
  "success": true,
  "venue": {
    "id": 1,
    "name": "Central Plaza Mall",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, New Delhi",
    "description": "Premier shopping mall in the heart of Delhi",
    "contact_email": "info@centralplaza.com",
    "contact_phone": "+91-11-12345678",
    "operating_hours": "10:00 AM - 10:00 PM",
    "capacity": 5000,
    "google_maps_url": "https://www.google.com/maps/search/Central Plaza Mall/@28.6139,77.2090,17z"
  },
  "facilities": [
    {
      "id": 1,
      "name": "Main Entrance Parking",
      "facility_type": "parking",
      "description": "Multi-level parking with 500 spaces",
      "capacity": 500,
      "contact_phone": "+91-11-12345679"
    },
    {
      "id": 2,
      "name": "Central Mall Medical Center",
      "facility_type": "medical_center",
      "description": "24/7 medical center with emergency services",
      "capacity": 50,
      "operating_hours": "24/7",
      "contact_person": "Dr. Smith",
      "contact_phone": "+91-11-87654321"
    }
  ]
}
```

## 🚀 Production Deployment

### File Structure
```
mcp/
├── server.py              # FastMCP server with HTTP transport
├── mcp_config.json        # MCP configuration file
├── requirements.txt       # Dependencies (fastmcp)
└── README.md             # This documentation
```

### Local Development
```bash
# Install dependencies (recommended)
pip install -r requirements.txt

# Or install minimal core only
pip install fastmcp>=0.6.0

# Run the server
python server.py

# Server available at: http://localhost:8000/mcp/
```

### Production Deployment

#### Option 1: Direct Python
```bash
# Simple production run
python server.py
```

#### Option 2: Gunicorn (Recommended)
```bash
# Install dependencies (includes gunicorn)
pip install -r requirements.txt

# Run with multiple workers
gunicorn --bind 0.0.0.0:8000 --workers 4 server:app
```

#### Option 3: Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY server.py .
EXPOSE 8000
CMD ["python", "server.py"]
```

#### Option 4: Systemd Service
```ini
# /etc/systemd/system/venue-mcp.service
[Unit]
Description=Venue MCP Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/venue-mcp
ExecStart=/usr/bin/python3 server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

### Environment Variables
The server runs entirely in-memory and requires no environment variables for basic operation.

### Monitoring & Logging
- Server logs to stdout/stderr
- Health check endpoint: `GET /health` (if implemented)
- MCP endpoint: `POST /mcp/`
- All requests are logged with timestamps

### Scaling Considerations
- **In-Memory Database**: Data is lost on restart, suitable for ephemeral deployments
- **Stateless Design**: Each server instance is independent
- **Load Balancing**: Multiple instances can run behind a load balancer
- **Persistent Storage**: For production, consider implementing persistent database backend

## 📝 License

This MCP server is part of the Agentic AI Hack project.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## 📞 Support

For issues and questions, please create an issue in the project repository.

---

**🎉 Ready to enhance your AI model with location-based venue management capabilities!**
