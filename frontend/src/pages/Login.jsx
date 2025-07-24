import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  Box
} from '@mantine/core'
import { IconEye, IconEyeOff, IconAlertCircle, IconShieldLock } from '@tabler/icons-react'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      if (username === 'admin' && password === '1234') {
        navigate('/admin/dashboard')
      } else if (username === 'staff' && password === '1234') {
        navigate('/staff/dashboard')
      } else if (username === 'attendee' && password === '1234') {
        navigate('/attendee/dashboard')
      } else {
        setError('Invalid username or password. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
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
                <IconShieldLock size={32} style={{ color: '#667eea' }} />
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
                  Drishti
                </Title>
              </Group>
              <Text c="dimmed" size="sm" ta="center">
                Secure Access Control System
              </Text>
            </Stack>

            <Divider w="100%" />

            {/* Login Form */}
            <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: rem(400) }}>
              <Stack spacing="lg">
                {error && (
                  <Alert 
                    icon={<IconAlertCircle size={16} />} 
                    title="Authentication Error" 
                    color="red"
                    variant="light"
                  >
                    {error}
                  </Alert>
                )}

                <TextInput
                  label="Username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Divider label="or" labelPosition="center" />

                <Text ta="center" size="sm" c="dimmed">
                  Don't have an account?{' '}
                  <Text 
                    component={Link}
                    to="/signup"
                    style={{ 
                      fontWeight: 600,
                      color: '#667eea',
                      textDecoration: 'none'
                    }}
                  >
                    Create one here
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

export default Login 