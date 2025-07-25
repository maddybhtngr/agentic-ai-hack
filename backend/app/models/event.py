from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class EventDetailsBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    date: str = Field(..., min_length=1, max_length=100)
    time: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    address: str = Field(..., min_length=1, max_length=500)
    capacity: int = Field(..., gt=0)
    registered: int = Field(..., ge=0)
    description: str = Field(..., min_length=1, max_length=2000)
    organizer: str = Field(..., min_length=1, max_length=200)
    contact: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=1, max_length=200)
    website: str = Field(..., min_length=1, max_length=200)
    status: str = Field(..., min_length=1, max_length=50)
    type: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=100)

class EventDetailsCreate(EventDetailsBase):
    pass

class EventDetailsUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    date: Optional[str] = Field(None, min_length=1, max_length=100)
    time: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    capacity: Optional[int] = Field(None, gt=0)
    registered: Optional[int] = Field(None, ge=0)
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    organizer: Optional[str] = Field(None, min_length=1, max_length=200)
    contact: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[str] = Field(None, min_length=1, max_length=200)
    website: Optional[str] = Field(None, min_length=1, max_length=200)
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    type: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=100)

class EventDetails(EventDetailsBase):
    pass

class ScheduleItemBase(BaseModel):
    start_time: str = Field(..., min_length=1, max_length=10)
    end_time: str = Field(..., min_length=1, max_length=10)
    location: str = Field(..., min_length=1, max_length=200)
    details: str = Field(..., min_length=1, max_length=500)

class ScheduleItemCreate(ScheduleItemBase):
    pass

class ScheduleItemUpdate(BaseModel):
    start_time: Optional[str] = Field(None, min_length=1, max_length=10)
    end_time: Optional[str] = Field(None, min_length=1, max_length=10)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    details: Optional[str] = Field(None, min_length=1, max_length=500)

class ScheduleItem(ScheduleItemBase):
    id: int

class EventData(BaseModel):
    event_details: EventDetails
    event_schedule: List[ScheduleItem] 