from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, Any
from models.api_response import APIResponse
from repo.users.user import validate, get_user_info, create_attendee, username_exists
from utils.file_upload import FileUploadManager
import json

router = APIRouter(prefix="/auth", tags=["authentication"])

# Request Models
class LoginRequest(BaseModel):
    username: str
    password: str

class PersonalInfo(BaseModel):
    contact_number: str
    address: str
    personal_email: str

class EmergencyContact(BaseModel):
    first_name: str
    last_name: str
    contact_number: str
    relationship: str
    contact_email: str

class SignupRequest(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    profile_photo: Optional[str] = ""
    personal_info: PersonalInfo
    emergency_contact: EmergencyContact

# Response Data Models
class LoginData(BaseModel):
    user_type: str
    username: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_photo: Optional[str] = None
    personal_info: Optional[dict] = None
    emergency_contact: Optional[dict] = None

class SignupData(BaseModel):
    username: str
    user_type: str
    first_name: str
    last_name: str

@router.post("/login", response_model=APIResponse)
async def login(login_data: LoginRequest):
    """
    User login endpoint that validates credentials using the validate method
    """
    try:
        is_valid = validate(login_data.username, login_data.password)
        
        if is_valid:
            # Get additional user information from JSON
            user_info = get_user_info(login_data.username)
            
            return APIResponse(
                success=True,
                message="Login successful",
                data=LoginData(
                    user_type=user_info.get("user_type", login_data.username),
                    username=login_data.username,
                    role=user_info.get("role", "User"),
                    first_name=user_info.get("first_name"),
                    last_name=user_info.get("last_name"),
                    profile_photo=user_info.get("profile_photo"),
                    personal_info=user_info.get("personal_info"),
                    emergency_contact=user_info.get("emergency_contact")
                )
            )
        else:
            return APIResponse(
                success=False,
                message="Invalid credentials",
                error="Invalid username or password"
            )
            
    except Exception as e:
        return APIResponse(
            success=False,
            message="Login failed",
            error=str(e)
        )

@router.post("/signup", response_model=APIResponse)
async def signup(
    username: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    contact_number: str = Form(...),
    address: str = Form(...),
    personal_email: str = Form(...),
    emergency_first_name: str = Form(...),
    emergency_last_name: str = Form(...),
    emergency_contact_number: str = Form(...),
    emergency_relationship: str = Form(...),
    emergency_contact_email: str = Form(...),
    profile_photo: Optional[UploadFile] = File(None)
):
    """
    User signup endpoint for attendees with file upload
    """
    try:
        # Check if username already exists
        if username_exists(username):
            return APIResponse(
                success=False,
                message="Username already exists",
                error="Please choose a different username"
            )
        
        # Handle profile photo upload
        profile_photo_path = ""
        if profile_photo:
            file_manager = FileUploadManager()
            profile_photo_path = await file_manager.save_profile_photo(profile_photo, username)
        
        # Prepare signup data
        signup_data = {
            "username": username,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
            "profile_photo": profile_photo_path,
            "personal_info": {
                "contact_number": contact_number,
                "address": address,
                "personal_email": personal_email
            },
            "emergency_contact": {
                "first_name": emergency_first_name,
                "last_name": emergency_last_name,
                "contact_number": emergency_contact_number,
                "relationship": emergency_relationship,
                "contact_email": emergency_contact_email
            }
        }
        
        # Create attendee
        result = create_attendee(signup_data)
        
        if "error" in result:
            return APIResponse(
                success=False,
                message="Signup failed",
                error=result["error"]
            )
        
        return APIResponse(
            success=True,
            message="Account created successfully",
            data=SignupData(
                username=result["username"],
                user_type=result["user_type"],
                first_name=result["first_name"],
                last_name=result["last_name"]
            )
        )
        
    except Exception as e:
        return APIResponse(
            success=False,
            message="Signup failed",
            error=str(e)
        ) 