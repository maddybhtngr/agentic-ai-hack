from pydantic import BaseModel, Field
from typing import List, Optional

class EmergencyContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    number: str = Field(..., min_length=1, max_length=50)
    type: str = Field(..., min_length=1, max_length=100)
    status: str = Field(..., min_length=1, max_length=50)
    responseTime: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=1, max_length=500)

class EmergencyContactCreate(EmergencyContactBase):
    pass

class EmergencyContactUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    number: Optional[str] = Field(None, min_length=1, max_length=50)
    type: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    responseTime: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, min_length=1, max_length=500)

class EmergencyContact(EmergencyContactBase):
    id: int

class NearbyServiceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., min_length=1, max_length=100)
    address: str = Field(..., min_length=1, max_length=500)
    phone: str = Field(..., min_length=1, max_length=50)
    mapsLink: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1, max_length=500)
    distance: str = Field(..., min_length=1, max_length=50)

class NearbyServiceCreate(NearbyServiceBase):
    pass

class NearbyServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    phone: Optional[str] = Field(None, min_length=1, max_length=50)
    mapsLink: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    distance: Optional[str] = Field(None, min_length=1, max_length=50)

class NearbyService(NearbyServiceBase):
    id: int

class EmergencyData(BaseModel):
    emergency_contacts: List[EmergencyContact]
    nearby_services: List[NearbyService] 