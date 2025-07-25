// API Configuration
const API_BASE_URL = 'http://localhost:8000'

// API Service functions
export const apiService = {
  // Login API call
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  // Signup API call
  async signup(signupData) {
    const formData = new FormData()
    
    // Add basic info
    formData.append('username', signupData.username)
    formData.append('password', signupData.password)
    formData.append('first_name', signupData.first_name)
    formData.append('last_name', signupData.last_name)
    
    // Add profile photo if exists
    if (signupData.profile_photo) {
      formData.append('profile_photo', signupData.profile_photo)
    }
    
    // Add personal info
    formData.append('contact_number', signupData.personal_info.contact_number)
    formData.append('address', signupData.personal_info.address)
    formData.append('personal_email', signupData.personal_info.personal_email)
    
    // Add emergency contact
    formData.append('emergency_first_name', signupData.emergency_contact.first_name)
    formData.append('emergency_last_name', signupData.emergency_contact.last_name)
    formData.append('emergency_contact_number', signupData.emergency_contact.contact_number)
    formData.append('emergency_relationship', signupData.emergency_contact.relationship)
    formData.append('emergency_contact_email', signupData.emergency_contact.contact_email)

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  // Health check API call
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  }
}

// Auth utilities
export const authUtils = {
  // Store user session
  setUserSession(userData) {
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAuthenticated', 'true')
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true'
  },

  // Clear user session (logout)
  clearSession() {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
  },

  // Get user type for navigation
  getUserType() {
    const user = this.getCurrentUser()
    return user ? user.user_type : null
  }
} 