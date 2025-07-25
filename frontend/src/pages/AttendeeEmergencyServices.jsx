import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Button, ActionIcon, Select, LoadingOverlay, Alert } from '@mantine/core'
import { useState, useEffect } from 'react'
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
import FloatingAssistant from '../components/FloatingAssistant'
import { authUtils, apiService } from '../services/api'

function AttendeeEmergencyServices() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [selectedZone, setSelectedZone] = useState('All');
  const [staff, setStaff] = useState([]);
  const [zones, setZones] = useState([]);
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current user data
  const currentUser = authUtils.getCurrentUser();
  const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Attendee User';

  const handleMenuClick = () => {
    toggle();
    console.log('Attendee menu clicked')
  }

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
  }

  // Fetch staff, zones, emergency services, and emergency contacts data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [staffData, zonesData, emergencyData, contactsData] = await Promise.all([
          apiService.getAvailableStaff(),
          apiService.getAvailableZones(),
          apiService.getNearbyServices(),
          apiService.getEmergencyContacts()
        ]);
        
        setStaff(staffData.data || staffData);
        setEmergencyServices(emergencyData.data || emergencyData);
        setEmergencyContacts(contactsData.data || contactsData);
        
        // Create zones array with 'All' option
        const zoneOptions = ['All', ...(zonesData.data || zonesData).map(zone => zone.name)];
        setZones(zoneOptions);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);





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

  const handleCallContact = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (email) => {
    window.open(`mailto:${email}`, '_self');
  };

  // Filter staff based on selected zone
  const filteredStaff = selectedZone === 'All' 
    ? staff 
    : staff.filter(staffMember => staffMember.assigned_zone && staffMember.assigned_zone.includes(selectedZone));

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
          userName={userName} 
          onMenuClick={handleMenuClick}
          opened={opened}
        />
      </AppShell.Header>

      <AttendeeSidebar opened={opened} />

      <AppShell.Main>
        <Container size="100%" py="xl" px="xl" style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          {error && (
            <Alert color="red" title="Error" mb="md">
              {error}
            </Alert>
          )}
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
                            <Text fw={600} size="sm">{`${staff.first_name} ${staff.last_name}`}</Text>
                            <Badge 
                              color="green" 
                              variant="light"
                              size="xs"
                            >
                              Active
                            </Badge>
                          </Group>
                          
                          <Text size="xs" c="dimmed">{staff.role}</Text>
                          <Text size="xs" c="dimmed">{staff.assigned_zone}</Text>
                          <Badge 
                            color="blue" 
                            variant="light"
                            size="xs"
                          >
                            Available
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
                            Call Staff
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
                  {emergencyServices.map((place) => {
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
                            </Group>
                            
                            <Text size="sm" c="dimmed">{place.description}</Text>
                            
                            <Text size="xs" c="dimmed">{place.distance}</Text>
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

            {/* Emergency Contacts */}
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
                    <IconPhoneCall size={24} style={{ color: 'white' }} />
                  </div>
                  <Stack gap="xs">
                    <Title order={3} style={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Emergency Contacts
                    </Title>
                    <Text size="sm" c="dimmed">
                      Important emergency contact numbers
                    </Text>
                  </Stack>
                </Group>

                <Grid gutter="md">
                  {emergencyContacts.map((contact) => (
                    <Grid.Col key={contact.id} span={{ base: 12, sm: 6, lg: 4 }}>
                      <Card 
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
                        <Stack gap="md">
                          <Group gap="md" align="center">
                            <Group gap="xs">
                              <IconPhoneCall size={20} style={{ color: '#667eea' }} />
                              <Text fw={600} size="lg">{contact.name}</Text>
                            </Group>
                            <Badge 
                              color="red" 
                              variant="light"
                              size="sm"
                            >
                              Emergency
                            </Badge>
                          </Group>
                          
                          <Text size="sm" c="dimmed">{contact.description || 'Emergency contact'}</Text>
                          
                          <Stack gap="xs">
                            <Text size="sm" fw={500}>{contact.phone}</Text>
                            {contact.email && (
                              <Group gap="xs">
                                <IconMail size={14} style={{ color: '#667eea' }} />
                                <Text size="sm" c="dimmed">{contact.email}</Text>
                              </Group>
                            )}
                          </Stack>
                          
                          <Group gap="xs">
                            <Button 
                              size="xs"
                              leftSection={<IconPhone size={12} />}
                              onClick={() => handleCallContact(contact.phone)}
                              style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                border: 'none'
                              }}
                            >
                              Call Now
                            </Button>
                            {contact.email && (
                              <Button 
                                size="xs"
                                variant="light"
                                leftSection={<IconMail size={12} />}
                                onClick={() => handleEmailContact(contact.email)}
                                style={{
                                  border: '1px solid #667eea',
                                  color: '#667eea'
                                }}
                              >
                                Email
                              </Button>
                            )}
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>

                {/* No Contacts Message */}
                {emergencyContacts.length === 0 && (
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
                      <IconPhoneCall size={48} style={{ color: '#667eea', opacity: 0.5 }} />
                      <Text size="lg" fw={600} c="dimmed">
                        No emergency contacts available
                      </Text>
                      <Text size="sm" c="dimmed" ta="center">
                        Emergency contacts will be displayed here when available.
                      </Text>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
  );
}

export default AttendeeEmergencyServices; 