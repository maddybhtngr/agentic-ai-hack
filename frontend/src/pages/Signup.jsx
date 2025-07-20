import { Link } from 'react-router-dom'
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

function Signup() {
  return (
    <Container size="sm" py="xl">
      <Stack spacing="xl" align="center">
        <Title order={1}>Drishti</Title>
        
        <form style={{ width: '100%', maxWidth: rem(400) }}>
          <Stack spacing="md">
            <TextInput
              label="Username"
              placeholder="Choose a username"
              required
            />
            
            <PasswordInput
              label="Password"
              placeholder="Create password"
              visibilityToggleIcon={({ reveal }) => 
                reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
              }
              required
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              visibilityToggleIcon={({ reveal }) => 
                reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
              }
              required
            />

            <Button 
              fullWidth
            >
              Sign Up
            </Button>

            <Text ta="center" size="sm">
              Already have an account?{' '}
              <Text 
                component={Link}
                to="/login"
                c="blue" 
                style={{ fontWeight: 600 }}
              >
                Login here
              </Text>
            </Text>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
}

export default Signup 