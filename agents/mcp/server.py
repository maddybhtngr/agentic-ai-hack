#!/usr/bin/env python3
"""
Venue Management MCP Server - Production Ready
FastMCP implementation with in-memory database and sample data.
Generic, deployable version for any environment.
"""

import json
import sqlite3
import math
from typing import Optional
from fastmcp import FastMCP

# Create the FastMCP server
mcp = FastMCP("venue-management-server")

# Use in-memory database
DB_CONNECTION = sqlite3.connect(":memory:", check_same_thread=False)

def init_database_with_sample_data():
    """Initialize the in-memory SQLite database with tables and sample data."""
    cursor = DB_CONNECTION.cursor()
    
    # Create venues table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS venues (
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
        )
    """)
    
    # Create facilities table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS facilities (
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
            additional_info TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (venue_id) REFERENCES venues (id)
        )
    """)
    
    # Create indexes for performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_venues_location ON venues (latitude, longitude)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_facilities_venue ON facilities (venue_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities (facility_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities (latitude, longitude)")
    
    # Sample venues data - BIEC and nearby locations
    venues_data = [
        # Main venue: BIEC (Bangalore International Exhibition Centre)
        ("BIEC", 13.1986, 77.7066, "10th Mile, Tumkur Road, Bengaluru, Karnataka 560073", 
         "Bangalore International Exhibition Centre - Premier exhibition and convention facility", "info@biec.in", 
         "+91-80-28392000", "8:00 AM - 8:00 PM", 25000),
        
        # Nearby venue 1: ~200m from BIEC
        ("Whitefield Tech Park", 13.1995, 77.7070, "Whitefield, Bengaluru, Karnataka",
         "Modern IT park with office spaces and facilities", "info@whitefieldtech.com",
         "+91-80-12345678", "6:00 AM - 10:00 PM", 12000),
        
        # Nearby venue 2: ~800m from BIEC
        ("Brigade Gateway Mall", 13.1978, 77.7125, "Brigade Gateway, Bengaluru, Karnataka",
         "Premium shopping mall with entertainment and dining", "contact@brigadegateway.com",
         "+91-80-87654321", "10:00 AM - 11:00 PM", 8000),
        
        # Nearby venue 3: ~1.5km from BIEC
        ("Phoenix MarketCity", 13.1890, 77.7080, "Whitefield Road, Bengaluru, Karnataka",
         "Large shopping and entertainment destination", "info@phoenixmarketcity.com",
         "+91-80-11223344", "10:00 AM - 10:00 PM", 15000)
    ]
    
    cursor.executemany("""
        INSERT INTO venues (name, latitude, longitude, address, description, 
                          contact_email, contact_phone, operating_hours, capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, venues_data)
    
    # Sample facilities data - BIEC and nearby venues facilities
    facilities_data = [
        # BIEC (venue_id: 1) facilities
        (1, "information_desk", "BIEC Reception", 13.1986, 77.7066, 
         "Main reception and visitor information center", "Reception Manager", "+91-80-28392001", None, 0, "8:00 AM - 8:00 PM", "{}"),
        (1, "parking", "BIEC Main Parking", 13.1985, 77.7065, 
         "Large parking facility for exhibitions and events", None, "+91-80-28392002", None, 5000, "24/7", "{}"),
        (1, "food_court", "BIEC Food Plaza", 13.1987, 77.7067, 
         "International cuisine food court for visitors", "F&B Manager", "+91-80-28392003", None, 800, "8:00 AM - 8:00 PM", "{}"),
        (1, "restroom", "BIEC Public Facilities", 13.1986, 77.7066, 
         "Modern restroom facilities with accessibility features", None, None, None, 0, "8:00 AM - 8:00 PM", "{}"),
        # Multiple medical centers NEAR YOUR LOCATION - 50m to 2km range
        (1, "medical_center", "BIEC_medical_centre_hall_1", 13.0626279, 77.4752741, 
         "Primary medical facility with emergency services - Hall 1", "Dr. Bangalore", "+91-80-28392004", None, 50, "24/7", "{}"),
        (1, "medical_center", "BIEC_medical_centre_hall_2", 13.0631279, 77.4757741, 
         "Secondary medical facility with specialized care - Hall 2", "Dr. Kumar", "+91-80-28392014", None, 40, "24/7", "{}"),
        (1, "medical_center", "BIEC_medical_centre_hall_3", 13.0636279, 77.4762741, 
         "Tertiary medical facility with first aid services - Hall 3", "Dr. Sharma", "+91-80-28392024", None, 30, "8:00 AM - 10:00 PM", "{}"),
        (1, "medical_center", "BIEC_medical_centre_hall_4", 13.0646279, 77.4772741, 
         "Quaternary medical facility with trauma care - Hall 4", "Dr. Reddy", "+91-80-28392034", None, 35, "24/7", "{}"),
        # Multiple security facilities near your location
        (1, "security", "BIEC Security Main", 13.0626279, 77.4752741, 
         "24/7 security services and emergency response", "Security Chief", "+91-80-28392005", None, 0, "24/7", "{}"),
        (1, "security", "BIEC Security Post 1", 13.0631279, 77.4757741, 
         "Security checkpoint and patrol services", "Security Officer 1", "+91-80-28392015", None, 0, "24/7", "{}"),
        (1, "security", "BIEC Security Post 2", 13.0621279, 77.4747741, 
         "Perimeter security and monitoring", "Security Officer 2", "+91-80-28392025", None, 0, "24/7", "{}"),
        (1, "security", "BIEC Security Post 3", 13.0636279, 77.4762741, 
         "Mobile patrol and incident response", "Security Officer 3", "+91-80-28392035", None, 0, "24/7", "{}"),
        (1, "exit_gate", "BIEC Main Exit", 13.0626279, 77.4752741, 
         "Main exit with security checkpoint", None, None, None, 0, "24/7", "{}"),
        
        # Whitefield Tech Park (venue_id: 2) facilities
        (2, "parking", "Tech Park Parking", 13.1994, 77.7069, 
         "Office building parking with EV charging", None, "+91-80-12345679", None, 2000, "6:00 AM - 10:00 PM", "{}"),
        (2, "food_court", "Tech Café", 13.1996, 77.7071, 
         "Modern café with healthy food options", "Café Manager", "+91-80-12345680", None, 200, "7:00 AM - 9:00 PM", "{}"),
        (2, "restroom", "Tech Park Facilities", 13.1995, 77.7070, 
         "Modern office building restrooms", None, None, None, 0, "6:00 AM - 10:00 PM", "{}"),
        (2, "network_area", "Tech WiFi Zone", 13.1995, 77.7070, 
         "High-speed WiFi and charging stations", "IT Support", "+91-80-12345681", None, 100, "6:00 AM - 10:00 PM", "{}"),
        
        # Brigade Gateway Mall (venue_id: 3) facilities
        (3, "food_court", "Gateway Food Court", 13.1979, 77.7126, 
         "Premium dining options and international cuisine", None, "+91-80-87654322", None, 600, "10:00 AM - 11:00 PM", "{}"),
        (3, "parking", "Mall Parking", 13.1977, 77.7124, 
         "Multi-level parking with valet service", "Parking Manager", "+91-80-87654323", None, 1500, "10:00 AM - 11:00 PM", "{}"),
        (3, "restroom", "Mall Restrooms", 13.1978, 77.7125, 
         "Premium restroom facilities", None, None, None, 0, "10:00 AM - 11:00 PM", "{}"),
        (3, "security", "Mall Security", 13.1978, 77.7125, 
         "Professional security services", "Security Head", "+91-80-87654324", None, 0, "10:00 AM - 11:00 PM", "{}"),
        
        # Phoenix MarketCity (venue_id: 4) facilities
        (4, "parking", "Phoenix Parking", 13.1889, 77.7079, 
         "Large parking facility with multiple levels", None, "+91-80-11223345", None, 3000, "10:00 AM - 10:00 PM", "{}"),
        (4, "food_court", "Phoenix Food Court", 13.1891, 77.7081, 
         "Extensive food court with diverse options", "Food Court Manager", "+91-80-11223346", None, 1000, "10:00 AM - 10:00 PM", "{}"),
        (4, "restroom", "Phoenix Restrooms", 13.1890, 77.7080, 
         "Modern restroom facilities with baby care", None, None, None, 0, "10:00 AM - 10:00 PM", "{}"),
        (4, "information_desk", "Phoenix Information", 13.1890, 77.7080, 
         "Visitor information and customer service", "Customer Service", "+91-80-11223347", None, 0, "10:00 AM - 10:00 PM", "{}"),
        (4, "exit_gate", "Phoenix Exit", 13.1888, 77.7078, 
         "Main exit with security check", None, None, None, 0, "10:00 AM - 10:00 PM", "{}")
    ]
    
    cursor.executemany("""
        INSERT INTO facilities (venue_id, facility_type, name, latitude, longitude,
                              description, contact_person, contact_phone, contact_email,
                              capacity, operating_hours, additional_info)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, facilities_data)
    
    DB_CONNECTION.commit()
    print("✅ Database initialized with sample data")
    print(f"📊 Loaded {len(venues_data)} venues and {len(facilities_data)} facilities")

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the distance between two points using Haversine formula. Returns distance in kilometers."""
    R = 6371  # Earth's radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

def generate_google_maps_url(latitude: float, longitude: float, name: str = "") -> str:
    """Generate Google Maps URL for given coordinates."""
    if name:
        return f"https://www.google.com/maps/search/{name}/@{latitude},{longitude},15z"
    else:
        return f"https://www.google.com/maps/@{latitude},{longitude},15z"

def generate_directions_url(dest_lat: float, dest_lon: float, dest_name: str = "") -> str:
    """Generate Google Maps directions URL."""
    return f"https://www.google.com/maps/dir//{dest_lat},{dest_lon}"

# Initialize database on startup
init_database_with_sample_data()

# Tool 1: Register Venue
@mcp.tool()
def register_venue(
    name: str,
    latitude: float,
    longitude: float,
    address: str = "",
    description: str = "", 
    contact_email: str = "",
    contact_phone: str = "",
    operating_hours: str = "",
    capacity: int = 0
) -> str:
    """Register a new venue with location and details."""
    try:
        cursor = DB_CONNECTION.cursor()
        
        cursor.execute("""
            INSERT INTO venues (name, latitude, longitude, address, description, 
                              contact_email, contact_phone, operating_hours, capacity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, latitude, longitude, address, description, 
              contact_email, contact_phone, operating_hours, capacity))
        
        venue_id = cursor.lastrowid
        DB_CONNECTION.commit()
        
        maps_url = generate_google_maps_url(latitude, longitude, name)
        
        result = {
            "success": True,
            "venue_id": venue_id,
            "message": f"Venue '{name}' registered successfully",
            "details": {
                "name": name,
                "coordinates": {"latitude": latitude, "longitude": longitude},
                "address": address,
                "description": description,
                "contact": {"email": contact_email, "phone": contact_phone},
                "operating_hours": operating_hours,
                "capacity": capacity,
                "google_maps_url": maps_url
            }
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Failed to register venue: {str(e)}"
        }
        return json.dumps(error_result, indent=2)

