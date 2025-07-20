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
  rem
} from '@mantine/core'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      if (username === 'admin' && password === '1234') {
        navigate('/admin/dashboard')
      } else if (username === 'staff' && password === '1234') {
        navigate('/staff/dashboard')
      } else if (username === 'attendee' && password === '1234') {
        navigate('/attendee/dashboard')
      } else {
        alert('Invalid username or password')
      }
    } catch (err) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="sm" py="xl">
      <Stack spacing="xl" align="center">
        <Title order={1}>Drishti</Title>
        
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: rem(400) }}>
          <Stack spacing="md">
            <TextInput
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            
            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              visibilityToggleIcon={({ reveal }) => 
                reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
              }
              required
            />

            <Button 
              type="submit"
              loading={loading}
              fullWidth
            >
              Log In
            </Button>

            <Text ta="center" size="sm">
              Don't have an account?{' '}
              <Text 
                component={Link}
                to="/signup"
                c="blue" 
                style={{ fontWeight: 600 }}
              >
                Register here
              </Text>
            </Text>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
}

export default Login 