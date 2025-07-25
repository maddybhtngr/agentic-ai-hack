# Frontend-Backend API Integration

## Overview
The frontend Login component has been integrated with the FastAPI backend authentication system.

## Files Modified

### 1. `src/pages/Login.jsx`
- **Before**: Hardcoded validation logic
- **After**: API calls to backend `/auth/login` endpoint
- **Features**:
  - Real-time validation against backend
  - Proper error handling
  - Session management with localStorage
  - User type-based navigation

### 2. `src/services/api.js` (New)
- **Purpose**: Centralized API service layer
- **Features**:
  - `apiService.login()` - Handles login API calls
  - `apiService.healthCheck()` - Backend health check
  - `authUtils` - Session management utilities

### 3. `src/components/AppBar.jsx`
- **Added**: Logout functionality
- **Features**:
  - Clears user session on logout
  - Redirects to login page

## API Endpoints

### Login
- **URL**: `POST http://localhost:8000/auth/login`
- **Request**:
  ```json
  {
    "username": "admin|staff|attendee",
    "password": "1234"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user_type": "admin",
      "username": "admin",
      "role": "Administrator"
    },
    "error": null
  }
  ```

## User Credentials
- **Admin**: `admin/1234`
- **Staff**: `staff/1234`
- **Attendee**: `attendee/1234`

## Session Management
- User data stored in `localStorage`
- Automatic navigation based on user type
- Logout clears session and redirects to login

## Error Handling
- Network errors
- Server errors
- Invalid credentials
- User-friendly error messages

## Usage
1. Start the backend: `cd backend && python app/main.py`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to login page and use credentials above 