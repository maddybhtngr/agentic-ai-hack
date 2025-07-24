import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Button, ActionIcon, Modal, TextInput, Select, Textarea } from '@mantine/core'
import { 
  IconPhoneCall,
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconUsers,
  IconShieldLock,
  IconActivity,
  IconPlus,
  IconEdit,
  IconTrash,
  IconNavigation,
  IconBuildingHospital,
  IconShield,
  IconCar,
  IconAlertTriangle
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import AppBar from '../components/AppBar'
import Sidebar from '../components/Sidebar'
import FloatingAssistant from '../components/FloatingAssistant'
import { useState } from 'react'

function EmergencyServices() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [addServiceModalOpened, setAddServiceModalOpened] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    mapsLink: '',
    description: ''
  });

  const handleMenuClick = () => {
    toggle();
  }

  const handleAddService = () => {
    if (newService.name && newService.type && newService.address && newService.phone) {
      const service = {
        id: nearbyServices.length + 1,
        ...newService,
        distance: 'Calculating...'
      };
      nearbyServices.push(service);
      setNewService({
        name: '',
        type: '',
        address: '',
        phone: '',
        mapsLink: '',
        description: ''
      });
      setAddServiceModalOpened(false);
    }
  };

  const handleNavigate = (mapsLink) => {
    window.open(mapsLink, '_blank');
  };

  const getServiceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return IconBuildingHospital;
      case 'police':
        return IconShield;
      case 'fire':
        return IconActivity;
      case 'ambulance':
        return IconCar;
      default:
        return IconMapPin;
    }
  };

  const getServiceColor = (type) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return 'red';
      case 'police':
        return 'blue';
      case 'fire':
        return 'orange';
      case 'ambulance':
        return 'green';
      default:
        return 'gray';
    }
  };

  const emergencyContacts = [
    {
      id: 1,
      name: 'Emergency Hotline',
      number: '911',
      type: 'Primary',
      status: 'active',
      responseTime: '< 2 min',
      description: 'Main emergency response line'
    },
    {
      id: 2,
      name: 'Medical Emergency',
      number: '+1 (555) 123-4567',
      type: 'Medical',
      status: 'active',
      responseTime: '< 5 min',
      description: 'On-site medical team'
    },
    {
      id: 3,
      name: 'Security Emergency',
      number: '+1 (555) 234-5678',
      type: 'Security',
      status: 'active',
      responseTime: '< 3 min',
      description: 'Security response team'
    },
    {
      id: 4,
      name: 'Fire Department',
      number: '+1 (555) 345-6789',
      type: 'Fire',
      status: 'active',
      responseTime: '< 8 min',
      description: 'Local fire department'
    }
  ];

  const nearbyServices = [
    {
      id: 1,
      name: 'City General Hospital',
      type: 'Hospital',
      address: '123 Medical Center Dr, Downtown',
      phone: '+1 (555) 123-4567',
      mapsLink: 'https://maps.google.com/?q=123+Medical+Center+Dr',
      description: '24/7 Emergency Department with trauma center',
      distance: '2.3 km'
    },
    {
      id: 2,
      name: 'Downtown Police Station',
      type: 'Police',
      address: '456 Law Enforcement Ave',
      phone: '+1 (555) 234-5678',
      mapsLink: 'https://maps.google.com/?q=456+Law+Enforcement+Ave',
      description: 'Main police station with emergency response unit',
      distance: '1.8 km'
    },
    {
      id: 3,
      name: 'Central Fire Station',
      type: 'Fire',
      address: '789 Firefighter Blvd',
      phone: '+1 (555) 345-6789',
      mapsLink: 'https://maps.google.com/?q=789+Firefighter+Blvd',
      description: 'Fire department with emergency medical services',
      distance: '3.1 km'
    },
    {
      id: 4,
      name: 'Emergency Medical Services',
      type: 'Ambulance',
      address: '321 Emergency Way',
      phone: '+1 (555) 456-7890',
      mapsLink: 'https://maps.google.com/?q=321+Emergency+Way',
      description: 'Ambulance service and emergency transport',
      distance: '2.7 km'
    }
  ];

  const statCards = [
    {
      title: 'Emergency Contacts',
      value: emergencyContacts.length.toString(),
      icon: IconPhone,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Nearby Services',
      value: nearbyServices.length.toString(),
      icon: IconMapPin,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Alerts',
      value: '0',
      icon: IconActivity,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Incidents',
      value: '2',
      icon: IconAlertTriangle,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  ];

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
          userName="Admin User" 
          onMenuClick={handleMenuClick}
          opened={opened}
        />
      </AppShell.Header>

      <Sidebar opened={opened} />

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
                Manage emergency contacts, response teams, and protocols
              </Text>
            </Stack>
            
            {/* Stats Cards */}
            <Grid gutter="lg">
              {statCards.map((card, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
                  <Card 
                    shadow="xl" 
                    padding="lg" 
                    radius="lg" 
                    withBorder
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <div style={{
                          padding: rem(8),
                          borderRadius: rem(8),
                          background: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <card.icon size={20} style={{ color: 'white' }} />
                        </div>
                        <Text size="sm" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.5px' }}>
                          {card.title}
                        </Text>
                      </Group>
                    </Group>

                    {/* Main value */}
                    <Text size="3xl" fw={800} style={{ 
                      background: card.color,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1
                    }}>
                      {card.value}
                    </Text>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            {/* Emergency Contacts */}
            <Paper 
              shadow="xl" 
              p="xl" 
              radius="xl" 
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

              <Stack spacing="xl">
                {/* Header Section */}
                <Group justify="space-between" align="center">
                  <Group gap="md">
                    <div style={{
                      padding: rem(12),
                      borderRadius: rem(12),
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconPhone size={24} style={{ color: 'white' }} />
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
                        Quick access to emergency response numbers
                      </Text>
                    </Stack>
                  </Group>
                  
                  <Button 
                    size="md"
                    radius="md"
                    leftSection={<IconPlus size={16} />} 
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: 600
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
                    Add Contact
                  </Button>
                </Group>

                {/* Emergency Contacts Grid */}
                <Grid gutter="lg">
                  {emergencyContacts.map((contact) => (
                    <Grid.Col key={contact.id} span={{ base: 12, sm: 6, lg: 3 }}>
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
                            <Stack gap="xs">
                              <Text fw={600} size="lg">{contact.name}</Text>
                              <Badge 
                                color={contact.type === 'Primary' ? 'red' : 'blue'} 
                                variant="light"
                                size="sm"
                              >
                                {contact.type}
                              </Badge>
                            </Stack>
                            <Group gap="xs">
                              <ActionIcon
                                size="sm"
                                variant="light"
                                color="blue"
                                style={{
                                  background: 'rgba(102, 126, 234, 0.1)',
                                  color: '#667eea',
                                  border: '1px solid rgba(102, 126, 234, 0.2)'
                                }}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                variant="light"
                                color="red"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Group>

                          <Stack gap="xs">
                            <Group gap="xs">
                              <IconPhone size={16} style={{ color: '#667eea' }} />
                              <Text size="lg" fw={700} style={{ color: '#667eea' }}>
                                {contact.number}
                              </Text>
                            </Group>
                            <Text size="sm" c="dimmed">{contact.description}</Text>
                            <Group gap="xs">
                              <IconClock size={14} style={{ color: '#667eea' }} />
                              <Text size="xs" c="dimmed">Response: {contact.responseTime}</Text>
                            </Group>
                          </Stack>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            </Paper>

            {/* Nearby Emergency Locations */}
            <Paper 
              shadow="xl" 
              p="xl" 
              radius="xl" 
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

              <Stack spacing="xl">
                {/* Header Section */}
                <Group justify="space-between" align="center">
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
                        Nearby Emergency Locations
                      </Title>
                      <Text size="sm" c="dimmed">
                        Register and manage nearby emergency services
                      </Text>
                    </Stack>
                  </Group>
                  
                  <Button 
                    size="md"
                    radius="md"
                    leftSection={<IconPlus size={16} />} 
                    onClick={() => setAddServiceModalOpened(true)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: 600
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
                    Add Service
                  </Button>
                </Group>

                {/* Nearby Services Grid */}
                <Grid gutter="lg">
                  {nearbyServices.map((service) => {
                    const ServiceIcon = getServiceIcon(service.type);
                    return (
                      <Grid.Col key={service.id} span={{ base: 12, sm: 6, lg: 4 }}>
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
                              <Stack gap="xs">
                                <Group gap="xs" align="center">
                                  <ServiceIcon size={20} style={{ color: '#667eea' }} />
                                  <Text fw={600} size="lg">{service.name}</Text>
                                </Group>
                                <Badge 
                                  color={getServiceColor(service.type)} 
                                  variant="light"
                                  size="sm"
                                >
                                  {service.type}
                                </Badge>
                              </Stack>
                              <Group gap="xs">
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="blue"
                                  style={{
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    color: '#667eea',
                                    border: '1px solid rgba(102, 126, 234, 0.2)'
                                  }}
                                >
                                  <IconEdit size={14} />
                                </ActionIcon>
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="red"
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                  }}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                            </Group>

                            <Stack gap="xs">
                              <Group gap="xs">
                                <IconMapPin size={16} style={{ color: '#667eea' }} />
                                <Text size="sm">{service.address}</Text>
                              </Group>
                              <Group gap="xs">
                                <IconPhone size={16} style={{ color: '#667eea' }} />
                                <Text size="sm">{service.phone}</Text>
                              </Group>
                              <Text size="sm" c="dimmed">{service.description}</Text>
                              <Group gap="xs">
                                <IconActivity size={14} style={{ color: '#667eea' }} />
                                <Text size="xs" c="dimmed">Distance: {service.distance}</Text>
                              </Group>
                            </Stack>

                            <Button
                              fullWidth
                              size="sm"
                              radius="md"
                              leftSection={<IconNavigation size={16} />}
                              onClick={() => handleNavigate(service.mapsLink)}
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                fontWeight: 600
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
                              Navigate
                            </Button>
                          </Stack>
                        </Card>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Stack>
            </Paper>

            {/* Add Service Modal */}
            <Modal 
              opened={addServiceModalOpened} 
              onClose={() => setAddServiceModalOpened(false)} 
              title={
                <Group gap="xs">
                  <IconPlus size={20} style={{ color: '#667eea' }} />
                  <Text fw={600}>Add Emergency Service</Text>
                </Group>
              }
              centered
              size="lg"
              styles={{
                header: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                },
                title: {
                  color: 'white'
                }
              }}
            >
              <Stack gap="md">
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <TextInput
                      label="Service Name"
                      placeholder="Enter service name"
                      size="md"
                      radius="md"
                      value={newService.name}
                      onChange={(event) => setNewService({...newService, name: event.target.value})}
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
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Service Type"
                      placeholder="Select service type"
                      size="md"
                      radius="md"
                      value={newService.type}
                      onChange={(value) => setNewService({...newService, type: value})}
                      data={[
                        { value: 'Hospital', label: 'Hospital' },
                        { value: 'Police', label: 'Police Station' },
                        { value: 'Fire', label: 'Fire Station' },
                        { value: 'Ambulance', label: 'Ambulance Service' },
                        { value: 'Pharmacy', label: 'Pharmacy' },
                        { value: 'Clinic', label: 'Medical Clinic' }
                      ]}
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
                  </Grid.Col>
                </Grid>

                <TextInput
                  label="Address"
                  placeholder="Enter full address"
                  size="md"
                  radius="md"
                  value={newService.address}
                  onChange={(event) => setNewService({...newService, address: event.target.value})}
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

                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <TextInput
                      label="Phone Number"
                      placeholder="Enter phone number"
                      size="md"
                      radius="md"
                      value={newService.phone}
                      onChange={(event) => setNewService({...newService, phone: event.target.value})}
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
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Google Maps Link"
                      placeholder="Paste Google Maps URL"
                      size="md"
                      radius="md"
                      value={newService.mapsLink}
                      onChange={(event) => setNewService({...newService, mapsLink: event.target.value})}
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
                  </Grid.Col>
                </Grid>

                <Textarea
                  label="Description"
                  placeholder="Enter service description (optional)"
                  size="md"
                  radius="md"
                  minRows={3}
                  value={newService.description}
                  onChange={(event) => setNewService({...newService, description: event.target.value})}
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

                <Group justify="flex-end" gap="md">
                  <Button 
                    variant="outline" 
                    onClick={() => setAddServiceModalOpened(false)}
                    size="md"
                    radius="md"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="md"
                    radius="md"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: 600
                    }}
                    onClick={handleAddService}
                  >
                    Add Service
                  </Button>
                </Group>
              </Stack>
            </Modal>
          </Stack>
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
  );
}

export default EmergencyServices; 