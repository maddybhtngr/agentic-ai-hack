from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class ZoneType(str, Enum):
    ENTRANCE = "entrance"
    EXIT = "exit"
    SEATING = "seating"
    FOOD_COURT = "food_court"
    REST_AREA = "rest_area"
    VIP_AREA = "vip_area"
    STAGE_AREA = "stage_area"
    PARKING = "parking"
    EMERGENCY = "emergency"
    GENERAL = "general"

class ZoneBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Zone name")
    zoneType: ZoneType = Field(..., description="Type of zone")
    x: float = Field(..., ge=0, le=100, description="X position as percentage (0-100)")
    y: float = Field(..., ge=0, le=100, description="Y position as percentage (0-100)")
    width: float = Field(..., ge=1, le=100, description="Width as percentage (1-100)")
    height: float = Field(..., ge=1, le=100, description="Height as percentage (1-100)")
    centerLat: float = Field(..., ge=-90, le=90, description="Center latitude")
    centerLng: float = Field(..., ge=-180, le=180, description="Center longitude")
    radius: float = Field(..., gt=0, description="Zone radius in meters")
    maxCapacity: int = Field(..., gt=0, description="Maximum capacity of the zone")

class ZoneCreate(ZoneBase):
    pass

class ZoneUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    zoneType: Optional[ZoneType] = None
    x: Optional[float] = Field(None, ge=0, le=100)
    y: Optional[float] = Field(None, ge=0, le=100)
    width: Optional[float] = Field(None, ge=1, le=100)
    height: Optional[float] = Field(None, ge=1, le=100)
    centerLat: Optional[float] = Field(None, ge=-90, le=90)
    centerLng: Optional[float] = Field(None, ge=-180, le=180)
    radius: Optional[float] = Field(None, gt=0)
    maxCapacity: Optional[int] = Field(None, gt=0)

class Zone(ZoneBase):
    id: int
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True 