import { 
  AppShell, 
  Stack, 
  ActionIcon, 
  Text, 
  Group, 
  Divider, 
  Paper, 
  rem,
  Badge
} from '@mantine/core'
import { 
  IconDashboard, 
  IconAlertTriangle, 
  IconUser, 
  IconPhoneCall, 
  IconMapPin,
  IconUsers
} from '@tabler/icons-react'
import { useNavigate, useLocation } from 'react-router-dom'

const AttendeeSidebar = ({ opened = false }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      label: 'Overview',
      icon: IconDashboard,
      path: '/attendee/dashboard',
      active: location.pathname === '/attendee/dashboard'
    },
    {
      label: 'Incident Management',
      icon: IconAlertTriangle,
      path: '/attendee/incident-management',
      active: location.pathname === '/attendee/incident-management'
    },
    {
      label: 'Emergency Services',
      icon: IconPhoneCall,
      path: '/attendee/emergency-services',
      active: location.pathname === '/attendee/emergency-services'
    },
    {
      label: 'AI Insights',
      icon: IconMapPin,
      path: '/attendee/ai-insights',
      active: location.pathname === '/attendee/ai-insights'
    },    
    {
      label: 'Attendee Details',
      icon: IconUser,
      path: '/attendee/attendee-details',
      active: location.pathname === '/attendee/attendee-details'
    }
  ]

  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <AppShell.Navbar 
      p="md" 
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      <AppShell.Section grow>
        <Stack gap="md">
          {/* Header */}
          <Paper 
            p="md" 
            radius="lg" 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            <Group gap="xs" justify="center">
              <IconUsers size={20} style={{ color: 'white' }} />
              <Text size="sm" fw={600} c="white">
                Attendee Panel
              </Text>
            </Group>
          </Paper>

          <Divider />

          {/* Navigation Menu */}
          <Stack gap="xs">
            {menuItems.map((item, index) => (
              <ActionIcon
                key={index}
                variant={item.active ? "light" : "subtle"}
                size="lg"
                style={{ 
                  justifyContent: 'flex-start', 
                  width: '100%',
                  paddingLeft: rem(16),
                  paddingRight: rem(12),
                  background: item.active 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'transparent',
                  color: item.active ? 'white' : 'inherit',
                  borderRadius: rem(12),
                  border: item.active ? 'none' : '1px solid transparent',
                  '&:hover': {
                    background: item.active 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateX(4px)',
                    borderColor: 'rgba(102, 126, 234, 0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
                leftSection={
                  <item.icon 
                    size={18} 
                    style={{ 
                      color: item.active ? 'white' : '#667eea',
                      opacity: item.active ? 1 : 0.8
                    }} 
                  />
                }
                onClick={() => handleNavigation(item.path)}
              >
                <Group gap="xs" justify="space-between" style={{ width: '100%' }}>
                  <Text 
                    size="sm" 
                    fw={item.active ? 600 : 500}
                    style={{ color: item.active ? 'white' : 'inherit' }}
                  >
                    {item.label}
                  </Text>
                  {item.badge && (
                    <Badge 
                      size="xs" 
                      variant={item.active ? "white" : "light"}
                      style={{
                        background: item.active 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'rgba(102, 126, 234, 0.1)',
                        color: item.active ? 'white' : '#667eea'
                      }}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Group>
              </ActionIcon>
            ))}
          </Stack>
        </Stack>
      </AppShell.Section>

      {/* Footer */}
      <AppShell.Section>
        <Paper 
          p="md" 
          radius="md" 
          style={{ 
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}
        >
          <Stack gap="xs" align="center">
            <Group gap="xs">
              <IconUsers size={16} style={{ color: '#667eea' }} />
              <Text size="xs" c="dimmed" fw={500}>
                Attendee v1.0
              </Text>
            </Group>
            <Text size="xs" c="dimmed" ta="center">
              Event Operations System
            </Text>
          </Stack>
        </Paper>
      </AppShell.Section>
    </AppShell.Navbar>
  )
}

export default AttendeeSidebar 