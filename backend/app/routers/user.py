from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import json
import os
import shutil

router = APIRouter(prefix="/users", tags=["users"])

# Path to the users.json file
USERS_FILE = "app/repo/users/users.json"
# Path to the zones.json file
ZONES_FILE = "app/repo/zones/zones.json"
# Path to attendees data directory
ATTENDEES_DATA_DIR = "app/data/attendees"

@router.get("/{username}/details")
async def get_user_details(username: str):
    """
    Get user details by username
    """
    try:
        # Check if users.json file exists
        if not os.path.exists(USERS_FILE):
            raise HTTPException(status_code=404, detail="Users data not found")
        
        # Read users data from JSON file
        with open(USERS_FILE, 'r') as file:
            users_data = json.load(file)
        
        # Find user by username across all user types
        user = None
        for user_type in ["admins", "staff", "attendees"]:
            if user_type in users_data:
                for user_data in users_data[user_type]:
                    if user_data.get("username") == username:
                        user = user_data
                        user["user_type"] = user_type
                        break
                if user:
                    break
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Return user details (excluding sensitive information like password)
        personal_info = user.get("personal_info", {})
        emergency_contact = user.get("emergency_contact", {})
        
        # Handle different user types with different field structures
        if user.get("user_type") == "staff":
            # Staff members have direct fields
            user_details = {
                "username": user.get("username"),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "email": user.get("contact_email", ""),
                "phone": user.get("contact_number", ""),
                "address": user.get("address", ""),
                "current_zone": user.get("assigned_zone", "Zone A - Registration"),
                "emergency_contact": {
                    "name": "",
                    "relationship": "",
                    "phone": "",
                    "email": ""
                },
                "user_type": user.get("user_type", "staff"),
                "role": user.get("role", ""),
                "profile_photo": user.get("profile_photo", ""),
                "created_at": user.get("created_at"),
                "updated_at": user.get("updated_at"),
                "family_members": []
            }
        else:
            # Attendees and admins use personal_info structure
            user_details = {
                "username": user.get("username"),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "email": personal_info.get("personal_email", ""),
                "phone": personal_info.get("contact_number", ""),
                "address": personal_info.get("address", ""),
                "current_zone": user.get("current_zone", "Zone A - Registration"),
                "emergency_contact": {
                    "name": f"{emergency_contact.get('first_name', '')} {emergency_contact.get('last_name', '')}".strip(),
                    "relationship": emergency_contact.get("relationship", ""),
                    "phone": emergency_contact.get("contact_number", ""),
                    "email": emergency_contact.get("contact_email", "")
                },
                "user_type": user.get("user_type", "attendee"),
                "role": user.get("role", ""),
                "profile_photo": user.get("profile_photo", ""),
                "created_at": user.get("created_at"),
                "updated_at": user.get("updated_at"),
                "family_members": user.get("family_members", [])
            }
        
        return {
            "success": True,
            "data": user_details
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid users data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/{username}/family-members")
async def add_family_member(
    username: str,
    first_name: str = Form(...),
    last_name: str = Form(...),
    contact: str = Form(...),
    photo: Optional[UploadFile] = File(None)
):
    """
    Add a family member to an attendee
    """
    try:
        # Check if users.json file exists
        if not os.path.exists(USERS_FILE):
            raise HTTPException(status_code=404, detail="Users data not found")
        
        # Read users data from JSON file
        with open(USERS_FILE, 'r') as file:
            users_data = json.load(file)
        
        # Find the attendee
        attendee = None
        attendee_index = None
        for i, user_data in enumerate(users_data["attendees"]):
            if user_data.get("username") == username:
                attendee = user_data
                attendee_index = i
                break
        
        if not attendee:
            raise HTTPException(status_code=404, detail="Attendee not found")
        
        # Generate family member username
        family_username = f"{username}__{first_name}__{last_name}"
        
        # Check if family member already exists
        if "family_members" in attendee:
            for family_member in attendee["family_members"]:
                if family_member.get("username") == family_username:
                    raise HTTPException(status_code=400, detail="Family member already exists")
        
        # Handle photo upload
        photo_path = None
        if photo:
            # Ensure attendees directory exists
            os.makedirs(ATTENDEES_DATA_DIR, exist_ok=True)
            
            # Save photo with family member username
            photo_filename = f"{family_username}.jpg"
            photo_path = f"data/attendees/{photo_filename}"
            photo_filepath = os.path.join(ATTENDEES_DATA_DIR, photo_filename)
            
            with open(photo_filepath, "wb") as buffer:
                shutil.copyfileobj(photo.file, buffer)
        
        # Create family member data
        family_member_data = {
            "username": family_username,
            "first_name": first_name,
            "last_name": last_name,
            "contact": contact,
            "photo_path": photo_path,
            "created_at": attendee.get("created_at")  # Use same creation date as attendee
        }
        
        # Initialize family_members array if it doesn't exist
        if "family_members" not in attendee:
            attendee["family_members"] = []
        
        # Add family member to attendee
        attendee["family_members"].append(family_member_data)
        
        # Update the users data
        users_data["attendees"][attendee_index] = attendee
        
        # Save updated data back to file
        with open(USERS_FILE, 'w') as file:
            json.dump(users_data, file, indent=2)
        
        return {
            "success": True,
            "message": "Family member added successfully",
            "data": family_member_data
        }
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid users data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{username}/family-members/{family_username}")
async def remove_family_member(username: str, family_username: str):
    """
    Remove a family member from an attendee
    """
    try:
        # Check if users.json file exists
        if not os.path.exists(USERS_FILE):
            raise HTTPException(status_code=404, detail="Users data not found")
        
        # Read users data from JSON file
        with open(USERS_FILE, 'r') as file:
            users_data = json.load(file)
        
        # Find the attendee
        attendee = None
        attendee_index = None
        for i, user_data in enumerate(users_data["attendees"]):
            if user_data.get("username") == username:
                attendee = user_data
                attendee_index = i
                break
        
        if not attendee:
            raise HTTPException(status_code=404, detail="Attendee not found")
        
        # Find and remove family member
        if "family_members" not in attendee:
            raise HTTPException(status_code=404, detail="No family members found")
        
        family_member = None
        family_member_index = None
        for i, fm in enumerate(attendee["family_members"]):
            if fm.get("username") == family_username:
                family_member = fm
                family_member_index = i
                break
        
        if not family_member:
            raise HTTPException(status_code=404, detail="Family member not found")
        
        # Remove photo file if it exists
        if family_member.get("photo_path"):
            photo_filepath = os.path.join("app", family_member["photo_path"])
            if os.path.exists(photo_filepath):
                os.remove(photo_filepath)
        
        # Remove family member from array
        attendee["family_members"].pop(family_member_index)
        
        # Update the users data
        users_data["attendees"][attendee_index] = attendee
        
        # Save updated data back to file
        with open(USERS_FILE, 'w') as file:
            json.dump(users_data, file, indent=2)
        
        return {
            "success": True,
            "message": "Family member removed successfully"
        }
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid users data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Staff Management Endpoints
@router.get("/staff")
async def get_all_staff():
    """
    Get all staff members
    """
    try:
        # Check if users.json file exists
        if not os.path.exists(USERS_FILE):
            raise HTTPException(status_code=404, detail="Users data not found")
        
        # Read users data from JSON file
        with open(USERS_FILE, 'r') as file:
            users_data = json.load(file)
        
        # Return all staff members
        staff_members = users_data.get("staff", [])
        
        return {
            "success": True,
            "data": staff_members
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid users data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/staff")
async def add_staff(
    username: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    role: str = Form(...),
    assigned_zone: str = Form(...),
    contact_email: str = Form(...),
    contact_number: str = Form(...),
    address: str = Form(...),
    status: str = Form(default="active"),
    profile_photo: Optional[UploadFile] = File(None)
):
    """
    Add a new staff member
    """
    try:
        # Check if users.json file exists
        if not os.path.exists(USERS_FILE):
            raise HTTPException(status_code=404, detail="Users data not found")
        
        # Read users data from JSON file
        with open(USERS_FILE, 'r') as file:
            users_data = json.load(file)
        
        # Check if staff member already exists
        for staff in users_data.get("staff", []):
            if staff.get("username") == username:
                raise HTTPException(status_code=400, detail="Staff member already exists")
        
        # Generate unique ID for the staff member
        existing_staff = users_data.get("staff", [])
        max_id = max([staff.get("id", 0) for staff in existing_staff]) if existing_staff else 0
        new_id = max_id + 1
        
        # Handle profile photo upload
        profile_photo_path = None
        if profile_photo:
            # Create staff data directory if it doesn't exist
            staff_data_dir = "app/data/staff"
            os.makedirs(staff_data_dir, exist_ok=True)
            
            # Generate file path with username as filename
            file_extension = os.path.splitext(profile_photo.filename)[1] if profile_photo.filename else '.jpg'
            profile_photo_path = f"data/staff/{username}{file_extension}"
            file_path = f"{staff_data_dir}/{username}{file_extension}"
            
            # Save the uploaded file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(profile_photo.file, buffer)
        
        # Create staff member data
        staff_member = {
            "id": new_id,
            "username": username,
            "password": "1234",  # Default password
            "first_name": first_name,
            "last_name": last_name,
            "role": role,
            "assigned_zone": assigned_zone,
            "contact_email": contact_email,
            "contact_number": contact_number,
            "address": address,
            "status": status,
            "user_type": "staff",
            "profile_photo": profile_photo_path,
            "created_at": "2025-01-27T00:00:00.000Z",
            "updated_at": "2025-01-27T00:00:00.000Z"
        }
        
        # Initialize staff array if it doesn't exist
        if "staff" not in users_data:
            users_data["staff"] = []
        
        # Add staff member
        users_data["staff"].append(staff_member)
        
        # Save updated data back to file
        with open(USERS_FILE, 'w') as file:
            json.dump(users_data, file, indent=2)
        
        return {
            "success": True,
            "message": "Staff member added successfully",
            "data": staff_member
        }
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid users data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/staff/{username}")
async def update_staff(
    username: str,
    new_username: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    role: str = Form(...),
    assigned_zone: str = Form(...),
    contact_email: str = Form(...),
    contact_number: str = Form(...),
    address: str = Form(...),
    status: str = Form(...),
    profile_photo: Optional[UploadFile] = File(None)
):
    """
    Update a staff member
    """
    try:
        # Check if users.json file exists
        if not os.path.exists(USERS_FILE):
            raise HTTPException(status_code=404, detail="Users data not found")
        
        # Read users data from JSON file
        with open(USERS_FILE, 'r') as file:
            users_data = json.load(file)
        
        # Find the staff member
        staff = None
        staff_index = None
        for i, staff_data in enumerate(users_data.get("staff", [])):
            if staff_data.get("username") == username:
                staff = staff_data
                staff_index = i
                break
        
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        # Check if new username already exists (if username is being changed)
        if new_username != username:
            for staff_data in users_data.get("staff", []):
                if staff_data.get("username") == new_username:
                    raise HTTPException(status_code=400, detail="Username already exists")
        
        # Handle profile photo upload
        profile_photo_path = staff.get("profile_photo")
        if profile_photo:
            # Create staff data directory if it doesn't exist
            staff_data_dir = "app/data/staff"
            os.makedirs(staff_data_dir, exist_ok=True)
            
            # Generate file path with new username as filename
            file_extension = os.path.splitext(profile_photo.filename)[1] if profile_photo.filename else '.jpg'
            profile_photo_path = f"data/staff/{new_username}{file_extension}"
            file_path = f"{staff_data_dir}/{new_username}{file_extension}"
            
            # Save the uploaded file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(profile_photo.file, buffer)
        
        # Update staff member data
        updated_staff = {
            **staff,
            "username": new_username,
            "first_name": first_name,
            "last_name": last_name,
            "role": role,
            "assigned_zone": assigned_zone,
            "contact_email": contact_email,
            "contact_number": contact_number,
            "address": address,
            "status": status,
            "profile_photo": profile_photo_path,
            "updated_at": "2025-01-27T00:00:00.000Z"
        }
        
        # Update the users data
        users_data["staff"][staff_index] = updated_staff
        
        # Save updated data back to file
        with open(USERS_FILE, 'w') as file:
            json.dump(users_data, file, indent=2)
        
        return {
            "success": True,
            "message": "Staff member updated successfully",
            "data": updated_staff
        }
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid users data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/staff/{username}")
async def delete_staff(username: str):
    """
    Delete a staff member
    """
    try:
        # Check if users.json file exists
        if not os.path.exists(USERS_FILE):
            raise HTTPException(status_code=404, detail="Users data not found")
        
        # Read users data from JSON file
        with open(USERS_FILE, 'r') as file:
            users_data = json.load(file)
        
        # Find the staff member
        staff = None
        staff_index = None
        for i, staff_data in enumerate(users_data.get("staff", [])):
            if staff_data.get("username") == username:
                staff = staff_data
                staff_index = i
                break
        
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        # Delete profile photo file if it exists
        profile_photo_path = staff.get("profile_photo")
        if profile_photo_path:
            try:
                # Convert relative path to absolute path
                file_path = f"app/{profile_photo_path}"
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                # Log the error but don't fail the deletion
                print(f"Error deleting profile photo: {e}")
        
        # Remove staff member from array
        users_data["staff"].pop(staff_index)
        
        # Save updated data back to file
        with open(USERS_FILE, 'w') as file:
            json.dump(users_data, file, indent=2)
        
        return {
            "success": True,
            "message": "Staff member deleted successfully"
        }
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid users data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/staff/available")
async def get_available_staff(zone_id: Optional[int] = None):
    """
    Get available staff members with optional zone filtering
    - If zone_id is provided: returns staff assigned to that specific zone
    - If zone_id is not provided: returns all staff members (for broadcast incidents)
    """
    try:
        # Check if users.json file exists
        if not os.path.exists(USERS_FILE):
            raise HTTPException(status_code=404, detail="Users data not found")
        
        # Read users data from JSON file
        with open(USERS_FILE, 'r') as file:
            users_data = json.load(file)
        
        # Get all staff members
        all_staff = users_data.get("staff", [])
        
        if zone_id is not None:
            # Load zones from zones.json to get zone names
            try:
                if os.path.exists(ZONES_FILE):
                    with open(ZONES_FILE, 'r') as file:
                        zones_data = json.load(file)
                        zones = zones_data.get("zones", [])
                        
                        # Find the zone with the given zone_id
                        target_zone = None
                        for zone in zones:
                            if zone.get("id") == zone_id:
                                target_zone = zone
                                break
                        
                        if target_zone:
                            zone_name = target_zone.get("name", "")
                            # Create possible zone name variations for matching
                            possible_zone_names = [
                                zone_name,
                                f"Zone {zone_id}",
                                zone_name.lower(),
                                zone_name.upper()
                            ]
                            
                            filtered_staff = []
                            for staff in all_staff:
                                assigned_zone = staff.get("assigned_zone", "")
                                # Check if the assigned_zone matches any of the possible zone names
                                if any(zone_name.lower() in assigned_zone.lower() or assigned_zone.lower() in zone_name.lower() for zone_name in possible_zone_names):
                                    filtered_staff.append(staff)
                        else:
                            # Zone not found, return empty list
                            filtered_staff = []
                else:
                    # Zones file not found, return empty list
                    filtered_staff = []
            except Exception as e:
                # Error loading zones, return empty list
                filtered_staff = []
            
            return {
                "success": True,
                "message": f"Staff members for zone {zone_id} retrieved successfully",
                "data": filtered_staff,
                "zone_id": zone_id
            }
        else:
            # Return all staff members for broadcast incidents
            return {
                "success": True,
                "message": "All available staff members retrieved successfully",
                "data": all_staff,
                "zone_id": None
            }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid users data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") 