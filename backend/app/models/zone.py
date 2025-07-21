from typing import Optional

class ZoneBase:
    def __init__(self, name: str, zone_type: str, x: float, y: float, width: float, height: float, 
                 center_lat: float, center_lng: float, radius: float, max_capacity: int):
        self.name = name
        self.zone_type = zone_type
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.center_lat = center_lat
        self.center_lng = center_lng
        self.radius = radius
        self.max_capacity = max_capacity

class ZoneCreate(ZoneBase):
    pass

class Zone(ZoneBase):
    def __init__(self, id: int, name: str, zone_type: str, x: float, y: float, width: float, height: float, 
                 center_lat: float, center_lng: float, radius: float, max_capacity: int):
        super().__init__(name, zone_type, x, y, width, height, center_lat, center_lng, radius, max_capacity)
        self.id = id 