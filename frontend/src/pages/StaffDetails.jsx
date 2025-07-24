import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Avatar, Divider, Button, Progress } from '@mantine/core'
import { 
  IconUser,
  IconMapPin,
  IconClock,
  IconShield,
  IconPhone,
  IconMail,
  IconId,
  IconCalendar,
  IconTarget,
  IconCheck,
  IconAlertTriangle,
  IconActivity,
  IconUsers,
  IconStar
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import AppBar from '../components/AppBar'
import StaffSidebar from '../components/StaffSidebar'

function StaffDetails() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const handleMenuClick = () => {
    toggle();
  }

  // Sample staff data
  const staffMember = {
    id: 'STF001',
    name: 'Sarah Johnson',
    role: 'Security Officer',
    department: 'Security Team',
    email: 'sarah.johnson@drishti.com',
    phone: '+1 (555) 123-4567',
    address: '456 Security Lane, Suite 12, New York, NY 10002',
    currentZone: 'Zone A - Main Entrance',
    assignedZones: [
      {
        id: 1,
        name: 'Zone A - Main Entrance',
        status: 'Active',
        capacity: 200,
        currentCount: 145,
        utilization: 72.5
      },
      {
        id: 2,
        name: 'Zone B - Food Court',
        status: 'Active',
        capacity: 300,
        currentCount: 267,
        utilization: 89.0
      },
      {
        id: 3,
        name: 'Zone C - Parking Area',
        status: 'Inactive',
        capacity: 150,
        currentCount: 45,
        utilization: 30.0
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Inactive': return 'gray';
      case 'Completed': return 'blue';
      case 'Pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return 'red';
    if (utilization >= 60) return 'yellow';
    return 'green';
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
          userName="Staff User" 
          onMenuClick={handleMenuClick}
          opened={opened}
        />
      </AppShell.Header>

      <StaffSidebar opened={opened} />

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
                  Staff Details
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Personal information, zone assignments, and work details
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
                        Personal information and work details
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
                        <Text size="xl" fw={700} ta="center">{staffMember.name}</Text>
                        <Badge 
                          color="green" 
                          variant="light"
                          size="md"
                          leftSection={<IconCheck size={12} />}
                        >
                          Active Staff
                        </Badge>
                      </Stack>
                    </Stack>
                  </Grid.Col>

                  {/* Staff Details */}
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
                                  <Text size="sm">{staffMember.email}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconPhone size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Phone:</Text>
                                  <Text size="sm">{staffMember.phone}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                            
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconMapPin size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Current Zone:</Text>
                                  <Text size="sm">{staffMember.currentZone}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconMapPin size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Address:</Text>
                                  <Text size="sm">{staffMember.address}</Text>
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

            {/* Zone Assignments */}
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
                    <IconMapPin size={24} style={{ color: 'white' }} />
                  </div>
                  <Stack gap="xs">
                    <Title order={3} style={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Zone Assignments
                    </Title>
                    <Text size="sm" c="dimmed">
                      Current zone assignments and capacity monitoring
                    </Text>
                  </Stack>
                </Group>

                <Grid gutter="lg">
                  {staffMember.assignedZones.map((zone) => (
                    <Grid.Col key={zone.id} span={{ base: 12, sm: 6, lg: 4 }}>
                      <Card 
                        shadow="md" 
                        padding="lg" 
                        radius="lg" 
                        withBorder
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Stack gap="md">
                          <Group justify="space-between" align="flex-start">
                            <Stack gap="xs" style={{ flex: 1 }}>
                              <Text fw={600} size="lg">{zone.name}</Text>
                              <Badge 
                                color={getStatusColor(zone.status)} 
                                variant="light"
                                size="sm"
                              >
                                {zone.status}
                              </Badge>
                            </Stack>
                          </Group>

                          <Stack gap="sm">
                            <Group justify="space-between">
                              <Text size="sm" fw={500}>Capacity</Text>
                              <Text size="sm" fw={600}>{zone.currentCount}/{zone.capacity}</Text>
                            </Group>
                            <Progress 
                              value={zone.utilization} 
                              color={getUtilizationColor(zone.utilization)}
                              size="sm"
                              radius="xl"
                            />
                            <Text size="xs" c="dimmed" ta="center">
                              {zone.utilization}% utilization
                            </Text>
                          </Stack>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            </Paper>


          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default StaffDetails; 