import { Container, Title, Text, Paper, Stack, AppShell, Group, Badge, Button, rem, Card, Grid, ActionIcon, Modal, TextInput, Select, Textarea, Timeline, Divider, LoadingOverlay, Alert, FileInput, Switch } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconAlertTriangle, IconClock, IconMapPin, IconUser, IconPhone, IconMail, IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconEye, IconActivity, IconShieldLock, IconReportAnalytics, IconChevronRight, IconPhoto } from '@tabler/icons-react';
import AppBar from '../components/AppBar';
import Sidebar from '../components/Sidebar';
import FloatingAssistant from '../components/FloatingAssistant';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

function IncidentManagement() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [updateModalOpened, setUpdateModalOpened] = useState(false);
  const [assignModalOpened, setAssignModalOpened] = useState(false);
  const [imageModalOpened, setImageModalOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    total_incidents: 0,
    reported_count: 0,
    assigned_count: 0,
    resolved_count: 0
  });
  
  const [zones, setZones] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  
  const [newIncident, setNewIncident] = useState({
    reporter: 'Admin',
    reporter_name: 'Admin User',
    incident_priority: 'GENERAL',
    incident_type: 'CROWD OVERFLOW',
    incident_summary: '',
    incident_details: '',
    additional_image: null,
    zone_id: null,
    is_broadcast: false
  });
  
  const [assignData, setAssignData] = useState({
    resolver: '',
    staff_id: null
  });
  
  const [updateDetails, setUpdateDetails] = useState({
    incident_summary: '',
    incident_details: '',
    additional_image: null
  })

  // Fetch incidents and zones from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [incidentsData, statsData, zonesData] = await Promise.all([
          apiService.getAllIncidents(),
          apiService.getIncidentStats(),
          apiService.getAvailableZones()
        ]);
        
        setIncidents(incidentsData.data || incidentsData);
        setStats(statsData.data || statsData);
        setZones(zonesData.data || zonesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set the latest incident as selected by default
  useEffect(() => {
    if (incidents.length > 0 && !selectedIncident) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  const handleMenuClick = () => {
    toggle();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REPORTED': return 'red';
      case 'ASSIGNED': return 'yellow';
      case 'RESOLVED': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'red';
      case 'MODERATE': return 'yellow';
      case 'GENERAL': return 'blue';
      default: return 'gray';
    }
  };

  const getIncidentsByStatus = (status) => {
    return incidents.filter(incident => incident.status === status);
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.name : 'Unknown Zone';
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setViewModalOpened(true);
  }

  const handleAssignClick = async (incident) => {
    setSelectedIncident(incident);
    setAssignModalOpened(true);
    
    // Fetch available staff based on incident zone
    try {
      let staffResponse;
      if (incident.is_broadcast) {
        // For broadcast incidents, get all staff
        staffResponse = await apiService.getAvailableStaff();
      } else if (incident.zone_id) {
        // For zone-specific incidents, get staff for that zone
        staffResponse = await apiService.getAvailableStaff(incident.zone_id);
      } else {
        // For incidents without zone, get all staff
        staffResponse = await apiService.getAvailableStaff();
      }
      
      if (staffResponse.success) {
        setAvailableStaff(staffResponse.data);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load available staff');
    }
  };

  const handleViewImage = (incident) => {
    setSelectedIncident(incident);
    setImageModalOpened(true);
  };

  const handleAddIncident = async () => {
    if (newIncident.incident_summary && newIncident.incident_details) {
      try {
        const response = await apiService.createIncident(newIncident);
        const createdIncident = response.data || response;
        
        setIncidents([createdIncident, ...incidents]);
        setNewIncident({
          reporter: 'Admin',
          reporter_name: 'Admin User',
          incident_priority: 'GENERAL',
          incident_type: 'CROWD OVERFLOW',
          incident_summary: '',
          incident_details: '',
          additional_image: null,
          zone_id: null,
          is_broadcast: false
        });
        setAddModalOpened(false);
      } catch (err) {
        console.error('Error creating incident:', err);
        setError('Failed to create incident');
      }
    }
  };

  const handleUpdateIncident = async () => {
    if (selectedIncident && updateDetails.incident_summary.trim()) {
      try {
        const response = await apiService.updateIncident(selectedIncident.id, updateDetails);
        const updatedIncident = response.data || response;
        
        setIncidents(incidents.map(inc => 
          inc.id === selectedIncident.id ? updatedIncident : inc
        ));
        setSelectedIncident(updatedIncident);
        setUpdateDetails({
          incident_summary: '',
          incident_details: '',
          additional_image: null
        });
        setUpdateModalOpened(false);
      } catch (err) {
        console.error('Error updating incident:', err);
        setError('Failed to update incident');
      }
    }
  };

  const handleAssignIncident = async () => {
    if (selectedIncident && assignData.resolver.trim()) {
      try {
        const response = await apiService.assignIncident(selectedIncident.id, assignData.resolver);
        const updatedIncident = response.data || response;
        
        setIncidents(incidents.map(inc => 
          inc.id === selectedIncident.id ? updatedIncident : inc
        ));
        setSelectedIncident(updatedIncident);
        setAssignData({ resolver: '', staff_id: null });
        setAssignModalOpened(false);
      } catch (err) {
        console.error('Error assigning incident:', err);
        setError('Failed to assign incident');
      }
    }
  };

  const handleResolveIncident = async () => {
    if (selectedIncident) {
      try {
        const response = await apiService.resolveIncident(selectedIncident.id);
        const updatedIncident = response.data || response;
        
        setIncidents(incidents.map(inc => 
          inc.id === selectedIncident.id ? updatedIncident : inc
        ));
        setSelectedIncident(updatedIncident);
      } catch (err) {
        console.error('Error resolving incident:', err);
        setError('Failed to resolve incident');
      }
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
        <AppBar userName="Admin User" onMenuClick={handleMenuClick} opened={opened} />
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
                Monitor, track, and resolve security incidents in real-time
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

            {/* Status-based Incident Organization */}
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
                              <ActionIcon
                                variant="light"
                                size="sm"
                                color="blue"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignClick(incident);
                                }}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
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
                              {incident.additional_image && (
                                <Group gap="xs">
                                  <IconPhoto size={12} style={{ color: '#667eea' }} />
                                  <Text size="xs" c="dimmed">Has Image</Text>
                                  <ActionIcon
                                    variant="light"
                                    size="xs"
                                    color="blue"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewImage(incident);
                                    }}
                                  >
                                    <IconEye size={10} />
                                  </ActionIcon>
                                </Group>
                              )}
                              {incident.is_broadcast ? (
                                <Group gap="xs">
                                  <IconMapPin size={12} style={{ color: '#667eea' }} />
                                  <Text size="xs" c="dimmed">Broadcast to All Zones</Text>
                                </Group>
                              ) : incident.zone_id && (
                                <Group gap="xs">
                                  <IconMapPin size={12} style={{ color: '#667eea' }} />
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
                            Incidents being handled
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
                              <ActionIcon
                                variant="light"
                                size="sm"
                                color="green"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResolveIncident();
                                }}
                              >
                                <IconCheck size={14} />
                              </ActionIcon>
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
                                <Text size="xs" c="dimmed">{incident.resolver}</Text>
                              </Group>
                              <Group gap="xs">
                                <IconClock size={12} />
                                <Text size="xs" c="dimmed">
                                  {new Date(incident.updated_at).toLocaleTimeString()}
                                </Text>
                              </Group>
                              {incident.additional_image && (
                                <Group gap="xs">
                                  <IconPhoto size={12} style={{ color: '#667eea' }} />
                                  <Text size="xs" c="dimmed">Has Image</Text>
                                  <ActionIcon
                                    variant="light"
                                    size="xs"
                                    color="blue"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewImage(incident);
                                    }}
                                  >
                                    <IconEye size={10} />
                                  </ActionIcon>
                                </Group>
                              )}
                              {incident.is_broadcast ? (
                                <Group gap="xs">
                                  <IconMapPin size={12} style={{ color: '#667eea' }} />
                                  <Text size="xs" c="dimmed">Broadcast to All Zones</Text>
                                </Group>
                              ) : incident.zone_id && (
                                <Group gap="xs">
                                  <IconMapPin size={12} style={{ color: '#667eea' }} />
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
                            Completed incidents
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
                              <Badge color="green" variant="filled" size="xs">
                                RESOLVED
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
                                <Text size="xs" c="dimmed">{incident.resolver}</Text>
                              </Group>
                              <Group gap="xs">
                                <IconClock size={12} />
                                <Text size="xs" c="dimmed">
                                  {new Date(incident.updated_at).toLocaleTimeString()}
                                </Text>
                              </Group>
                              {incident.additional_image && (
                                <Group gap="xs">
                                  <IconPhoto size={12} style={{ color: '#667eea' }} />
                                  <Text size="xs" c="dimmed">Has Image</Text>
                                  <ActionIcon
                                    variant="light"
                                    size="xs"
                                    color="blue"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewImage(incident);
                                    }}
                                  >
                                    <IconEye size={10} />
                                  </ActionIcon>
                                </Group>
                              )}
                              {incident.is_broadcast ? (
                                <Group gap="xs">
                                  <IconMapPin size={12} style={{ color: '#667eea' }} />
                                  <Text size="xs" c="dimmed">Broadcast to All Zones</Text>
                                </Group>
                              ) : incident.zone_id && (
                                <Group gap="xs">
                                  <IconMapPin size={12} style={{ color: '#667eea' }} />
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
                    <strong>Reporter:</strong> Admin User (Admin)
                  </Text>
                </Alert>

                <TextInput
                  label="Incident Summary"
                  placeholder="Brief description of the incident"
                  value={newIncident.incident_summary}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, incident_summary: e.target.value }))}
                  required
                />

                <Textarea
                  label="Incident Details"
                  placeholder="Detailed description of what happened"
                  value={newIncident.incident_details}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, incident_details: e.target.value }))}
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
                  onChange={(event) => setNewIncident(prev => ({ ...prev, is_broadcast: event.currentTarget.checked }))}
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

                    {selectedIncident.resolver && (
                      <Group gap="md">
                        <Group gap="xs">
                          <IconShieldLock size={16} />
                          <Text size="sm" fw={500}>Assigned To:</Text>
                          <Text size="sm">{selectedIncident.resolver}</Text>
                        </Group>
                      </Group>
                    )}
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

            {/* Update Incident Modal */}
            <Modal 
              opened={updateModalOpened} 
              onClose={() => setUpdateModalOpened(false)} 
              title={
                <Text fw={600}>Update Incident Details</Text>
              }
              centered
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
                  label="Incident Summary"
                  placeholder="Brief summary of the incident"
                  value={updateDetails.incident_summary}
                  onChange={(event) => setUpdateDetails({...updateDetails, incident_summary: event.target.value})}
                  size="md"
                  radius="md"
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
                  label="Incident Details"
                  placeholder="Describe the incident details"
                  value={updateDetails.incident_details}
                  onChange={(event) => setUpdateDetails({...updateDetails, incident_details: event.target.value})}
                  size="md"
                  radius="md"
                  minRows={3}
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
                    onClick={() => setUpdateModalOpened(false)}
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
                    onClick={handleUpdateIncident}
                  >
                    Update Details
                  </Button>
                </Group>
              </Stack>
            </Modal>

            {/* Assign Incident Modal */}
            <Modal 
              opened={assignModalOpened} 
              onClose={() => setAssignModalOpened(false)} 
              title={
                <Group gap="xs">
                  <IconUser size={20} style={{ color: '#667eea' }} />
                  <Text fw={600}>Assign Incident</Text>
                </Group>
              }
              centered
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
                <Select
                  label="Assign to Staff Member"
                  placeholder="Select a staff member"
                  data={availableStaff.map(staff => ({ 
                    value: staff.id.toString(), 
                    label: `${staff.first_name} ${staff.last_name} (${staff.role}) - ${staff.assigned_zone}` 
                  }))}
                  value={assignData.staff_id ? assignData.staff_id.toString() : null}
                  onChange={(value) => {
                    const selectedStaff = availableStaff.find(staff => staff.id.toString() === value);
                    setAssignData({
                      ...assignData, 
                      staff_id: value ? parseInt(value) : null,
                      resolver: selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name}` : ''
                    });
                  }}
                  size="md"
                  radius="md"
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
                    onClick={() => setAssignModalOpened(false)}
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
                    onClick={handleAssignIncident}
                  >
                    Assign Incident
                  </Button>
                </Group>
              </Stack>
            </Modal>

            {/* View Image Modal */}
            <Modal 
              opened={imageModalOpened} 
              onClose={() => setImageModalOpened(false)} 
              title={
                <Group gap="xs">
                  <IconPhoto size={20} style={{ color: '#667eea' }} />
                  <Text fw={600}>Incident Image</Text>
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
                {selectedIncident?.additional_image && (
                  <div style={{ textAlign: 'center' }}>
                    <img 
                                              src={`https://backend-service-178028895966.us-central1.run.app${selectedIncident.additional_image}`}
                      alt="Incident Image"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{ 
                      display: 'none', 
                      padding: '20px', 
                      background: '#f8f9fa', 
                      borderRadius: '8px',
                      color: '#6c757d'
                    }}>
                      Image could not be loaded
                    </div>
                  </div>
                )}
                
                <Group justify="flex-end" gap="md">
                  <Button 
                    variant="outline" 
                    onClick={() => setImageModalOpened(false)}
                    size="md"
                    radius="md"
                  >
                    Close
                  </Button>
                </Group>
              </Stack>
            </Modal>
          </Stack>
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
    </>
  );
}

export default IncidentManagement;