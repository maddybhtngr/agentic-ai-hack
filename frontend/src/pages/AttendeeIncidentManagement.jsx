import { Container, Title, Text, Paper, Stack, AppShell, Group, Badge, Button, rem, Card, Grid, ActionIcon, Modal, TextInput, Select, Textarea, Timeline, Divider, Alert, FileInput, Switch } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconAlertTriangle, IconClock, IconMapPin, IconUser, IconPhone, IconMail, IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconEye, IconActivity, IconShieldLock, IconReportAnalytics, IconChevronRight, IconPhoto } from '@tabler/icons-react';
import AppBar from '../components/AppBar';
import AttendeeSidebar from '../components/AttendeeSidebar';
import FloatingAssistant from '../components/FloatingAssistant';
import { useState, useEffect } from 'react';
import { authUtils, apiService } from '../services/api';

function AttendeeIncidentManagement() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [addModalOpened, setAddModalOpened] = useState(false);

  // Get current user data
  const currentUser = authUtils.getCurrentUser();
  const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Attendee User';
  const [newIncident, setNewIncident] = useState({
    incident_summary: '',
    incident_details: '',
    incident_priority: 'MODERATE',
    incident_type: 'SECURITY REQUIRED',
    zone_id: null,
    is_broadcast: false,
    additional_image: null
  });
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch incidents from API
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    total_incidents: 0,
    reported_count: 0,
    assigned_count: 0,
    resolved_count: 0
  });

  // Fetch incidents and stats from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const incidentsData = await apiService.getAllIncidents();
        const allIncidents = incidentsData.data || incidentsData;
        
        setIncidents(allIncidents);
        
        // Calculate stats based on filtered incidents (attendee reported + broadcast)
        const filteredIncidents = allIncidents.filter(incident => {
          // Show broadcast incidents (relevant to all attendees)
          if (incident.is_broadcast) return true;
          
          // Show incidents reported by this attendee
          if (incident.reporter_name === userName) return true;
          
          return false;
        });
        
        console.log('Attendee Name:', userName);
        console.log('Total incidents:', allIncidents.length);
        console.log('Filtered incidents:', filteredIncidents.length);
        console.log('Filtered incidents:', filteredIncidents.map(i => ({ id: i.id, reporter_name: i.reporter_name, is_broadcast: i.is_broadcast, status: i.status })));
        
        const filteredStats = {
          total_incidents: filteredIncidents.length,
          reported_count: filteredIncidents.filter(i => i.status === 'REPORTED').length,
          assigned_count: filteredIncidents.filter(i => i.status === 'ASSIGNED').length,
          resolved_count: filteredIncidents.filter(i => i.status === 'RESOLVED').length
        };
        
        setStats(filteredStats);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userName]); // Re-run when userName changes

  // Set the latest incident as selected by default
  useEffect(() => {
    if (incidents.length > 0 && !selectedIncident) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  // Fetch zones data
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await apiService.getAvailableZones();
        if (response.success) {
          setZones(response.data);
        }
      } catch (err) {
        console.error('Error fetching zones:', err);
      }
    };

    fetchZones();
  }, []);

  // Debug: Monitor newIncident state changes
  useEffect(() => {
    console.log('newIncident state updated:', newIncident);
  }, [newIncident]);

  // Debug: Monitor modal state
  useEffect(() => {
    console.log('Modal opened state:', addModalOpened);
    if (addModalOpened) {
      console.log('Modal opened - current newIncident state:', newIncident);
      // Ensure state is properly initialized when modal opens
      if (!newIncident.incident_priority || !newIncident.incident_type) {
        console.log('Resetting newIncident state to defaults');
        setNewIncident({
          incident_summary: '',
          incident_details: '',
          incident_priority: 'MODERATE',
          incident_type: 'SECURITY REQUIRED',
          zone_id: null,
          is_broadcast: false,
          additional_image: null
        });
      }
    }
  }, [addModalOpened, newIncident]);

  const handleMenuClick = () => {
    toggle();
    console.log('Attendee menu clicked')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'REPORTED': return 'orange';
      case 'ASSIGNED': return 'blue';
      case 'RESOLVED': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'red';
      case 'MODERATE': return 'yellow';
      case 'GENERAL': return 'green';
      default: return 'gray';
    }
  };

  const getIncidentsByStatus = (status) => {
    return incidents.filter(incident => {
      // Only show incidents that match the status AND are relevant to this attendee
      if (incident.status !== status) return false;
      
      // Show broadcast incidents (relevant to all attendees)
      if (incident.is_broadcast) return true;
      
      // Show incidents reported by this attendee
      if (incident.reporter_name === userName) return true;
      
      return false;
    });
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.name : 'Unknown Zone';
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setViewModalOpened(true);
  };

  const handleAddIncident = async () => {
    if (!newIncident.incident_summary || !newIncident.incident_details) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const incidentData = {
        incident_summary: newIncident.incident_summary,
        incident_details: newIncident.incident_details,
        incident_priority: newIncident.incident_priority,
        incident_type: newIncident.incident_type,
        reporter: 'Attendee',
        reporter_name: userName,
        is_broadcast: newIncident.is_broadcast === true || newIncident.is_broadcast === 'true',
        zone_id: newIncident.zone_id,
        additional_image: newIncident.additional_image
      };
      
      console.log('Sending incident data to API:', incidentData);

      const response = await apiService.createIncident(incidentData);
      
      if (response.success) {
        console.log('Incident created successfully:', response.data);
        
        // Reset form
        setNewIncident({
          incident_summary: '',
          incident_details: '',
          incident_priority: 'MODERATE',
          incident_type: 'SECURITY REQUIRED',
          zone_id: null,
          is_broadcast: false,
          additional_image: null
        });
        setAddModalOpened(false);
        
        // Refresh incidents list with filtering
        const fetchData = async () => {
          try {
            const incidentsData = await apiService.getAllIncidents();
            const allIncidents = incidentsData.data || incidentsData;
            
            setIncidents(allIncidents);
            
            // Calculate stats based on filtered incidents (attendee reported + broadcast)
            const filteredIncidents = allIncidents.filter(incident => {
              if (incident.is_broadcast) return true;
              if (incident.reporter_name === userName) return true;
              return false;
            });
            
            const filteredStats = {
              total_incidents: filteredIncidents.length,
              reported_count: filteredIncidents.filter(i => i.status === 'REPORTED').length,
              assigned_count: filteredIncidents.filter(i => i.status === 'ASSIGNED').length,
              resolved_count: filteredIncidents.filter(i => i.status === 'RESOLVED').length
            };
            
            setStats(filteredStats);
          } catch (err) {
            console.error('Error refreshing data:', err);
          }
        };
        fetchData();
      }
    } catch (err) {
      console.error('Error creating incident:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .incident-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .incident-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          .incident-scroll::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 3px;
          }
          .incident-scroll::-webkit-scrollbar-thumb:hover {
            background: #5a67d8;
          }
        `}
      </style>
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
          <AppBar userName={userName} onMenuClick={handleMenuClick} opened={opened} />
        </AppShell.Header>
        <AttendeeSidebar opened={opened} />
        <AppShell.Main>
          <Container size="100%" py="xl" px="xl">
            <Stack spacing="xl">
              {/* Header Section */}
              <Stack spacing="xs">
                <Group gap="xs">
                  <IconAlertTriangle size={32} style={{ color: '#667eea' }} />
                  <Title 
                    order={1}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700
                    }}
                  >
                    Incident Management
                  </Title>
                </Group>
                <Text c="dimmed" size="sm">
                  Report incidents and track their status
                </Text>
                <Text c="dimmed" size="xs">
                  Viewing incidents reported by you | Broadcast incidents included
                </Text>
              </Stack>

              {/* Report Incident Section */}
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
                      <IconPlus size={24} style={{ color: 'white' }} />
                    </div>
                    <Stack gap="xs">
                      <Title order={3} style={{ fontWeight: 600 }}>
                        Report New Incident
                      </Title>
                      <Text size="sm" c="dimmed">
                        Quickly report and track new security incidents
                      </Text>
                    </Stack>
                  </Group>
                  
                  <Button 
                    size="md"
                    radius="md"
                    leftSection={<IconPlus size={16} />} 
                    onClick={() => setAddModalOpened(true)}
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
                    Report Incident
                  </Button>
                </Group>
              </Paper>

              {/* Stats Overview */}
              <Grid gutter="lg">
                {[
                  {
                    title: 'Reported Incidents',
                    value: stats.reported_count.toString(),
                    icon: IconAlertTriangle,
                    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  },
                  {
                    title: 'Assigned Incidents',
                    value: stats.assigned_count.toString(),
                    icon: IconClock,
                    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  },
                  {
                    title: 'Resolved Incidents',
                    value: stats.resolved_count.toString(),
                    icon: IconCheck,
                    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  },
                  {
                    title: 'Total Incidents',
                    value: stats.total_incidents.toString(),
                    icon: IconReportAnalytics,
                    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }
                ].map((card, index) => (
                  <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
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
                          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)'
                        }
                      }}
                    >
                      <Group gap="md" align="center">
                        <div style={{
                          padding: rem(12),
                          borderRadius: rem(12),
                          background: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <card.icon size={24} style={{ color: 'white' }} />
                        </div>
                        <Stack gap="xs">
                          <Text size="sm" c="dimmed" fw={600}>
                            {card.title}
                          </Text>
                          <Text size="2xl" fw={700} style={{
                            background: card.color,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {card.value}
                          </Text>
                        </Stack>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>

              {/* Incident Tracking - Swimlane Layout */}
              <Grid gutter="xl">
                {/* Reported Incidents */}
                <Grid.Col span={{ base: 12, lg: 4 }}>
                  <Paper 
                    shadow="xl" 
                    p="xl" 
                    radius="lg" 
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '600px'
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

                    <Stack gap="lg">
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
                            <IconAlertTriangle size={24} style={{ color: 'white' }} />
                          </div>
                          <Stack gap="xs">
                            <Title order={3} style={{ fontWeight: 600 }}>
                              Reported
                            </Title>
                            <Text size="sm" c="dimmed">
                              New incidents requiring attention
                            </Text>
                          </Stack>
                        </Group>
                        <Badge color="violet" variant="filled" size="lg">
                          {getIncidentsByStatus('REPORTED').length}
                        </Badge>
                      </Group>

                      <Stack gap="sm" className="incident-scroll" style={{ 
                        maxHeight: '400px', 
                        overflowY: 'auto',
                        paddingRight: '8px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#667eea #f1f1f1'
                      }}>
                        {getIncidentsByStatus('REPORTED').map((incident) => (
                          <Paper
                            key={incident.id}
                            shadow="sm"
                            p="md"
                            radius="md"
                            withBorder
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              background: selectedIncident?.id === incident.id ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                              border: selectedIncident?.id === incident.id ? '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                            onClick={() => handleIncidentClick(incident)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between" align="center">
                                <Badge color={getPriorityColor(incident.incident_priority)} variant="light" size="xs">
                                  {incident.incident_priority}
                                </Badge>
                              </Group>
                              
                              <Text fw={600} size="sm" lineClamp={2}>
                                {incident.incident_summary}
                              </Text>
                              
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {incident.incident_details}
                              </Text>
                              
                              <Group gap="xs" wrap="wrap">
                                <Group gap="xs">
                                  <IconUser size={12} />
                                  <Text size="xs" c="dimmed">{incident.reporter_name}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconClock size={12} />
                                  <Text size="xs" c="dimmed">
                                    {new Date(incident.creation_time).toLocaleTimeString()}
                                  </Text>
                                </Group>
                                {incident.is_broadcast ? (
                                  <Group gap="xs">
                                    <IconMapPin size={12} style={{ color: '#667eea' }} />
                                    <Text size="xs" c="dimmed">Broadcast to All Zones</Text>
                                  </Group>
                                ) : incident.zone_id && (
                                  <Group gap="xs">
                                    <IconMapPin size={12} />
                                    <Text size="xs" c="dimmed">{getZoneName(incident.zone_id)}</Text>
                                  </Group>
                                )}
                              </Group>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* Assigned Incidents */}
                <Grid.Col span={{ base: 12, lg: 4 }}>
                  <Paper 
                    shadow="xl" 
                    p="xl" 
                    radius="lg" 
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '600px'
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

                    <Stack gap="lg">
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
                            <IconClock size={24} style={{ color: 'white' }} />
                          </div>
                          <Stack gap="xs">
                            <Title order={3} style={{ fontWeight: 600 }}>
                              Assigned
                            </Title>
                            <Text size="sm" c="dimmed">
                              Incidents currently being handled
                            </Text>
                          </Stack>
                        </Group>
                        <Badge color="violet" variant="filled" size="lg">
                          {getIncidentsByStatus('ASSIGNED').length}
                        </Badge>
                      </Group>

                      <Stack gap="sm" className="incident-scroll" style={{ 
                        maxHeight: '400px', 
                        overflowY: 'auto',
                        paddingRight: '8px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#667eea #f1f1f1'
                      }}>
                        {getIncidentsByStatus('ASSIGNED').map((incident) => (
                          <Paper
                            key={incident.id}
                            shadow="sm"
                            p="md"
                            radius="md"
                            withBorder
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              background: selectedIncident?.id === incident.id ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                              border: selectedIncident?.id === incident.id ? '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                            onClick={() => handleIncidentClick(incident)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between" align="center">
                                <Badge color={getPriorityColor(incident.incident_priority)} variant="light" size="xs">
                                  {incident.incident_priority}
                                </Badge>
                              </Group>
                              
                              <Text fw={600} size="sm" lineClamp={2}>
                                {incident.incident_summary}
                              </Text>
                              
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {incident.incident_details}
                              </Text>
                              
                              <Group gap="xs" wrap="wrap">
                                <Group gap="xs">
                                  <IconUser size={12} />
                                  <Text size="xs" c="dimmed">{incident.reporter_name}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconClock size={12} />
                                  <Text size="xs" c="dimmed">
                                    {new Date(incident.creation_time).toLocaleTimeString()}
                                  </Text>
                                </Group>
                                {incident.is_broadcast ? (
                                  <Group gap="xs">
                                    <IconMapPin size={12} style={{ color: '#667eea' }} />
                                    <Text size="xs" c="dimmed">Broadcast to All Zones</Text>
                                  </Group>
                                ) : incident.zone_id && (
                                  <Group gap="xs">
                                    <IconMapPin size={12} />
                                    <Text size="xs" c="dimmed">{getZoneName(incident.zone_id)}</Text>
                                  </Group>
                                )}
                              </Group>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* Resolved Incidents */}
                <Grid.Col span={{ base: 12, lg: 4 }}>
                  <Paper 
                    shadow="xl" 
                    p="xl" 
                    radius="lg" 
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '600px'
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

                    <Stack gap="lg">
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
                            <IconCheck size={24} style={{ color: 'white' }} />
                          </div>
                          <Stack gap="xs">
                            <Title order={3} style={{ fontWeight: 600 }}>
                              Resolved
                            </Title>
                            <Text size="sm" c="dimmed">
                              Successfully resolved incidents
                            </Text>
                          </Stack>
                        </Group>
                        <Badge color="violet" variant="filled" size="lg">
                          {getIncidentsByStatus('RESOLVED').length}
                        </Badge>
                      </Group>

                      <Stack gap="sm" className="incident-scroll" style={{ 
                        maxHeight: '400px', 
                        overflowY: 'auto',
                        paddingRight: '8px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#667eea #f1f1f1'
                      }}>
                        {getIncidentsByStatus('RESOLVED').map((incident) => (
                          <Paper
                            key={incident.id}
                            shadow="sm"
                            p="md"
                            radius="md"
                            withBorder
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              background: selectedIncident?.id === incident.id ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                              border: selectedIncident?.id === incident.id ? '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                            onClick={() => handleIncidentClick(incident)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between" align="center">
                                <Badge color={getPriorityColor(incident.incident_priority)} variant="light" size="xs">
                                  {incident.incident_priority}
                                </Badge>
                              </Group>
                              
                              <Text fw={600} size="sm" lineClamp={2}>
                                {incident.incident_summary}
                              </Text>
                              
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {incident.incident_details}
                              </Text>
                              
                              <Group gap="xs" wrap="wrap">
                                <Group gap="xs">
                                  <IconUser size={12} />
                                  <Text size="xs" c="dimmed">{incident.reporter_name}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconClock size={12} />
                                  <Text size="xs" c="dimmed">
                                    {new Date(incident.creation_time).toLocaleTimeString()}
                                  </Text>
                                </Group>
                                {incident.is_broadcast ? (
                                  <Group gap="xs">
                                    <IconMapPin size={12} style={{ color: '#667eea' }} />
                                    <Text size="xs" c="dimmed">Broadcast to All Zones</Text>
                                  </Group>
                                ) : incident.zone_id && (
                                  <Group gap="xs">
                                    <IconMapPin size={12} />
                                    <Text size="xs" c="dimmed">{getZoneName(incident.zone_id)}</Text>
                                  </Group>
                                )}
                              </Group>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Stack>
          </Container>
        </AppShell.Main>
      </AppShell>

      {/* Add Incident Modal */}
      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        size="lg"
        title={
          <Group gap="sm">
            <div style={{
              padding: rem(8),
              borderRadius: rem(8),
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconPlus size={20} style={{ color: 'white' }} />
            </div>
            <Text fw={600} size="lg">Report New Incident</Text>
          </Group>
        }
        styles={{
          title: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }
        }}
      >
        <Stack gap="lg">
          <Alert
            icon={<IconUser size={16} />}
            title="Reporter Information"
            color="blue"
            variant="light"
          >
            <Text size="sm">
              <strong>Reporter:</strong> {userName} (Attendee)
            </Text>
          </Alert>

          <TextInput
            label="Incident Summary"
            placeholder="Brief description of the incident"
            value={newIncident.incident_summary}
            onChange={(e) => {
              console.log('incident_summary changed:', e.target.value);
              setNewIncident(prev => ({ ...prev, incident_summary: e.target.value }));
            }}
            required
          />

          <Textarea
            label="Incident Details"
            placeholder="Detailed description of what happened"
            value={newIncident.incident_details}
            onChange={(e) => {
              console.log('incident_details changed:', e.target.value);
              setNewIncident(prev => ({ ...prev, incident_details: e.target.value }));
            }}
            rows={4}
            required
          />

          <Group grow>
            <Select
              label="Priority Level"
              placeholder="Select priority"
              data={[
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'MODERATE', label: 'Moderate' },
                { value: 'GENERAL', label: 'General' }
              ]}
              value={newIncident.incident_priority}
              onChange={(value) => setNewIncident(prev => ({ ...prev, incident_priority: value }))}
            />

            <Select
              label="Incident Type"
              placeholder="Select type"
              data={[
                { value: 'CROWD OVERFLOW', label: 'Crowd Overflow' },
                { value: 'MEDICAL ATTENTION REQUIRED', label: 'Medical Attention Required' },
                { value: 'SECURITY REQUIRED', label: 'Security Required' }
              ]}
              value={newIncident.incident_type}
              onChange={(value) => setNewIncident(prev => ({ ...prev, incident_type: value }))}
            />
          </Group>

          <Switch
            label="Broadcast to all zones"
            description="Make this incident visible to all zones"
            checked={newIncident.is_broadcast}
            onChange={(event) => {
              console.log('is_broadcast changed:', event.currentTarget.checked);
              setNewIncident(prev => ({ ...prev, is_broadcast: event.currentTarget.checked }));
            }}
          />

          {!newIncident.is_broadcast && (
            <Select
              label="Zone (Optional)"
              placeholder="Select specific zone"
              data={zones.map(zone => ({ value: zone.id.toString(), label: zone.name }))}
              value={newIncident.zone_id?.toString()}
              onChange={(value) => setNewIncident(prev => ({ ...prev, zone_id: value ? parseInt(value) : null }))}
              clearable
            />
          )}

          <FileInput
            label="Additional Image (Optional)"
            placeholder="Upload an image"
            accept="image/*"
            value={newIncident.additional_image}
            onChange={(file) => setNewIncident(prev => ({ ...prev, additional_image: file }))}
            leftSection={<IconPhoto size={16} />}
          />

          <Group justify="flex-end" gap="md">
            <Button
              variant="light"
              onClick={() => setAddModalOpened(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddIncident}
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Report Incident
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Incident Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        size="lg"
        title={
          <Group gap="sm">
            <div style={{
              padding: rem(8),
              borderRadius: rem(8),
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconEye size={20} style={{ color: 'white' }} />
            </div>
            <Text fw={600} size="lg">Incident Details</Text>
          </Group>
        }
        styles={{
          title: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }
        }}
      >
        {selectedIncident && (
          <Stack gap="lg">
            <Group gap="md">
              <Badge color={getPriorityColor(selectedIncident.incident_priority)} variant="filled" size="lg">
                {selectedIncident.incident_priority}
              </Badge>
              <Badge color={getStatusColor(selectedIncident.status)} variant="light" size="lg">
                {selectedIncident.status}
              </Badge>
            </Group>

            <Stack gap="xs">
              <Text fw={600} size="lg">
                {selectedIncident.incident_summary}
              </Text>
              <Text c="dimmed">
                {selectedIncident.incident_details}
              </Text>
            </Stack>

            <Divider />

            <Stack gap="sm">
              <Group gap="md">
                <Group gap="xs">
                  <IconUser size={16} />
                  <Text size="sm" fw={500}>Reporter:</Text>
                  <Text size="sm">{selectedIncident.reporter_name}</Text>
                </Group>
                <Group gap="xs">
                  <IconClock size={16} />
                  <Text size="sm" fw={500}>Reported:</Text>
                  <Text size="sm">{new Date(selectedIncident.creation_time).toLocaleString()}</Text>
                </Group>
              </Group>

              <Group gap="md">
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text size="sm" fw={500}>Broadcast:</Text>
                  <Text size="sm">{selectedIncident.is_broadcast ? 'Yes' : 'No'}</Text>
                </Group>
                {selectedIncident.zone_id && (
                  <Group gap="xs">
                    <IconMapPin size={16} />
                    <Text size="sm" fw={500}>Zone:</Text>
                    <Text size="sm">{getZoneName(selectedIncident.zone_id)}</Text>
                  </Group>
                )}
              </Group>
            </Stack>

            {selectedIncident.additional_image && (
              <>
                <Divider />
                <Stack gap="xs">
                  <Text fw={500} size="sm">Additional Image:</Text>
                  <img 
                    src={URL.createObjectURL(selectedIncident.additional_image)} 
                    alt="Incident" 
                    style={{ 
                      maxWidth: '100%', 
                      borderRadius: rem(8),
                      border: '1px solid #e0e0e0'
                    }} 
                  />
                </Stack>
              </>
            )}
          </Stack>
        )}
      </Modal>

      <FloatingAssistant />
    </>
  );
}

export default AttendeeIncidentManagement; 