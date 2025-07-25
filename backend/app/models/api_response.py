from pydantic import BaseModel
from typing import Optional, Any

class APIResponse(BaseModel):
    """
    Standard API Response Model for all endpoints
    
    Attributes:
        success (bool): Whether the request was successful
        message (str): Human-readable message about the response
        data (Optional[Any]): Response data payload
        error (Optional[str]): Error message if success is False
    """
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None

class ErrorResponse(BaseModel):
    """
    Standard Error Response Model
    """
    success: bool = False
    message: str
    error: str 