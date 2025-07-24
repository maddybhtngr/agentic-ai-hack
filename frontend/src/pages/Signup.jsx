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
  Select
} from '@mantine/core'
import { IconEye, IconEyeOff, IconAlertCircle, IconShieldLock, IconUserPlus } from '@tabler/icons-react'

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
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
    return true
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate successful registration
      setSuccess('Account created successfully! Redirecting to login...')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError('An error occurred during registration. Please try again.')
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

            {/* Signup Form */}
            <form onSubmit={handleSignup} style={{ width: '100%' }}>
              <Stack spacing="lg">
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

                <TextInput
                  label="Username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      borderColor: '#e9ecef',
                      '&:focus': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 1px #667eea'
                      }
                    }
                  }}
                />

                <TextInput
                  label="Email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  size="md"
                  radius="md"
                  type="email"
                  styles={{
                    input: {
                      borderColor: '#e9ecef',
                      '&:focus': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 1px #667eea'
                      }
                    }
                  }}
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
                  styles={{
                    input: {
                      borderColor: '#e9ecef',
                      '&:focus': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 1px #667eea'
                      }
                    }
                  }}
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
                  styles={{
                    input: {
                      borderColor: '#e9ecef',
                      '&:focus': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 1px #667eea'
                      }
                    }
                  }}
                />

                <Button 
                  type="submit"
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
                  styles={{
                    root: {
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                      },
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Divider label="or" labelPosition="center" />

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
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default Signup 