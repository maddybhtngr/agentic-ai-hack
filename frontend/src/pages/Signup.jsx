import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Text, 
  Stack,
  Container,
  Title,
  rem,
  Paper,
  Group,
  Divider,
  Alert,
  Box,
  Select,
  Stepper,
  Textarea,
  FileInput
} from '@mantine/core'
import { IconEye, IconEyeOff, IconAlertCircle, IconShieldLock, IconUserPlus, IconUpload } from '@tabler/icons-react'
import { apiService } from '../services/api'

function Signup() {
  const [active, setActive] = useState(0)
  const [formData, setFormData] = useState({
    // Basic Info
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    profile_photo: '',
    
    // Personal Information
    personal_info: {
      contact_number: '',
      address: '',
      personal_email: ''
    },
    
    // Emergency Contact
    emergency_contact: {
      first_name: '',
      last_name: '',
      contact_number: '',
      relationship: '',
      contact_email: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setError('')
  }

  const validateStep = (step) => {
    switch (step) {
      case 0: // Basic Info
        if (!formData.username.trim()) {
          setError('Username is required')
          return false
        }
        if (!formData.first_name.trim()) {
          setError('First name is required')
          return false
        }
        if (!formData.last_name.trim()) {
          setError('Last name is required')
          return false
        }
        if (!formData.password) {
          setError('Password is required')
          return false
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return false
        }
        break
      
      case 1: // Personal Info
        if (!formData.personal_info.contact_number.trim()) {
          setError('Contact number is required')
          return false
        }
        if (!formData.personal_info.address.trim()) {
          setError('Address is required')
          return false
        }
        if (!formData.personal_info.personal_email.trim()) {
          setError('Personal email is required')
          return false
        }
        if (!formData.personal_info.personal_email.includes('@')) {
          setError('Please enter a valid email address')
          return false
        }
        break
      
      case 2: // Emergency Contact
        if (!formData.emergency_contact.first_name.trim()) {
          setError('Emergency contact first name is required')
          return false
        }
        if (!formData.emergency_contact.last_name.trim()) {
          setError('Emergency contact last name is required')
          return false
        }
        if (!formData.emergency_contact.contact_number.trim()) {
          setError('Emergency contact number is required')
          return false
        }
        if (!formData.emergency_contact.relationship.trim()) {
          setError('Relationship is required')
          return false
        }
        if (!formData.emergency_contact.contact_email.trim()) {
          setError('Emergency contact email is required')
          return false
        }
        if (!formData.emergency_contact.contact_email.includes('@')) {
          setError('Please enter a valid emergency contact email address')
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(active)) {
      setActive((current) => (current < 3 ? current + 1 : current))
      setError('')
    }
  }

  const prevStep = () => {
    setActive((current) => (current > 0 ? current - 1 : current))
    setError('')
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Prepare signup data
      const signupData = {
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        profile_photo: formData.profile_photo,
        personal_info: formData.personal_info,
        emergency_contact: formData.emergency_contact
      }

      // Call signup API
      const response = await apiService.signup(signupData)

      if (response.success) {
        setSuccess('Account created successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(response.message || 'Signup failed. Please try again.')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: rem(20)
      }}
    >
      <Container size="sm">
        <Paper
          shadow="xl"
          radius="lg"
          p="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Stack spacing="xl" align="center">
            {/* Header */}
            <Stack spacing="xs" align="center">
              <Group gap="xs">
                <IconUserPlus size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1} 
                  size="h2"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Join Drishti
                </Title>
              </Group>
              <Text c="dimmed" size="sm" ta="center">
                Create your account for secure access
              </Text>
            </Stack>

            <Divider w="100%" />

            {/* Multi-step Signup Form */}
            <div style={{ width: '100%' }}>
              <Stepper 
                active={active} 
                onStepClick={setActive}
                breakpoint="sm"
                size="sm"
                styles={{
                  step: {
                    '&[data-progress="true"]': {
                      borderColor: '#667eea'
                    }
                  },
                  stepIcon: {
                    '&[data-progress="true"]': {
                      backgroundColor: '#667eea',
                      borderColor: '#667eea'
                    }
                  }
                }}
              >
                <Stepper.Step label="Basic Info" description="Account details">
                  <Stack spacing="lg" mt="xl">
                    {error && (
                      <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        title="Validation Error" 
                        color="red"
                        variant="light"
                      >
                        {error}
                      </Alert>
                    )}

                    <TextInput
                      label="Username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      required
                      size="md"
                      radius="md"
                    />

                    <Group grow>
                      <TextInput
                        label="First Name"
                        placeholder="Enter your first name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        required
                        size="md"
                        radius="md"
                      />
                      <TextInput
                        label="Last Name"
                        placeholder="Enter your last name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        required
                        size="md"
                        radius="md"
                      />
                    </Group>

                    <FileInput
                      label="Profile Photo"
                      placeholder="Upload your profile photo"
                      accept="image/*"
                      icon={<IconUpload size={14} />}
                      value={formData.profile_photo}
                      onChange={(value) => handleInputChange('profile_photo', value)}
                      size="md"
                      radius="md"
                    />
                    
                    <PasswordInput
                      label="Password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      visibilityToggleIcon={({ reveal }) => 
                        reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
                      }
                      required
                      size="md"
                      radius="md"
                    />

                    <PasswordInput
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      visibilityToggleIcon={({ reveal }) => 
                        reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
                      }
                      required
                      size="md"
                      radius="md"
                    />
                  </Stack>
                </Stepper.Step>

                <Stepper.Step label="Personal Info" description="Contact details">
                  <Stack spacing="lg" mt="xl">
                    {error && (
                      <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        title="Validation Error" 
                        color="red"
                        variant="light"
                      >
                        {error}
                      </Alert>
                    )}

                    <TextInput
                      label="Contact Number"
                      placeholder="Enter your phone number"
                      value={formData.personal_info.contact_number}
                      onChange={(e) => handleNestedInputChange('personal_info', 'contact_number', e.target.value)}
                      required
                      size="md"
                      radius="md"
                    />

                    <Textarea
                      label="Address"
                      placeholder="Enter your full address"
                      value={formData.personal_info.address}
                      onChange={(e) => handleNestedInputChange('personal_info', 'address', e.target.value)}
                      required
                      size="md"
                      radius="md"
                      minRows={3}
                    />

                    <TextInput
                      label="Personal Email"
                      placeholder="Enter your email address"
                      value={formData.personal_info.personal_email}
                      onChange={(e) => handleNestedInputChange('personal_info', 'personal_email', e.target.value)}
                      required
                      size="md"
                      radius="md"
                      type="email"
                    />
                  </Stack>
                </Stepper.Step>

                <Stepper.Step label="Emergency Contact" description="Emergency details">
                  <Stack spacing="lg" mt="xl">
                    {error && (
                      <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        title="Validation Error" 
                        color="red"
                        variant="light"
                      >
                        {error}
                      </Alert>
                    )}

                    <Group grow>
                      <TextInput
                        label="First Name"
                        placeholder="Emergency contact first name"
                        value={formData.emergency_contact.first_name}
                        onChange={(e) => handleNestedInputChange('emergency_contact', 'first_name', e.target.value)}
                        required
                        size="md"
                        radius="md"
                      />
                      <TextInput
                        label="Last Name"
                        placeholder="Emergency contact last name"
                        value={formData.emergency_contact.last_name}
                        onChange={(e) => handleNestedInputChange('emergency_contact', 'last_name', e.target.value)}
                        required
                        size="md"
                        radius="md"
                      />
                    </Group>

                    <TextInput
                      label="Contact Number"
                      placeholder="Emergency contact phone number"
                      value={formData.emergency_contact.contact_number}
                      onChange={(e) => handleNestedInputChange('emergency_contact', 'contact_number', e.target.value)}
                      required
                      size="md"
                      radius="md"
                    />

                    <Select
                      label="Relationship"
                      placeholder="Select relationship"
                      value={formData.emergency_contact.relationship}
                      onChange={(value) => handleNestedInputChange('emergency_contact', 'relationship', value)}
                      data={[
                        { value: 'Spouse', label: 'Spouse' },
                        { value: 'Parent', label: 'Parent' },
                        { value: 'Sibling', label: 'Sibling' },
                        { value: 'Friend', label: 'Friend' },
                        { value: 'Colleague', label: 'Colleague' },
                        { value: 'Other', label: 'Other' }
                      ]}
                      required
                      size="md"
                      radius="md"
                    />

                    <TextInput
                      label="Contact Email"
                      placeholder="Emergency contact email"
                      value={formData.emergency_contact.contact_email}
                      onChange={(e) => handleNestedInputChange('emergency_contact', 'contact_email', e.target.value)}
                      required
                      size="md"
                      radius="md"
                      type="email"
                    />
                  </Stack>
                </Stepper.Step>

                <Stepper.Completed>
                  <Stack spacing="lg" mt="xl">
                    {success && (
                      <Alert 
                        icon={<IconShieldLock size={16} />} 
                        title="Success!" 
                        color="green"
                        variant="light"
                      >
                        {success}
                      </Alert>
                    )}

                    {error && (
                      <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        title="Registration Error" 
                        color="red"
                        variant="light"
                      >
                        {error}
                      </Alert>
                    )}

                    <Text ta="center" size="lg" fw={600}>
                      Review Your Information
                    </Text>
                    
                    <Paper p="md" withBorder>
                      <Stack spacing="xs">
                        <Text><strong>Name:</strong> {formData.first_name} {formData.last_name}</Text>
                        <Text><strong>Username:</strong> {formData.username}</Text>
                        <Text><strong>Contact:</strong> {formData.personal_info.contact_number}</Text>
                        <Text><strong>Email:</strong> {formData.personal_info.personal_email}</Text>
                        <Text><strong>Emergency Contact:</strong> {formData.emergency_contact.first_name} {formData.emergency_contact.last_name}</Text>
                        <Text><strong>Relationship:</strong> {formData.emergency_contact.relationship}</Text>
                      </Stack>
                    </Paper>

                    <Button 
                      onClick={handleSignup}
                      loading={loading}
                      fullWidth
                      size="md"
                      radius="md"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: rem(16),
                        height: rem(48)
                      }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </Stack>
                </Stepper.Completed>
              </Stepper>

              {/* Navigation Buttons */}
              {active < 3 && (
                <Group justify="center" mt="xl">
                  <Button 
                    variant="default" 
                    onClick={prevStep}
                    disabled={active === 0}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    {active === 2 ? 'Complete' : 'Next'}
                  </Button>
                </Group>
              )}

              <Divider label="or" labelPosition="center" mt="xl" />

              <Text ta="center" size="sm" c="dimmed">
                Already have an account?{' '}
                <Text 
                  component={Link}
                  to="/login"
                  style={{ 
                    fontWeight: 600,
                    color: '#667eea',
                    textDecoration: 'none'
                  }}
                >
                  Sign in here
                </Text>
              </Text>
            </div>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default Signup 