# Tool 2: Register Facility
@mcp.tool()
def register_facility(
    venue_id: int,
    facility_type: str,
    name: str,
    latitude: float,
    longitude: float,
    description: str = "",
    contact_person: str = "",
    contact_phone: str = "",
    contact_email: str = "",
    capacity: int = 0,
    operating_hours: str = "",
    additional_info: dict = None
) -> str:
    """Register a facility within a venue."""
    try:
        cursor = DB_CONNECTION.cursor()
        
        # Verify venue exists
        cursor.execute("SELECT name FROM venues WHERE id = ?", (venue_id,))
        venue = cursor.fetchone()
        
        if not venue:
            error_result = {
                "success": False,
                "error": f"Venue with ID {venue_id} not found"
            }
            return json.dumps(error_result, indent=2)
        
        cursor.execute("""
            INSERT INTO facilities (venue_id, facility_type, name, latitude, longitude,
                                  description, contact_person, contact_phone, contact_email,
                                  capacity, operating_hours, additional_info)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (venue_id, facility_type, name, latitude, longitude,
              description, contact_person, contact_phone, contact_email,
              capacity, operating_hours, json.dumps(additional_info or {})))
        
        facility_id = cursor.lastrowid
        DB_CONNECTION.commit()
        
        maps_url = generate_google_maps_url(latitude, longitude, name)
        directions_url = generate_directions_url(latitude, longitude, name)
        
        result = {
            "success": True,
            "facility_id": facility_id,
            "message": f"Facility '{name}' registered successfully in venue '{venue[0]}'",
            "details": {
                "facility_id": facility_id,
                "venue_id": venue_id,
                "venue_name": venue[0],
                "facility_type": facility_type,
                "name": name,
                "coordinates": {"latitude": latitude, "longitude": longitude},
                "description": description,
                "contact": {
                    "person": contact_person,
                    "phone": contact_phone,
                    "email": contact_email
                },
                "capacity": capacity,
                "operating_hours": operating_hours,
                "google_maps_url": maps_url,
                "directions_url": directions_url
            }
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Failed to register facility: {str(e)}"
        }
        return json.dumps(error_result, indent=2)

# Tool 3: Find Nearest Venue
@mcp.tool()
def find_nearest_venue(
    user_latitude: float,
    user_longitude: float,
    max_distance: float = 10.0
) -> str:
    """Find the nearest venue to given coordinates."""
    try:
        cursor = DB_CONNECTION.cursor()
        
        cursor.execute("SELECT * FROM venues")
        venues = cursor.fetchall()
        
        venues_with_distance = []
        for venue in venues:
            distance = calculate_distance(user_latitude, user_longitude, venue[2], venue[3])
            if distance <= max_distance:
                venues_with_distance.append({
                    "id": venue[0],
                    "name": venue[1],
                    "latitude": venue[2],
                    "longitude": venue[3],
                    "address": venue[4],
                    "description": venue[5],
                    "contact_email": venue[6],
                    "contact_phone": venue[7],
                    "operating_hours": venue[8],
                    "capacity": venue[9],
                    "distance_km": round(distance, 2),
                    "google_maps_url": generate_google_maps_url(venue[2], venue[3], venue[1]),
                    "directions_url": generate_directions_url(venue[2], venue[3], venue[1])
                })
        
        # Sort by distance
        venues_with_distance.sort(key=lambda x: x["distance_km"])
        
        result = {
            "success": True,
            "user_location": {"latitude": user_latitude, "longitude": user_longitude},
            "search_radius_km": max_distance,
            "venues_found": len(venues_with_distance),
            "venues": venues_with_distance
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Failed to find venues: {str(e)}"
        }
        return json.dumps(error_result, indent=2)

# Tool 4: Find Nearest Facilities
@mcp.tool()
def find_nearest_facilities(
    user_latitude: float,
    user_longitude: float,
    facility_type: str,
    venue_id: int = None,
    max_distance: float = 5.0,
    limit: int = 10
) -> str:
    """Find nearest facilities of specific type."""
    try:
        cursor = DB_CONNECTION.cursor()
        
        if venue_id:
            cursor.execute("""
                SELECT f.*, v.name as venue_name 
                FROM facilities f 
                JOIN venues v ON f.venue_id = v.id 
                WHERE f.facility_type = ? AND f.venue_id = ?
            """, (facility_type, venue_id))
        else:
            cursor.execute("""
                SELECT f.*, v.name as venue_name 
                FROM facilities f 
                JOIN venues v ON f.venue_id = v.id 
                WHERE f.facility_type = ?
            """, (facility_type,))
        
        facilities = cursor.fetchall()
        
        facilities_with_distance = []
        for facility in facilities:
            distance = calculate_distance(user_latitude, user_longitude, facility[4], facility[5])
            if distance <= max_distance:
                facilities_with_distance.append({
                    "id": facility[0],
                    "venue_id": facility[1],
                    "venue_name": facility[14],  # venue_name from JOIN
                    "facility_type": facility[2],
                    "name": facility[3],
                    "latitude": facility[4],
                    "longitude": facility[5],
                    "description": facility[6],
                    "contact_person": facility[7],
                    "contact_phone": facility[8],
                    "contact_email": facility[9],
                    "capacity": facility[10],
                    "operating_hours": facility[11],
                    "distance_km": round(distance, 2),
                    "google_maps_url": generate_google_maps_url(facility[4], facility[5], facility[3]),
                    "directions_url": generate_directions_url(facility[4], facility[5], facility[3])
                })
        
        # Sort by distance and limit results
        facilities_with_distance.sort(key=lambda x: x["distance_km"])
        facilities_with_distance = facilities_with_distance[:limit]
        
        result = {
            "success": True,
            "user_location": {"latitude": user_latitude, "longitude": user_longitude},
            "facility_type": facility_type,
            "venue_id": venue_id,
            "search_radius_km": max_distance,
            "facilities_found": len(facilities_with_distance),
            "facilities": facilities_with_distance
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Failed to find facilities: {str(e)}"
        }
        return json.dumps(error_result, indent=2)

# Tool 5: Get Venue Details
@mcp.tool()
def get_venue_details(venue_id: int) -> str:
    """Get detailed information about a specific venue including all its facilities."""
    try:
        cursor = DB_CONNECTION.cursor()
        
        # Get venue details
        cursor.execute("SELECT * FROM venues WHERE id = ?", (venue_id,))
        venue = cursor.fetchone()
        
        if not venue:
            error_result = {
                "success": False,
                "error": f"Venue with ID {venue_id} not found"
            }
            return json.dumps(error_result, indent=2)
        
        # Get all facilities for this venue
        cursor.execute("SELECT * FROM facilities WHERE venue_id = ? ORDER BY facility_type, name", (venue_id,))
        facilities = cursor.fetchall()
        
        facilities_list = []
        for facility in facilities:
            facilities_list.append({
                "id": facility[0],
                "facility_type": facility[2],
                "name": facility[3],
                "latitude": facility[4],
                "longitude": facility[5],
                "description": facility[6],
                "contact_person": facility[7],
                "contact_phone": facility[8],
                "contact_email": facility[9],
                "capacity": facility[10],
                "operating_hours": facility[11],
                "google_maps_url": generate_google_maps_url(facility[4], facility[5], facility[3]),
                "directions_url": generate_directions_url(facility[4], facility[5], facility[3])
            })
        
        result = {
            "success": True,
            "venue": {
                "id": venue[0],
                "name": venue[1],
                "latitude": venue[2],
                "longitude": venue[3],
                "address": venue[4],
                "description": venue[5],
                "contact_email": venue[6],
                "contact_phone": venue[7],
                "operating_hours": venue[8],
                "capacity": venue[9],
                "google_maps_url": generate_google_maps_url(venue[2], venue[3], venue[1]),
                "directions_url": generate_directions_url(venue[2], venue[3], venue[1])
            },
            "facilities_count": len(facilities_list),
            "facilities": facilities_list
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Failed to get venue details: {str(e)}"
        }
        return json.dumps(error_result, indent=2)

# Tool 6: List All Venues
@mcp.tool()
def list_all_venues(include_facilities: bool = True) -> str:
    """List all registered venues."""
    try:
        cursor = DB_CONNECTION.cursor()
        
        cursor.execute("SELECT * FROM venues ORDER BY name")
        venues = cursor.fetchall()
        
        venues_list = []
        for venue in venues:
            venue_data = {
                "id": venue[0],
                "name": venue[1],
                "latitude": venue[2],
                "longitude": venue[3],
                "address": venue[4],
                "description": venue[5],
                "contact_email": venue[6],
                "contact_phone": venue[7],
                "operating_hours": venue[8],
                "capacity": venue[9],
                "google_maps_url": generate_google_maps_url(venue[2], venue[3], venue[1])
            }
            
            if include_facilities:
                cursor.execute("SELECT COUNT(*) FROM facilities WHERE venue_id = ?", (venue[0],))
                facilities_count = cursor.fetchone()[0]
                venue_data["facilities_count"] = facilities_count
            
            venues_list.append(venue_data)
        
        result = {
            "success": True,
            "total_venues": len(venues_list),
            "venues": venues_list
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Failed to list venues: {str(e)}"
        }
        return json.dumps(error_result, indent=2)

# Tool 7: Search Facilities by Name
@mcp.tool()
def search_facilities_by_name(
    search_term: str,
    facility_type: str = None,
    venue_id: int = None
) -> str:
    """Search facilities by name or description."""
    try:
        cursor = DB_CONNECTION.cursor()
        
        query = """
            SELECT f.*, v.name as venue_name 
            FROM facilities f 
            JOIN venues v ON f.venue_id = v.id 
            WHERE (f.name LIKE ? OR f.description LIKE ?)
        """
        params = [f"%{search_term}%", f"%{search_term}%"]
        
        if facility_type:
            query += " AND f.facility_type = ?"
            params.append(facility_type)
        
        if venue_id:
            query += " AND f.venue_id = ?"
            params.append(venue_id)
        
        query += " ORDER BY f.name"
        
        cursor.execute(query, params)
        facilities = cursor.fetchall()
        
        facilities_list = []
        for facility in facilities:
            facilities_list.append({
                "id": facility[0],
                "venue_id": facility[1],
                "venue_name": facility[14],  # venue_name from JOIN
                "facility_type": facility[2],
                "name": facility[3],
                "latitude": facility[4],
                "longitude": facility[5],
                "description": facility[6],
                "contact_person": facility[7],
                "contact_phone": facility[8],
                "contact_email": facility[9],
                "capacity": facility[10],
                "operating_hours": facility[11],
                "google_maps_url": generate_google_maps_url(facility[4], facility[5], facility[3]),
                "directions_url": generate_directions_url(facility[4], facility[5], facility[3])
            })
        
        result = {
            "success": True,
            "search_term": search_term,
            "facility_type": facility_type,
            "venue_id": venue_id,
            "facilities_found": len(facilities_list),
            "facilities": facilities_list
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Failed to search facilities: {str(e)}"
        }
        return json.dumps(error_result, indent=2)

if __name__ == "__main__":
    print("🚀 Starting Venue Management MCP Server")
    print("📍 Available tools:")
    print("   - register_venue: Register new venues with location and contact info")
    print("   - register_facility: Add facilities to venues (medical, food, parking, etc.)")
    print("   - find_nearest_venue: Find closest venue to user coordinates")
    print("   - find_nearest_facilities: Search facilities by type within radius")
    print("   - get_venue_details: Get complete venue information and facilities")
    print("   - list_all_venues: List all registered venues with basic info")
    print("   - search_facilities_by_name: Search facilities by name across all venues")
    print("🔄 Server ready for connections...\n")
    
    # Run with HTTP transport on port 8001
    mcp.run(transport="http", port=8001, host="localhost")
