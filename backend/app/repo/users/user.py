import json
import os
from datetime import datetime

def validate(username: str, password: str) -> bool:
    """
    Validate username and password credentials from JSON file.
    
    Args:
        username (str): The username to validate
        password (str): The password to validate
        
    Returns:
        bool: True if credentials are valid, False otherwise
    """
    try:
        # Get the path to the users.json file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_file_path = os.path.join(current_dir, "users.json")
        
        # Read the JSON file
        with open(json_file_path, 'r') as file:
            data = json.load(file)
        
        # Check all user types for username and password match
        all_users = []
        all_users.extend(data.get("admins", []))
        all_users.extend(data.get("staff", []))
        all_users.extend(data.get("attendees", []))
        
        for user in all_users:
            if user.get("username") == username and user.get("password") == password:
                return True
                
        return False
        
    except FileNotFoundError:
        print(f"Error: users.json file not found at {json_file_path}")
        return False
    except json.JSONDecodeError:
        print("Error: Invalid JSON format in users.json")
        return False
    except Exception as e:
        print(f"Error reading users.json: {str(e)}")
        return False

def get_user_info(username: str) -> dict:
    """
    Get user information from JSON file.
    
    Args:
        username (str): The username to look up
        
    Returns:
        dict: User information or None if not found
    """
    try:
        # Get the path to the users.json file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_file_path = os.path.join(current_dir, "users.json")
        
        # Read the JSON file
        with open(json_file_path, 'r') as file:
            data = json.load(file)
        
        # Find user by username across all user types
        all_users = []
        all_users.extend(data.get("admins", []))
        all_users.extend(data.get("staff", []))
        all_users.extend(data.get("attendees", []))
        
        for user in all_users:
            if user.get("username") == username:
                return user
                
        return None
        
    except Exception as e:
        print(f"Error reading user info: {str(e)}")
        return None

def create_attendee(attendee_data: dict) -> dict:
    """
    Create a new attendee user and save to JSON file.
    
    Args:
        attendee_data (dict): Attendee information
        
    Returns:
        dict: Created attendee data or None if failed
    """
    try:
        # Get the path to the users.json file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_file_path = os.path.join(current_dir, "users.json")
        
        # Read the JSON file
        with open(json_file_path, 'r') as file:
            data = json.load(file)
        
        # Check if username already exists
        all_users = []
        all_users.extend(data.get("admins", []))
        all_users.extend(data.get("staff", []))
        all_users.extend(data.get("attendees", []))
        
        for user in all_users:
            if user.get("username") == attendee_data.get("username"):
                return {"error": "Username already exists"}
        
        # Generate timestamp
        current_time = datetime.utcnow().isoformat() + "Z"
        
        # Create new attendee object
        new_attendee = {
            "username": attendee_data.get("username"),
            "password": attendee_data.get("password"),
            "user_type": "attendee",
            "role": "Event Attendee",
            "first_name": attendee_data.get("first_name"),
            "last_name": attendee_data.get("last_name"),
            "profile_photo": attendee_data.get("profile_photo", ""),
            "personal_info": {
                "contact_number": attendee_data.get("personal_info", {}).get("contact_number"),
                "address": attendee_data.get("personal_info", {}).get("address"),
                "personal_email": attendee_data.get("personal_info", {}).get("personal_email")
            },
            "emergency_contact": {
                "first_name": attendee_data.get("emergency_contact", {}).get("first_name"),
                "last_name": attendee_data.get("emergency_contact", {}).get("last_name"),
                "contact_number": attendee_data.get("emergency_contact", {}).get("contact_number"),
                "relationship": attendee_data.get("emergency_contact", {}).get("relationship"),
                "contact_email": attendee_data.get("emergency_contact", {}).get("contact_email")
            },
            "created_at": current_time,
            "updated_at": current_time
        }
        
        # Add to attendees list
        data["attendees"].append(new_attendee)
        
        # Write back to file
        with open(json_file_path, 'w') as file:
            json.dump(data, file, indent=2)
        
        return new_attendee
        
    except Exception as e:
        print(f"Error creating attendee: {str(e)}")
        return {"error": f"Failed to create attendee: {str(e)}"}

def username_exists(username: str) -> bool:
    """
    Check if username already exists in any user type.
    
    Args:
        username (str): Username to check
        
    Returns:
        bool: True if username exists, False otherwise
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_file_path = os.path.join(current_dir, "users.json")
        
        with open(json_file_path, 'r') as file:
            data = json.load(file)
        
        all_users = []
        all_users.extend(data.get("admins", []))
        all_users.extend(data.get("staff", []))
        all_users.extend(data.get("attendees", []))
        
        for user in all_users:
            if user.get("username") == username:
                return True
                
        return False
        
    except Exception as e:
        print(f"Error checking username: {str(e)}")
        return False 