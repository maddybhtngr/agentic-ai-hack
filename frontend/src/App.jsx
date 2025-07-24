import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import CommandCenter from './pages/CommandCenter'
import StaffDashboard from './pages/StaffDashboard'
import StaffIncidentManagement from './pages/StaffIncidentManagement'
import StaffAIIntelligence from './pages/StaffAIIntelligence'
import StaffDetails from './pages/StaffDetails'
import AttendeeDashboard from './pages/AttendeeDashboard'
import AttendeeIncidentManagement from './pages/AttendeeIncidentManagement'
import AttendeeDetails from './pages/AttendeeDetails'
import AttendeeEmergencyServices from './pages/AttendeeEmergencyServices'
import AttendeeAIInsights from './pages/AttendeeAIInsights'
import IncidentManagement from './pages/IncidentManagement'
import EventDetails from './pages/EventDetails'
import StaffManagement from './pages/StaffManagement'
import EmergencyServices from './pages/EmergencyServices'
import AIIntelligence from './pages/AIIntelligence'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/command" element={<CommandCenter />} />
        <Route path="/admin/Incident-management" element={<IncidentManagement />} />
        <Route path="/admin/event-details" element={<EventDetails />} />
        <Route path="/admin/staff-management" element={<StaffManagement />} />
        <Route path="/admin/emergency-services" element={<EmergencyServices />} />
        <Route path="/admin/ai-intelligence" element={<AIIntelligence />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/incident-management" element={<StaffIncidentManagement />} />
        <Route path="/staff/ai-intelligence" element={<StaffAIIntelligence />} />
        <Route path="/staff/staff-details" element={<StaffDetails />} />
        <Route path="/attendee/dashboard" element={<AttendeeDashboard />} />
        <Route path="/attendee/incident-management" element={<AttendeeIncidentManagement />} />
        <Route path="/attendee/attendee-details" element={<AttendeeDetails />} />
        <Route path="/attendee/emergency-services" element={<AttendeeEmergencyServices />} />
        <Route path="/attendee/ai-insights" element={<AttendeeAIInsights />} />
      </Routes>
    </Router>
  )
}

export default App
