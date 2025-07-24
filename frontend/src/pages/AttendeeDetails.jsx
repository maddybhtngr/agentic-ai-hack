import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Avatar, Progress } from '@mantine/core'
import { 
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconTicket,
  IconCalendar,
  IconClock,
  IconActivity,
  IconCheck,
  IconX,
  IconStar
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import AppBar from '../components/AppBar'
import AttendeeSidebar from '../components/AttendeeSidebar'

function AttendeeDetails() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const handleMenuClick = () => {
    toggle();
    console.log('Attendee menu clicked')
  }

  const attendeeData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 987-6543',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    currentZone: 'Zone B - Main Hall',
    emergencyContact: {
      name: 'Sarah Johnson',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@email.com'
    }
  };

  const recentActivities = [
    {
      id: 1,
      action: 'Attended Keynote Session',
      time: '10:30 AM',
      type: 'Session',
      status: 'Completed'
    },
    {
      id: 2,
      action: 'Checked into Zone B',
      time: '09:45 AM',
      type: 'Location',
      status: 'Active'
    },
    {
      id: 3,
      action: 'Registered for Workshop',
      time: '09:20 AM',
      type: 'Registration',
      status: 'Confirmed'
    },
    {
      id: 4,
      action: 'Event Check-in',
      time: '09:15 AM',
      type: 'Entry',
      status: 'Completed'
    }
  ];

  const zoneHistory = [
    {
      id: 1,
      zone: 'Zone A - Registration',
      time: '09:15 - 09:30',
      duration: '15 min',
      status: 'Completed'
    },
    {
      id: 2,
      zone: 'Zone B - Main Hall',
      time: '09:45 - Present',
      duration: '2h 45m',
      status: 'Active'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Completed': return 'blue';
      case 'Confirmed': return 'green';
      default: return 'gray';
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ 
        width: 300, 
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: isSmallScreen ? false : !opened }
      }}
      padding={0}
      styles={{
        main: {
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh'
        }
      }}
    >
      <AppShell.Header>
        <AppBar 
          userName="Attendee User" 
          onMenuClick={handleMenuClick}
          opened={opened}
        />
      </AppShell.Header>

      <AttendeeSidebar opened={opened} />

      <AppShell.Main>
        <Container size="100%" py="xl" px="xl">
          <Stack spacing="xl">
            {/* Header Section */}
            <Stack spacing="xs">
              <Group gap="xs">
                <IconUser size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Attendee Details
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Your event profile and activity information
              </Text>
            </Stack>

            {/* Profile Overview */}
            <Paper 
              shadow="xl" 
              p="xl" 
              radius="lg" 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background gradient accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: `${rem(12)} ${rem(12)} 0 0`
              }} />

              <Stack spacing="lg">
                <Group gap="md">
                  <div style={{
                    padding: rem(12),
                    borderRadius: rem(12),
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconUser size={24} style={{ color: 'white' }} />
                  </div>
                  <Stack gap="xs">
                    <Title order={3} style={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Profile Overview
                    </Title>
                    <Text size="sm" c="dimmed">
                      Your personal information and event details
                    </Text>
                  </Stack>
                </Group>

                                <Grid gutter="xl">
                  {/* Profile Photo */}
                  <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Stack gap="lg" align="center">
                      <Avatar 
                        size={120} 
                        radius="xl"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                        style={{
                          border: '4px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        <IconUser size={60} style={{ color: 'white' }} />
                      </Avatar>
                      
                      <Stack gap="xs" align="center">
                        <Text size="xl" fw={700} ta="center">{attendeeData.name}</Text>
                        <Badge 
                          color="green" 
                          variant="light"
                          size="md"
                          leftSection={<IconCheck size={12} />}
                        >
                          Active Attendee
                        </Badge>
                      </Stack>
                    </Stack>
                  </Grid.Col>

                  {/* Attendee Details */}
                  <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Stack gap="lg">
                      {/* Personal Information */}
                      <Paper 
                        shadow="sm" 
                        p="lg" 
                        radius="md" 
                        withBorder
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Stack gap="md">
                          <Text fw={600} size="lg" style={{ color: '#667eea' }}>Personal Information</Text>
                          
                          <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconMail size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Email:</Text>
                                  <Text size="sm">{attendeeData.email}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconPhone size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Phone:</Text>
                                  <Text size="sm">{attendeeData.phone}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                            
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconMapPin size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Current Zone:</Text>
                                  <Text size="sm">{attendeeData.currentZone}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconMapPin size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Address:</Text>
                                  <Text size="sm">{attendeeData.address}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                          </Grid>
                        </Stack>
                      </Paper>

                      {/* Emergency Contact */}
                      <Paper 
                        shadow="sm" 
                        p="lg" 
                        radius="md" 
                        withBorder
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Stack gap="md">
                          <Text fw={600} size="lg" style={{ color: '#667eea' }}>Emergency Contact</Text>
                          
                          <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconUser size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Name:</Text>
                                  <Text size="sm">{attendeeData.emergencyContact.name}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconUser size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Relationship:</Text>
                                  <Text size="sm">{attendeeData.emergencyContact.relationship}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                            
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconPhone size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Phone:</Text>
                                  <Text size="sm">{attendeeData.emergencyContact.phone}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconMail size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Email:</Text>
                                  <Text size="sm">{attendeeData.emergencyContact.email}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                          </Grid>
                        </Stack>
                      </Paper>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>


          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default AttendeeDetails; 