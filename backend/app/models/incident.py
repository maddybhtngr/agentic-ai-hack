from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ReporterType(str, Enum):
    ADMIN = "Admin"
    STAFF = "Staff"
    VOLUNTEER = "Volunteer"
    ATTENDEE = "Attendee"
    AI = "AI"

class IncidentPriority(str, Enum):
    CRITICAL = "CRITICAL"
    MODERATE = "MODERATE"
    GENERAL = "GENERAL"

class IncidentType(str, Enum):
    CROWD_OVERFLOW = "CROWD OVERFLOW"
    MEDICAL_ATTENTION_REQUIRED = "MEDICAL ATTENTION REQUIRED"
    SECURITY_REQUIRED = "SECURITY REQUIRED"

class IncidentStatus(str, Enum):
    REPORTED = "REPORTED"
    ASSIGNED = "ASSIGNED"
    RESOLVED = "RESOLVED"

class IncidentBase(BaseModel):
    reporter: ReporterType = Field(..., description="Type of reporter")
    reporter_name: str = Field(..., min_length=1, max_length=100, description="Name of the reporter")
    incident_priority: IncidentPriority = Field(..., description="Priority level of the incident")
    incident_type: IncidentType = Field(..., description="Type of incident")
    status: IncidentStatus = Field(..., description="Current status of the incident")
    resolver: Optional[str] = Field(None, max_length=100, description="Name of the person resolving the incident")
    creation_time: datetime = Field(..., description="Timestamp when incident was created")
    incident_summary: str = Field(..., min_length=1, max_length=200, description="Brief summary of the incident")
    incident_details: str = Field(..., min_length=1, max_length=1000, description="Detailed description of the incident")
    additional_image: Optional[str] = Field(None, description="Optional file path to additional image")
    zone_id: Optional[int] = Field(None, description="ID of the zone where incident occurred")
    is_broadcast: bool = Field(False, description="Whether to broadcast this incident to all zones")

class IncidentCreate(BaseModel):
    reporter: ReporterType = Field(..., description="Type of reporter")
    reporter_name: str = Field(..., min_length=1, max_length=100, description="Name of the reporter")
    incident_priority: IncidentPriority = Field(..., description="Priority level of the incident")
    incident_type: IncidentType = Field(..., description="Type of incident")
    incident_summary: str = Field(..., min_length=1, max_length=200, description="Brief summary of the incident")
    incident_details: str = Field(..., min_length=1, max_length=1000, description="Detailed description of the incident")
    additional_image: Optional[str] = Field(None, description="Optional file path to additional image")
    zone_id: Optional[int] = Field(None, description="ID of the zone where incident occurred")
    is_broadcast: bool = Field(False, description="Whether to broadcast this incident to all zones")

class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = Field(None, description="Current status of the incident")
    resolver: Optional[str] = Field(None, max_length=100, description="Name of the person resolving the incident")
    incident_summary: Optional[str] = Field(None, min_length=1, max_length=200, description="Brief summary of the incident")
    incident_details: Optional[str] = Field(None, min_length=1, max_length=1000, description="Detailed description of the incident")
    additional_image: Optional[str] = Field(None, description="Optional file path to additional image")
    zone_id: Optional[int] = Field(None, description="ID of the zone where incident occurred")
    is_broadcast: Optional[bool] = Field(None, description="Whether to broadcast this incident to all zones")

class Incident(IncidentBase):
    id: int = Field(..., description="Unique identifier for the incident")
    updated_at: datetime = Field(..., description="Timestamp when incident was last updated")

    class Config:
        from_attributes = True 