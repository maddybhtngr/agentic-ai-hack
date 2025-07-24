import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Button, ActionIcon, Select } from '@mantine/core'
import { useState } from 'react'
import { 
  IconPhoneCall,
  IconMapPin,
  IconUsers,
  IconAlertTriangle,
  IconPhone,
  IconMail,
  IconNavigation,
  IconShield,
  IconActivity
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import AppBar from '../components/AppBar'
import AttendeeSidebar from '../components/AttendeeSidebar'

function AttendeeEmergencyServices() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [selectedZone, setSelectedZone] = useState('All');

  const handleMenuClick = () => {
    toggle();
    console.log('Attendee menu clicked')
  }

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
  }

  const emergencyPlaces = [
    {
      id: 1,
      name: 'City General Hospital',
      type: 'Hospital',
      address: '123 Medical Center Dr, New York, NY 10001',
      phone: '+1 (555) 123-4567',
      distance: '0.8 miles',
      zone: 'Zone A',
      status: 'Available',
      description: '24/7 Emergency Department with trauma center'
    },
    {
      id: 2,
      name: 'Downtown Police Station',
      type: 'Police',
      address: '456 Law Enforcement Ave, New York, NY 10002',
      phone: '+1 (555) 987-6543',
      distance: '1.2 miles',
      zone: 'Zone B',
      status: 'Available',
      description: 'Local police department with emergency response unit'
    },
    {
      id: 3,
      name: 'Central Fire Station',
      type: 'Fire',
      address: '789 Fire Safety Blvd, New York, NY 10003',
      phone: '+1 (555) 456-7890',
      distance: '0.5 miles',
      zone: 'Zone A',
      status: 'Available',
      description: 'Fire department with emergency medical services'
    },
    {
      id: 4,
      name: 'Emergency Medical Services',
      type: 'EMS',
      address: '321 Emergency Way, New York, NY 10004',
      phone: '+1 (555) 789-0123',
      distance: '1.0 miles',
      zone: 'Zone C',
      status: 'Available',
      description: 'Ambulance services and emergency medical care'
    }
  ];

  const zoneStaff = [
    {
      id: 1,
      name: 'Officer Sarah Johnson',
      role: 'Security Officer',
      zone: 'Zone A - Main Entrance',
      phone: '+1 (555) 111-2222',
      status: 'Active',
      distance: '50m'
    },
    {
      id: 2,
      name: 'Officer Mike Chen',
      role: 'Security Officer',
      zone: 'Zone B - Food Court',
      phone: '+1 (555) 333-4444',
      status: 'Active',
      distance: '120m'
    },
    {
      id: 3,
      name: 'Officer Lisa Rodriguez',
      role: 'Security Officer',
      zone: 'Zone C - Parking Area',
      phone: '+1 (555) 555-6666',
      status: 'Active',
      distance: '200m'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      role: 'Medical Staff',
      zone: 'Zone A - Medical Station',
      phone: '+1 (555) 777-8888',
      status: 'Active',
      distance: '75m'
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'Hospital': return 'red';
      case 'Police': return 'blue';
      case 'Fire': return 'orange';
      case 'EMS': return 'green';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Hospital': return IconActivity;
      case 'Police': return IconShield;
      case 'Fire': return IconAlertTriangle;
      case 'EMS': return IconPhoneCall;
      default: return IconMapPin;
    }
  };

  const handleCallEmergency = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleNavigate = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  };

  const handleCallStaff = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  // Get unique zones from staff data
  const zones = ['All', ...new Set(zoneStaff.map(staff => staff.zone.split(' - ')[0]))];

  // Filter staff based on selected zone
  const filteredStaff = selectedZone === 'All' 
    ? zoneStaff 
    : zoneStaff.filter(staff => staff.zone.startsWith(selectedZone));

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
                <IconPhoneCall size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Emergency Services
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Find emergency services and contact staff in your area
              </Text>
            </Stack>
            
            {/* Zone Staff */}
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
                <Group justify="space-between" align="flex-start">
                  <Group gap="md">
                    <div style={{
                      padding: rem(12),
                      borderRadius: rem(12),
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconUsers size={24} style={{ color: 'white' }} />
                    </div>
                    <Stack gap="xs">
                      <Title order={3} style={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Zone Staff
                      </Title>
                      <Text size="sm" c="dimmed">
                        Contact staff in your area
                      </Text>
                    </Stack>
                  </Group>

                  {/* Zone Selection Dropdown */}
                  <Group gap="sm" align="center">
                    <Text size="sm" fw={600} c="dimmed">Select Zone:</Text>
                    <Select
                      value={selectedZone}
                      onChange={handleZoneSelect}
                      data={zones}
                      placeholder="Choose a zone"
                      style={{ minWidth: 180 }}
                      styles={{
                        input: {
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          borderRadius: rem(8),
                          '&:focus': {
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        },
                        dropdown: {
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          borderRadius: rem(8)
                        },
                        item: {
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.1)'
                          },
                          '&[data-selected]': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }
                        }
                      }}
                    />
                  </Group>
                </Group>

                {/* Staff Cards */}
                <Grid gutter="md">
                  {filteredStaff.map((staff) => (
                    <Grid.Col key={staff.id} span={{ base: 12, sm: 6, lg: 3 }}>
                      <Card 
                        shadow="sm" 
                        p="md" 
                        radius="md" 
                        withBorder
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Stack gap="xs">
                          <Group gap="xs" align="center">
                            <Text fw={600} size="sm">{staff.name}</Text>
                            <Badge 
                              color="green" 
                              variant="light"
                              size="xs"
                            >
                              {staff.status}
                            </Badge>
                          </Group>
                          
                          <Text size="xs" c="dimmed">{staff.role}</Text>
                          <Text size="xs" c="dimmed">{staff.zone}</Text>
                          <Badge 
                            color="blue" 
                            variant="light"
                            size="xs"
                          >
                            Distance: {staff.distance}
                          </Badge>
                          
                          <Button 
                            size="xs"
                            leftSection={<IconAlertTriangle size={12} />}
                            onClick={() => handleCallStaff(staff.phone)}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none'
                            }}
                          >
                            Report Incident
                          </Button>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>

                {/* No Staff Message */}
                {filteredStaff.length === 0 && (
                  <Card 
                    shadow="sm" 
                    p="xl" 
                    radius="md" 
                    withBorder
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <Stack gap="md" align="center">
                      <IconUsers size={48} style={{ color: '#667eea', opacity: 0.5 }} />
                      <Text size="lg" fw={600} c="dimmed">
                        No staff available in {selectedZone}
                      </Text>
                      <Text size="sm" c="dimmed" ta="center">
                        Please select a different zone or contact emergency services directly.
                      </Text>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Paper>

            {/* Emergency Places */}
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
                    <IconAlertTriangle size={24} style={{ color: 'white' }} />
                  </div>
                  <Stack gap="xs">
                    <Title order={3} style={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Emergency Places
                    </Title>
                    <Text size="sm" c="dimmed">
                      Nearby emergency services and facilities
                    </Text>
                  </Stack>
                </Group>

                <Stack gap="md">
                  {emergencyPlaces.map((place) => {
                    const TypeIcon = getTypeIcon(place.type);
                    return (
                      <Card 
                        key={place.id}
                        shadow="sm" 
                        p="lg" 
                        radius="md" 
                        withBorder
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Group justify="space-between" align="flex-start">
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Group gap="md" align="center">
                              <Group gap="xs">
                                <TypeIcon size={20} style={{ color: '#667eea' }} />
                                <Text fw={600} size="lg">{place.name}</Text>
                              </Group>
                              <Badge 
                                color={getTypeColor(place.type)} 
                                variant="light"
                                size="sm"
                              >
                                {place.type}
                              </Badge>
                              <Badge 
                                color="green" 
                                variant="light"
                                size="sm"
                              >
                                {place.status}
                              </Badge>
                            </Group>
                            
                            <Text size="sm" c="dimmed">{place.description}</Text>
                            
                            <Group gap="lg">
                              <Group gap="xs">
                                <IconMapPin size={14} style={{ color: '#667eea' }} />
                                <Text size="xs" c="dimmed">{place.address}</Text>
                              </Group>
                              <Group gap="xs">
                                <IconMapPin size={14} style={{ color: '#667eea' }} />
                                <Text size="xs" c="dimmed">{place.zone}</Text>
                              </Group>
                              <Group gap="xs">
                                <IconMapPin size={14} style={{ color: '#667eea' }} />
                                <Text size="xs" c="dimmed">{place.distance}</Text>
                              </Group>
                            </Group>
                          </Stack>
                          
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              size="md"
                              onClick={() => handleCallEmergency(place.phone)}
                              style={{ color: '#22c55e' }}
                            >
                              <IconPhone size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              size="md"
                              onClick={() => handleNavigate(place.address)}
                              style={{ color: '#667eea' }}
                            >
                              <IconNavigation size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Card>
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default AttendeeEmergencyServices; 