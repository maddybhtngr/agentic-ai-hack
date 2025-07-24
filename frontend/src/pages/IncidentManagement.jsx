import { Container, Title, Text, Paper, Stack, AppShell, Group, Badge, Button, rem, Card, Grid, ActionIcon, Modal, TextInput, Select, Textarea, Timeline, Divider } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconAlertTriangle, IconClock, IconMapPin, IconUser, IconPhone, IconMail, IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconEye, IconActivity, IconShieldLock, IconReportAnalytics, IconChevronRight } from '@tabler/icons-react';
import AppBar from '../components/AppBar';
import Sidebar from '../components/Sidebar';
import { useState, useEffect } from 'react';

function IncidentManagement() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [updateModalOpened, setUpdateModalOpened] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    priority: 'medium',
    location: ''
  });
  const [updateDescription, setUpdateDescription] = useState('')
  const [updateDetails, setUpdateDetails] = useState({
    description: '',
    location: '',
    assignedTo: '',
    contact: '',
    email: ''
  })

  // Sample incident data
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      title: 'Crowd Overflow in Zone A',
      description: 'Large crowd detected exceeding capacity limits in the main entrance area.',
      status: 'active',
      priority: 'high',
      location: 'Zone A - Main Entrance',
      reportedBy: 'John Smith',
      reportedAt: '2024-01-15 14:30',
      assignedTo: 'Security Team Alpha',
      contact: '+1 (555) 123-4567',
      email: 'security@drishti.com',
      updates: [
        { time: '14:30', action: 'Incident reported', user: 'John Smith' },
        { time: '14:32', action: 'Security team dispatched', user: 'System' },
        { time: '14:35', action: 'Crowd control measures initiated', user: 'Team Alpha' }
      ]
    },
    {
      id: 2,
      title: 'Suspicious Activity Detected',
      description: 'Unusual behavior patterns detected in Zone C parking area.',
      status: 'investigating',
      priority: 'medium',
      location: 'Zone C - Parking Area',
      reportedBy: 'AI System',
      reportedAt: '2024-01-15 13:45',
      assignedTo: 'Investigation Team',
      contact: '+1 (555) 987-6543',
      email: 'investigation@drishti.com',
      updates: [
        { time: '13:45', action: 'AI alert triggered', user: 'System' },
        { time: '13:47', action: 'Investigation team notified', user: 'System' },
        { time: '13:50', action: 'On-site investigation started', user: 'Team Beta' }
      ]
    },
    {
      id: 3,
      title: 'Medical Emergency',
      description: 'Medical assistance required for attendee in Zone B.',
      status: 'resolved',
      priority: 'high',
      location: 'Zone B - Food Court',
      reportedBy: 'Sarah Johnson',
      reportedAt: '2024-01-15 12:15',
      assignedTo: 'Medical Team',
      contact: '+1 (555) 456-7890',
      email: 'medical@drishti.com',
      updates: [
        { time: '12:15', action: 'Medical emergency reported', user: 'Sarah Johnson' },
        { time: '12:17', action: 'Medical team dispatched', user: 'System' },
        { time: '12:20', action: 'First aid provided', user: 'Medical Team' },
        { time: '12:25', action: 'Incident resolved', user: 'Medical Team' }
      ]
    }
  ]);

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
      case 'active': return 'red';
      case 'investigating': return 'yellow';
      case 'resolved': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident)
    setUpdateDetails({
      description: incident.description,
      location: incident.location,
      assignedTo: incident.assignedTo,
      contact: incident.contact,
      email: incident.email
    })
  }

  const handleAddIncident = () => {
    if (newIncident.title && newIncident.description && newIncident.location) {
      const incident = {
        id: incidents.length + 1,
        ...newIncident,
        status: 'active',
        assignedTo: 'Security Team',
        contact: '+1 (555) 123-4567',
        email: 'security@event.com',
        reportedAt: new Date().toLocaleTimeString(),
        updates: [
          {
            action: 'Incident reported',
            time: new Date().toLocaleTimeString(),
            user: 'System'
          }
        ]
      }
      setIncidents([incident, ...incidents])
      setNewIncident({ title: '', description: '', priority: 'medium', location: '' })
      setAddModalOpened(false)
    }
  }

  const handleUpdateIncident = () => {
    if (updateDetails.description.trim() && updateDetails.location.trim() && updateDetails.assignedTo.trim()) {
      const updatedIncident = {
        ...selectedIncident,
        description: updateDetails.description,
        location: updateDetails.location,
        assignedTo: updateDetails.assignedTo,
        contact: updateDetails.contact,
        email: updateDetails.email,
        updates: [
          ...selectedIncident.updates,
          {
            action: 'Incident details updated',
            time: new Date().toLocaleTimeString(),
            user: 'Admin'
          }
        ]
      }
      setIncidents(incidents.map(inc => inc.id === selectedIncident.id ? updatedIncident : inc))
      setSelectedIncident(updatedIncident)
      setUpdateDetails({
        description: '',
        location: '',
        assignedTo: '',
        contact: '',
        email: ''
      })
      setUpdateModalOpened(false)
    }
  }

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
        <AppBar userName="Admin User" onMenuClick={handleMenuClick} opened={opened} />
      </AppShell.Header>
      <Sidebar opened={opened} />
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
                  title: 'Active Incidents',
                  value: incidents.filter(i => i.status === 'active').length.toString(),
                  icon: IconAlertTriangle,
                  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                },
                {
                  title: 'Investigating',
                  value: incidents.filter(i => i.status === 'investigating').length.toString(),
                  icon: IconClock,
                  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                },
                {
                  title: 'Resolved',
                  value: incidents.filter(i => i.status === 'resolved').length.toString(),
                  icon: IconCheck,
                  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                },
                {
                  title: 'Total Incidents',
                  value: incidents.length.toString(),
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

            {/* Gmail-like Incident Tracking Layout */}
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
                minHeight: '600px'
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
                      <IconActivity size={24} style={{ color: 'white' }} />
                    </div>
                    <Stack gap="xs">
                      <Title order={3} style={{ fontWeight: 600 }}>
                        Incident Tracking
                      </Title>
                      <Text size="sm" c="dimmed">
                        Monitor and manage active security incidents
                      </Text>
                    </Stack>
                  </Group>
                </Group>

                {/* Gmail-like Layout */}
                <div style={{ display: 'flex', gap: rem(20), height: '500px' }}>
                  {/* Left Panel - Incident List */}
                  <div style={{ 
                    width: '40%', 
                    borderRight: '1px solid #e9ecef',
                    overflowY: 'auto',
                    maxHeight: '500px'
                  }}>
                    <Stack gap="xs">
                      {incidents.map((incident) => (
                        <Paper
                          key={incident.id}
                          p="md"
                          radius="md"
                          style={{
                            background: selectedIncident?.id === incident.id 
                              ? 'rgba(102, 126, 234, 0.1)' 
                              : 'rgba(255, 255, 255, 0.8)',
                            border: selectedIncident?.id === incident.id 
                              ? '2px solid #667eea' 
                              : '1px solid #e9ecef',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: 'rgba(102, 126, 234, 0.05)',
                              transform: 'translateX(4px)'
                            }
                          }}
                          onClick={() => handleIncidentClick(incident)}
                        >
                          <Group justify="space-between" align="flex-start">
                            <Stack gap="xs" style={{ flex: 1 }}>
                              <Group gap="xs" align="center">
                                <Text fw={600} size="sm" lineClamp={1}>
                                  {incident.title}
                                </Text>
                                <Badge 
                                  color={getStatusColor(incident.status)} 
                                  variant="light"
                                  size="xs"
                                >
                                  {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                                </Badge>
                                <Badge 
                                  color={getPriorityColor(incident.priority)} 
                                  variant="light"
                                  size="xs"
                                >
                                  {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)}
                                </Badge>
                              </Group>
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {incident.description}
                              </Text>
                              <Group gap="xs">
                                <IconMapPin size={12} style={{ color: '#667eea' }} />
                                <Text size="xs" c="dimmed">{incident.location}</Text>
                              </Group>
                              <Group gap="xs">
                                <IconClock size={12} style={{ color: '#667eea' }} />
                                <Text size="xs" c="dimmed">{incident.reportedAt}</Text>
                              </Group>
                            </Stack>
                            <IconChevronRight size={16} style={{ color: '#667eea' }} />
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </div>

                  {/* Right Panel - Incident Details */}
                  <div style={{ 
                    width: '60%', 
                    paddingLeft: rem(20),
                    overflowY: 'auto',
                    maxHeight: '500px'
                  }}>
                    {selectedIncident ? (
                      <Stack gap="lg">
                        {/* Header */}
                        <Group justify="space-between" align="flex-start">
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Text fw={700} size="xl">{selectedIncident.title}</Text>
                            <Group gap="xs">
                              <Badge color={getStatusColor(selectedIncident.status)} variant="light">
                                {selectedIncident.status.charAt(0).toUpperCase() + selectedIncident.status.slice(1)}
                              </Badge>
                              <Badge color={getPriorityColor(selectedIncident.priority)} variant="light">
                                {selectedIncident.priority.charAt(0).toUpperCase() + selectedIncident.priority.slice(1)}
                              </Badge>
                            </Group>
                          </Stack>
                        </Group>

                        <Divider />

                        {/* Description */}
                        <Stack gap="xs">
                          <Text fw={600} size="sm">Description</Text>
                          <Text size="sm" c="dimmed">{selectedIncident.description}</Text>
                        </Stack>

                        {/* Details Grid */}
                        <Grid gutter="md">
                          <Grid.Col span={6}>
                            <Stack gap="xs">
                              <Group gap="xs">
                                <IconMapPin size={16} style={{ color: '#667eea' }} />
                                <Text size="sm" fw={500}>Location</Text>
                              </Group>
                              <Text size="sm">{selectedIncident.location}</Text>
                            </Stack>
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <Stack gap="xs">
                              <Group gap="xs">
                                <IconUser size={16} style={{ color: '#667eea' }} />
                                <Text size="sm" fw={500}>Assigned To</Text>
                              </Group>
                              <Text size="sm">{selectedIncident.assignedTo}</Text>
                            </Stack>
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <Stack gap="xs">
                              <Group gap="xs">
                                <IconPhone size={16} style={{ color: '#667eea' }} />
                                <Text size="sm" fw={500}>Contact</Text>
                              </Group>
                              <Text size="sm">{selectedIncident.contact}</Text>
                            </Stack>
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <Stack gap="xs">
                              <Group gap="xs">
                                <IconMail size={16} style={{ color: '#667eea' }} />
                                <Text size="sm" fw={500}>Email</Text>
                              </Group>
                              <Text size="sm">{selectedIncident.email}</Text>
                            </Stack>
                          </Grid.Col>
                        </Grid>

                        <Divider />

                        {/* Timeline */}
                        <Stack gap="xs">
                          <Text fw={600} size="sm">Incident Progress</Text>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: rem(8)
                          }}>
                            {/* Step 1: Incident Reported */}
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <div style={{
                                width: rem(32),
                                height: rem(32),
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid white',
                                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                              }}>
                                <IconCheck size={16} style={{ color: 'white' }} />
                              </div>
                              <div style={{ marginLeft: rem(12), flex: 1 }}>
                                <Text size="sm" fw={600} c="#22c55e">Incident Reported</Text>
                                <Text size="xs" c="dimmed">14:30 - John Smith</Text>
                              </div>
                            </div>
                            
                            {/* Connector Line */}
                            <div style={{
                              flex: 1,
                              height: '2px',
                              background: 'linear-gradient(90deg, #22c55e, #667eea)',
                              position: 'relative'
                            }} />
                            
                            {/* Step 2: Incident Acknowledged */}
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <div style={{
                                width: rem(32),
                                height: rem(32),
                                borderRadius: '50%',
                                background: selectedIncident.status === 'resolved' 
                                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid white',
                                boxShadow: selectedIncident.status === 'resolved' 
                                  ? '0 2px 8px rgba(34, 197, 94, 0.3)'
                                  : '0 2px 8px rgba(102, 126, 234, 0.3)'
                              }}>
                                {selectedIncident.status === 'resolved' ? (
                                  <IconCheck size={16} style={{ color: 'white' }} />
                                ) : (
                                  <IconActivity size={16} style={{ color: 'white' }} />
                                )}
                              </div>
                              <div style={{ marginLeft: rem(12), flex: 1 }}>
                                <Text 
                                  size="sm" 
                                  fw={600} 
                                  c={selectedIncident.status === 'resolved' ? '#22c55e' : '#667eea'}
                                >
                                  Incident Acknowledged
                                </Text>
                                <Text size="xs" c="dimmed">14:32 - System</Text>
                              </div>
                            </div>
                            
                            {/* Connector Line */}
                            <div style={{
                              flex: 1,
                              height: '2px',
                              background: selectedIncident.status === 'resolved' 
                                ? 'linear-gradient(90deg, #22c55e, #22c55e)'
                                : 'linear-gradient(90deg, #e9ecef, #e9ecef)',
                              position: 'relative'
                            }} />
                            
                            {/* Step 3: Incident Resolved */}
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <div style={{
                                width: rem(32),
                                height: rem(32),
                                borderRadius: '50%',
                                background: selectedIncident.status === 'resolved'
                                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                  : 'rgba(233, 236, 239, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid white',
                                boxShadow: selectedIncident.status === 'resolved'
                                  ? '0 2px 8px rgba(34, 197, 94, 0.3)'
                                  : '0 2px 8px rgba(0, 0, 0, 0.1)'
                              }}>
                                {selectedIncident.status === 'resolved' ? (
                                  <IconCheck size={16} style={{ color: 'white' }} />
                                ) : (
                                  <IconClock size={16} style={{ color: '#adb5bd' }} />
                                )}
                              </div>
                              <div style={{ marginLeft: rem(12), flex: 1 }}>
                                <Text 
                                  size="sm" 
                                  fw={600} 
                                  c={selectedIncident.status === 'resolved' ? '#22c55e' : '#adb5bd'}
                                >
                                  Incident Resolved
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {selectedIncident.status === 'resolved' ? '14:35 - Team Alpha' : 'Pending'}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </Stack>

                        {/* Action Buttons */}
                        <Group justify="flex-end" gap="md">
                          <Button 
                            variant="outline" 
                            size="sm"
                            radius="md"
                            onClick={() => setUpdateModalOpened(true)}
                          >
                            Update Status
                          </Button>
                          <Button 
                            size="sm"
                            radius="md"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              fontWeight: 600
                            }}
                          >
                            Resolve Incident
                          </Button>
                        </Group>
                      </Stack>
                    ) : (
                      <Stack gap="md" align="center" justify="center" style={{ height: '100%' }}>
                        <IconAlertTriangle size={48} style={{ color: '#667eea', opacity: 0.5 }} />
                        <Text size="lg" c="dimmed">Select an incident to view details</Text>
                      </Stack>
                    )}
                  </div>
                </div>
              </Stack>
            </Paper>

            {/* Add Incident Modal */}
            <Modal 
              opened={addModalOpened} 
              onClose={() => setAddModalOpened(false)} 
              title={
                <Group gap="xs">
                  <IconPlus size={20} style={{ color: '#667eea' }} />
                  <Text fw={600}>Report New Incident</Text>
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
                <TextInput
                  label="Incident Title"
                  placeholder="Enter incident title"
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
                  label="Description"
                  placeholder="Describe the incident details"
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
                <Select
                  label="Priority"
                  placeholder="Select priority level"
                  data={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ]}
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
                <TextInput
                  label="Location"
                  placeholder="Enter incident location"
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
                    onClick={() => setAddModalOpened(false)}
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
                  >
                    Report Incident
                  </Button>
                </Group>
              </Stack>
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
                <Textarea
                  label="Description"
                  placeholder="Enter the incident description"
                  size="md"
                  radius="md"
                  minRows={3}
                  value={updateDetails.description}
                  onChange={(event) => setUpdateDetails({...updateDetails, description: event.target.value})}
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
                
                <TextInput
                  label="Location"
                  placeholder="Enter incident location"
                  size="md"
                  radius="md"
                  value={updateDetails.location}
                  onChange={(event) => setUpdateDetails({...updateDetails, location: event.target.value})}
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

                <Select
                  label="Assigned To"
                  placeholder="Select team member"
                  size="md"
                  radius="md"
                  value={updateDetails.assignedTo}
                  onChange={(value) => setUpdateDetails({...updateDetails, assignedTo: value})}
                  data={[
                    { value: 'Security Team', label: 'Security Team' },
                    { value: 'Medical Team', label: 'Medical Team' },
                    { value: 'Crowd Control', label: 'Crowd Control' },
                    { value: 'Technical Support', label: 'Technical Support' },
                    { value: 'Event Coordinator', label: 'Event Coordinator' }
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

                <TextInput
                  label="Contact"
                  placeholder="Enter contact number"
                  size="md"
                  radius="md"
                  value={updateDetails.contact}
                  onChange={(event) => setUpdateDetails({...updateDetails, contact: event.target.value})}
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

                <TextInput
                  label="Email"
                  placeholder="Enter email address"
                  size="md"
                  radius="md"
                  value={updateDetails.email}
                  onChange={(event) => setUpdateDetails({...updateDetails, email: event.target.value})}
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
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default IncidentManagement;