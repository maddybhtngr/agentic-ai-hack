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
  },

  // Get user details by username
  async getUserDetails(username) {
    const response = await fetch(`${API_BASE_URL}/users/${username}/details`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  // Add family member
  async addFamilyMember(username, familyMemberData) {
    const formData = new FormData()
    formData.append('first_name', familyMemberData.firstName)
    formData.append('last_name', familyMemberData.lastName)
    formData.append('contact', familyMemberData.contact)
    
    if (familyMemberData.photo) {
      formData.append('photo', familyMemberData.photo)
    }

    const response = await fetch(`${API_BASE_URL}/users/${username}/family-members`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  // Remove family member
  async removeFamilyMember(username, familyUsername) {
    const response = await fetch(`${API_BASE_URL}/users/${username}/family-members/${familyUsername}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  // Staff Management APIs
  async getAllStaff() {
    const response = await fetch(`${API_BASE_URL}/users/staff`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async addStaff(staffData) {
    const formData = new FormData()
    formData.append('username', staffData.username)
    formData.append('first_name', staffData.firstName)
    formData.append('last_name', staffData.lastName)
    formData.append('role', staffData.role)
    formData.append('assigned_zone', staffData.assignedZone)
    formData.append('contact_email', staffData.contactEmail)
    formData.append('contact_number', staffData.contactNumber)
    formData.append('address', staffData.address)
    formData.append('status', staffData.status || 'active')
    
    // Add profile photo if exists
    if (staffData.profile_photo) {
      formData.append('profile_photo', staffData.profile_photo)
    }

    const response = await fetch(`${API_BASE_URL}/users/staff`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async updateStaff(username, staffData) {
    const formData = new FormData()
    formData.append('new_username', staffData.username)
    formData.append('first_name', staffData.firstName)
    formData.append('last_name', staffData.lastName)
    formData.append('role', staffData.role)
    formData.append('assigned_zone', staffData.assignedZone)
    formData.append('contact_email', staffData.contactEmail)
    formData.append('contact_number', staffData.contactNumber)
    formData.append('address', staffData.address)
    formData.append('status', staffData.status)
    
    // Add profile photo if exists
    if (staffData.profile_photo) {
      formData.append('profile_photo', staffData.profile_photo)
    }

    const response = await fetch(`${API_BASE_URL}/users/staff/${username}`, {
      method: 'PUT',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async deleteStaff(username) {
    const response = await fetch(`${API_BASE_URL}/users/staff/${username}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  // Zone Management API calls
  async getAllZones() {
    const response = await fetch(`${API_BASE_URL}/zones`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getZoneCrowdDetails(zoneId) {
    const response = await fetch(`${API_BASE_URL}/zones/${zoneId}/details`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getAllZonesCrowdDetails() {
    const response = await fetch(`${API_BASE_URL}/zones/crowd/details`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getZoneTypes() {
    const response = await fetch(`${API_BASE_URL}/zones/types`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getZone(zoneId) {
    const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async createZone(zoneData) {
    const response = await fetch(`${API_BASE_URL}/zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zoneData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async updateZone(zoneId, zoneData) {
    const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zoneData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async deleteZone(zoneId) {
    const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  // Events API calls
  async getEvents() {
    const response = await fetch(`${API_BASE_URL}/events/`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getEventDetails() {
    const response = await fetch(`${API_BASE_URL}/events/details`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async updateEventDetails(details) {
    const response = await fetch(`${API_BASE_URL}/events/details`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async getEventSchedule() {
    const response = await fetch(`${API_BASE_URL}/events/schedule`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async addScheduleItem(item) {
    const response = await fetch(`${API_BASE_URL}/events/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async updateScheduleItem(itemId, item) {
    const response = await fetch(`${API_BASE_URL}/events/schedule/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async deleteScheduleItem(itemId) {
    const response = await fetch(`${API_BASE_URL}/events/schedule/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  // Emergency API calls
  async getAllEmergencyData() {
    const response = await fetch(`${API_BASE_URL}/emergency/`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getEmergencyContacts() {
    const response = await fetch(`${API_BASE_URL}/emergency/contacts`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getEmergencyContact(contactId) {
    const response = await fetch(`${API_BASE_URL}/emergency/contacts/${contactId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async createEmergencyContact(contactData) {
    const response = await fetch(`${API_BASE_URL}/emergency/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async updateEmergencyContact(contactId, contactData) {
    const response = await fetch(`${API_BASE_URL}/emergency/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async deleteEmergencyContact(contactId) {
    const response = await fetch(`${API_BASE_URL}/emergency/contacts/${contactId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async getNearbyServices() {
    const response = await fetch(`${API_BASE_URL}/emergency/services`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getNearbyService(serviceId) {
    const response = await fetch(`${API_BASE_URL}/emergency/services/${serviceId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async createNearbyService(serviceData) {
    const response = await fetch(`${API_BASE_URL}/emergency/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async updateNearbyService(serviceId, serviceData) {
    const response = await fetch(`${API_BASE_URL}/emergency/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async deleteNearbyService(serviceId) {
    const response = await fetch(`${API_BASE_URL}/emergency/services/${serviceId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  // Incidents API calls
  async getAllIncidents() {
    const response = await fetch(`${API_BASE_URL}/incidents/`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getReportedIncidents() {
    const response = await fetch(`${API_BASE_URL}/incidents/reported`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getAssignedIncidents() {
    const response = await fetch(`${API_BASE_URL}/incidents/assigned`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getResolvedIncidents() {
    const response = await fetch(`${API_BASE_URL}/incidents/resolved`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getIncident(incidentId) {
    const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async createIncident(incidentData) {
    const formData = new FormData()
    
    // Add all incident data to form
    formData.append('reporter', incidentData.reporter)
    formData.append('reporter_name', incidentData.reporter_name)
    formData.append('incident_priority', incidentData.incident_priority)
    formData.append('incident_type', incidentData.incident_type)
    formData.append('incident_summary', incidentData.incident_summary)
    formData.append('incident_details', incidentData.incident_details)
    formData.append('is_broadcast', incidentData.is_broadcast ? 'true' : 'false')
    
    // Add zone_id if not broadcasting
    if (!incidentData.is_broadcast && incidentData.zone_id) {
      formData.append('zone_id', incidentData.zone_id.toString())
    }
    
    // Add image file if provided
    if (incidentData.additional_image) {
      formData.append('additional_image', incidentData.additional_image)
    }

    const response = await fetch(`${API_BASE_URL}/incidents/`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async updateIncident(incidentId, incidentData) {
    const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incidentData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async deleteIncident(incidentId) {
    const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async assignIncident(incidentId, resolver) {
    const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resolver })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async resolveIncident(incidentId) {
    const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  async getIncidentStats() {
    const response = await fetch(`${API_BASE_URL}/incidents/stats/summary`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getAvailableZones() {
    const response = await fetch(`${API_BASE_URL}/incidents/zones/available`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getAvailableStaff(zoneId = null) {
    const url = zoneId 
      ? `${API_BASE_URL}/users/staff/available?zone_id=${zoneId}`
      : `${API_BASE_URL}/users/staff/available`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  // CCTV Analytics API calls
  async getCCTVFeeds() {
    const response = await fetch(`${API_BASE_URL}/cctv/feeds`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getCCTVFeedData(cctvId, timestampIndex = null) {
    const url = timestampIndex !== null 
      ? `${API_BASE_URL}/cctv/feeds/${cctvId}?timestamp_index=${timestampIndex}`
      : `${API_BASE_URL}/cctv/feeds/${cctvId}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getNextCCTVTimestamp(cctvId, currentIndex = 0) {
    const response = await fetch(`${API_BASE_URL}/cctv/feeds/${cctvId}/next?current_index=${currentIndex}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getCCTVTimeline(cctvId, limit = 100) {
    const response = await fetch(`${API_BASE_URL}/cctv/feeds/${cctvId}/timeline?limit=${limit}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  async getCCTVAnalyticsOverview() {
    const response = await fetch(`${API_BASE_URL}/cctv/analytics/overview`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  },

  // Crowd Monitoring AI API calls
  async getCrowdMonitoringAnalysis() {
    const response = await fetch('http://localhost:8002/api/v1/monitor-crowd')
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