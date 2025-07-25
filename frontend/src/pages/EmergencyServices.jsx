import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Button, ActionIcon, Modal, TextInput, Select, Textarea, LoadingOverlay, Alert } from '@mantine/core'
import { 
  IconPhoneCall,
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconUsers,
  IconUser,
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
import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

function EmergencyServices() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [addServiceModalOpened, setAddServiceModalOpened] = useState(false);
  const [addContactModalOpened, setAddContactModalOpened] = useState(false);
  const [editContactModalOpened, setEditContactModalOpened] = useState(false);
  const [editServiceModalOpened, setEditServiceModalOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [nearbyServices, setNearbyServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [newContact, setNewContact] = useState({
    name: '',
    number: '',
    type: '',
    status: 'active',
    responseTime: '',
    description: ''
  });
  const [newService, setNewService] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    mapsLink: '',
    description: ''
  });

  // Fetch emergency data from API
  useEffect(() => {
    const fetchEmergencyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contactsData, servicesData, incidentsData] = await Promise.all([
          apiService.getEmergencyContacts(),
          apiService.getNearbyServices(),
          apiService.getAllIncidents()
        ]);
        
        setEmergencyContacts(contactsData.data || contactsData);
        setNearbyServices(servicesData.data || servicesData);
        setIncidents(incidentsData.data || incidentsData);
      } catch (err) {
        console.error('Error fetching emergency data:', err);
        setError('Failed to load emergency data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyData();
  }, []);

  const handleMenuClick = () => {
    toggle();
  }

  // Helper functions for incidents
  const getActiveIncidents = () => {
    return incidents.filter(incident => 
      incident.status === 'REPORTED' || incident.status === 'ASSIGNED'
    );
  };

  const getCriticalIncidents = () => {
    return incidents.filter(incident => 
      incident.incident_priority === 'CRITICAL' && 
      (incident.status === 'REPORTED' || incident.status === 'ASSIGNED')
    );
  };

  const handleAddContact = async () => {
    if (newContact.name && newContact.number && newContact.type) {
      try {
        const newContactResponse = await apiService.createEmergencyContact(newContact);
        const createdContact = newContactResponse.data || newContactResponse;
        
        setEmergencyContacts([...emergencyContacts, createdContact]);
        setNewContact({
          name: '',
          number: '',
          type: '',
          status: 'active',
          responseTime: '',
          description: ''
        });
        setAddContactModalOpened(false);
      } catch (err) {
        console.error('Error adding contact:', err);
        setError('Failed to add contact');
      }
    }
  };

  const handleAddService = async () => {
    if (newService.name && newService.type && newService.address && newService.phone) {
      try {
        const serviceData = {
          ...newService,
          distance: 'Calculating...'
        };
        
        const newServiceResponse = await apiService.createNearbyService(serviceData);
        const createdService = newServiceResponse.data || newServiceResponse;
        
        setNearbyServices([...nearbyServices, createdService]);
        setNewService({
          name: '',
          type: '',
          address: '',
          phone: '',
          mapsLink: '',
          description: ''
        });
        setAddServiceModalOpened(false);
      } catch (err) {
        console.error('Error adding service:', err);
        setError('Failed to add service');
      }
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setEditContactModalOpened(true);
  };

  const handleSaveContact = async () => {
    if (editingContact) {
      try {
        const updatedContact = await apiService.updateEmergencyContact(editingContact.id, editingContact);
        const updatedData = updatedContact.data || updatedContact;
        
        setEmergencyContacts(emergencyContacts.map(contact => 
          contact.id === editingContact.id ? updatedData : contact
        ));
        setEditContactModalOpened(false);
        setEditingContact(null);
      } catch (err) {
        console.error('Error updating contact:', err);
        setError('Failed to update contact');
      }
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await apiService.deleteEmergencyContact(contactId);
      setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== contactId));
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact');
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setEditServiceModalOpened(true);
  };

  const handleSaveService = async () => {
    if (editingService) {
      try {
        const updatedService = await apiService.updateNearbyService(editingService.id, editingService);
        const updatedData = updatedService.data || updatedService;
        
        setNearbyServices(nearbyServices.map(service => 
          service.id === editingService.id ? updatedData : service
        ));
        setEditServiceModalOpened(false);
        setEditingService(null);
      } catch (err) {
        console.error('Error updating service:', err);
        setError('Failed to update service');
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await apiService.deleteNearbyService(serviceId);
      setNearbyServices(nearbyServices.filter(service => service.id !== serviceId));
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
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
      value: getCriticalIncidents().length.toString(),
      icon: IconActivity,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Incidents',
      value: getActiveIncidents().length.toString(),
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
                    onClick={() => setAddContactModalOpened(true)}
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

                {/* Emergency Contacts List */}
                <Stack gap="md">
                  {emergencyContacts.map((contact) => (
                    <Card 
                      key={contact.id}
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
                      <Group justify="space-between" align="flex-start">
                        <Group gap="lg" align="flex-start" style={{ flex: 1 }}>
                          <div style={{
                            padding: rem(12),
                            borderRadius: rem(12),
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <IconPhone size={20} style={{ color: 'white' }} />
                          </div>
                          
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Group gap="md" align="center">
                              <Text fw={600} size="lg">{contact.name}</Text>
                              <Badge 
                                color={contact.type === 'Primary' ? 'red' : 'blue'} 
                                variant="light"
                                size="sm"
                              >
                                {contact.type}
                              </Badge>
                            </Group>
                            
                            <Group gap="lg">
                              <Group gap="xs">
                                <IconPhone size={16} style={{ color: '#667eea' }} />
                                <Text size="lg" fw={700} style={{ color: '#667eea' }}>
                                  {contact.number}
                                </Text>
                              </Group>
                              <Group gap="xs">
                                <IconClock size={14} style={{ color: '#667eea' }} />
                                <Text size="sm" c="dimmed">Response: {contact.responseTime}</Text>
                              </Group>
                            </Group>
                            
                            <Text size="sm" c="dimmed">{contact.description}</Text>
                          </Stack>
                        </Group>
                        
                        <Group gap="xs">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="blue"
                            onClick={() => handleEditContact(contact)}
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
                            onClick={() => handleDeleteContact(contact.id)}
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
                    </Card>
                  ))}
                </Stack>
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

                {/* Nearby Services List */}
                <Stack gap="md">
                  {nearbyServices.map((service) => {
                    const ServiceIcon = getServiceIcon(service.type);
                    return (
                      <Card 
                        key={service.id}
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
                        <Group justify="space-between" align="flex-start">
                          <Group gap="lg" align="flex-start" style={{ flex: 1 }}>
                            <div style={{
                              padding: rem(12),
                              borderRadius: rem(12),
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <ServiceIcon size={20} style={{ color: 'white' }} />
                            </div>
                            
                            <Stack gap="xs" style={{ flex: 1 }}>
                              <Group gap="md" align="center">
                                <Text fw={600} size="lg">{service.name}</Text>
                                <Badge 
                                  color={getServiceColor(service.type)} 
                                  variant="light"
                                  size="sm"
                                >
                                  {service.type}
                                </Badge>
                              </Group>
                              
                              <Group gap="lg">
                                <Group gap="xs">
                                  <IconMapPin size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm">{service.address}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconPhone size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm">{service.phone}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconActivity size={14} style={{ color: '#667eea' }} />
                                  <Text size="sm" c="dimmed">Distance: {service.distance}</Text>
                                </Group>
                              </Group>
                              
                              <Text size="sm" c="dimmed">{service.description}</Text>
                            </Stack>
                          </Group>
                          
                          <Group gap="xs" align="flex-start">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="green"
                              onClick={() => handleNavigate(service.mapsLink)}
                              style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                color: '#22c55e',
                                border: '1px solid rgba(34, 197, 94, 0.2)'
                              }}
                            >
                              <IconNavigation size={14} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="blue"
                              onClick={() => handleEditService(service)}
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
                              onClick={() => handleDeleteService(service.id)}
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
                      </Card>
                    );
                  })}
                </Stack>
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

            {/* Add Contact Modal */}
            <Modal 
              opened={addContactModalOpened} 
              onClose={() => setAddContactModalOpened(false)} 
              title={
                <Text fw={600}>Add Emergency Contact</Text>
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
                <TextInput
                  label="Contact Name"
                  placeholder="Enter contact name"
                  size="md"
                  radius="md"
                  value={newContact.name}
                  onChange={(event) => setNewContact({...newContact, name: event.target.value})}
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
                      value={newContact.number}
                      onChange={(event) => setNewContact({...newContact, number: event.target.value})}
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
                      label="Contact Type"
                      placeholder="Select contact type"
                      size="md"
                      radius="md"
                      value={newContact.type}
                      onChange={(value) => setNewContact({...newContact, type: value})}
                      data={[
                        { value: 'Primary', label: 'Primary' },
                        { value: 'Medical', label: 'Medical' },
                        { value: 'Security', label: 'Security' },
                        { value: 'Fire', label: 'Fire' },
                        { value: 'Police', label: 'Police' }
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

                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <TextInput
                      label="Response Time"
                      placeholder="e.g., < 2 min"
                      size="md"
                      radius="md"
                      value={newContact.responseTime}
                      onChange={(event) => setNewContact({...newContact, responseTime: event.target.value})}
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
                      label="Status"
                      placeholder="Select status"
                      size="md"
                      radius="md"
                      value={newContact.status}
                      onChange={(value) => setNewContact({...newContact, status: value})}
                      data={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' }
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

                <Textarea
                  label="Description"
                  placeholder="Enter contact description"
                  size="md"
                  radius="md"
                  minRows={3}
                  value={newContact.description}
                  onChange={(event) => setNewContact({...newContact, description: event.target.value})}
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
                    onClick={() => setAddContactModalOpened(false)}
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
                    onClick={handleAddContact}
                  >
                    Add Contact
                  </Button>
                </Group>
              </Stack>
            </Modal>

            {/* Edit Contact Modal */}
            <Modal 
              opened={editContactModalOpened} 
              onClose={() => setEditContactModalOpened(false)} 
              title={
                <Text fw={600}>Edit Emergency Contact</Text>
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
              {editingContact && (
                <Stack gap="md">
                  <TextInput
                    label="Contact Name"
                    placeholder="Enter contact name"
                    size="md"
                    radius="md"
                    value={editingContact.name}
                    onChange={(event) => setEditingContact({...editingContact, name: event.target.value})}
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
                        value={editingContact.number}
                        onChange={(event) => setEditingContact({...editingContact, number: event.target.value})}
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
                        label="Contact Type"
                        placeholder="Select contact type"
                        size="md"
                        radius="md"
                        value={editingContact.type}
                        onChange={(value) => setEditingContact({...editingContact, type: value})}
                        data={[
                          { value: 'Primary', label: 'Primary' },
                          { value: 'Medical', label: 'Medical' },
                          { value: 'Security', label: 'Security' },
                          { value: 'Fire', label: 'Fire' },
                          { value: 'Police', label: 'Police' }
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

                  <Grid gutter="md">
                    <Grid.Col span={6}>
                      <TextInput
                        label="Response Time"
                        placeholder="e.g., < 2 min"
                        size="md"
                        radius="md"
                        value={editingContact.responseTime}
                        onChange={(event) => setEditingContact({...editingContact, responseTime: event.target.value})}
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
                        label="Status"
                        placeholder="Select status"
                        size="md"
                        radius="md"
                        value={editingContact.status}
                        onChange={(value) => setEditingContact({...editingContact, status: value})}
                        data={[
                          { value: 'active', label: 'Active' },
                          { value: 'inactive', label: 'Inactive' }
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

                  <Textarea
                    label="Description"
                    placeholder="Enter contact description"
                    size="md"
                    radius="md"
                    minRows={3}
                    value={editingContact.description}
                    onChange={(event) => setEditingContact({...editingContact, description: event.target.value})}
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
                      onClick={() => setEditContactModalOpened(false)}
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
                      onClick={handleSaveContact}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Stack>
              )}
            </Modal>

            {/* Edit Service Modal */}
            <Modal 
              opened={editServiceModalOpened} 
              onClose={() => setEditServiceModalOpened(false)} 
              title={
                <Text fw={600}>Edit Nearby Service</Text>
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
              {editingService && (
                <Stack gap="md">
                  <Grid gutter="md">
                    <Grid.Col span={6}>
                      <TextInput
                        label="Service Name"
                        placeholder="Enter service name"
                        size="md"
                        radius="md"
                        value={editingService.name}
                        onChange={(event) => setEditingService({...editingService, name: event.target.value})}
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
                        value={editingService.type}
                        onChange={(value) => setEditingService({...editingService, type: value})}
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
                    value={editingService.address}
                    onChange={(event) => setEditingService({...editingService, address: event.target.value})}
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
                        value={editingService.phone}
                        onChange={(event) => setEditingService({...editingService, phone: event.target.value})}
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
                        label="Distance"
                        placeholder="e.g., 2.3 km"
                        size="md"
                        radius="md"
                        value={editingService.distance}
                        onChange={(event) => setEditingService({...editingService, distance: event.target.value})}
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
                    label="Google Maps Link"
                    placeholder="Paste Google Maps URL"
                    size="md"
                    radius="md"
                    value={editingService.mapsLink}
                    onChange={(event) => setEditingService({...editingService, mapsLink: event.target.value})}
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

                  <Textarea
                    label="Description"
                    placeholder="Enter service description"
                    size="md"
                    radius="md"
                    minRows={3}
                    value={editingService.description}
                    onChange={(event) => setEditingService({...editingService, description: event.target.value})}
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
                      onClick={() => setEditServiceModalOpened(false)}
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
                      onClick={handleSaveService}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Stack>
              )}
            </Modal>
          </Stack>
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
  );
}

export default EmergencyServices; 