import { Container, Title, Text, Paper, Stack, AppShell, Group, Badge, Button, rem, Card, Grid, ActionIcon, Modal, TextInput, Select, Textarea, Timeline, Divider } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconAlertTriangle, IconClock, IconMapPin, IconUser, IconPhone, IconMail, IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconEye, IconActivity, IconShieldLock, IconReportAnalytics, IconChevronRight } from '@tabler/icons-react';
import AppBar from '../components/AppBar';
import StaffSidebar from '../components/StaffSidebar';
import { useState, useEffect } from 'react';

function StaffIncidentManagement() {
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

  // Sample incident data for staff view
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
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setViewModalOpened(true);
  };

  const handleAddIncident = () => {
    if (newIncident.title && newIncident.description) {
      const incident = {
        id: incidents.length + 1,
        ...newIncident,
        status: 'active',
        reportedBy: 'Staff Member',
        reportedAt: new Date().toLocaleString(),
        assignedTo: 'Pending Assignment',
        contact: '',
        email: '',
        updates: [
          {
            time: new Date().toLocaleTimeString(),
            action: 'Incident reported by staff',
            user: 'Staff Member'
          }
        ]
      };
      setIncidents([incident, ...incidents]);
      setNewIncident({
        title: '',
        description: '',
        priority: 'medium',
        location: ''
      });
      setAddModalOpened(false);
    }
  };

  const handleUpdateIncident = () => {
    if (selectedIncident && updateDescription) {
      const updatedIncident = {
        ...selectedIncident,
        description: updateDetails.description || selectedIncident.description,
        location: updateDetails.location || selectedIncident.location,
        assignedTo: updateDetails.assignedTo || selectedIncident.assignedTo,
        contact: updateDetails.contact || selectedIncident.contact,
        email: updateDetails.email || selectedIncident.email,
        updates: [
          ...selectedIncident.updates,
          {
            action: updateDescription,
            time: new Date().toLocaleTimeString(),
            user: 'Staff Member'
          }
        ]
      }
      setIncidents(incidents.map(inc => inc.id === selectedIncident.id ? updatedIncident : inc))
      setSelectedIncident(updatedIncident)
      setUpdateDescription('')
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
        <AppBar userName="Staff User" onMenuClick={handleMenuClick} opened={opened} />
      </AppShell.Header>
      <StaffSidebar opened={opened} />
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
                Report and track security incidents in real-time
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

              <Stack spacing="lg">
                {/* Header */}
                <Group justify="space-between" align="center">
                  <Title order={3} style={{ fontWeight: 600 }}>
                    Incident Tracking
                  </Title>
                  <Badge color="blue" variant="light">
                    {incidents.length} Incidents
                  </Badge>
                </Group>

                {/* Incident List */}
                <Stack gap="sm">
                  {incidents.map((incident) => (
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
                      <Group justify="space-between" align="flex-start">
                        <Group gap="md" align="flex-start" style={{ flex: 1 }}>
                          <div style={{ minWidth: 40 }}>
                            <Badge color={getStatusColor(incident.status)} variant="filled" size="sm">
                              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Group gap="sm" align="center">
                              <Text fw={600} size="sm" style={{ flex: 1 }}>
                                {incident.title}
                              </Text>
                              <Badge color={getPriorityColor(incident.priority)} variant="light" size="xs">
                                {incident.priority.toUpperCase()}
                              </Badge>
                            </Group>
                            
                            <Text size="sm" c="dimmed" lineClamp={2}>
                              {incident.description}
                            </Text>
                            
                            <Group gap="md" wrap="wrap">
                              <Group gap="xs">
                                <IconMapPin size={14} />
                                <Text size="xs" c="dimmed">{incident.location}</Text>
                              </Group>
                              <Group gap="xs">
                                <IconUser size={14} />
                                <Text size="xs" c="dimmed">{incident.reportedBy}</Text>
                              </Group>
                              <Group gap="xs">
                                <IconClock size={14} />
                                <Text size="xs" c="dimmed">{incident.reportedAt}</Text>
                              </Group>
                            </Group>
                          </Stack>
                        </Group>
                        
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIncident(incident);
                              setUpdateModalOpened(true);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <IconChevronRight size={16} style={{ color: '#667eea' }} />
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>

      {/* Add Incident Modal */}
      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        title="Report New Incident"
        size="lg"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Incident Title"
            placeholder="Enter incident title"
            value={newIncident.title}
            onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="Describe the incident in detail"
            value={newIncident.description}
            onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
            rows={4}
            required
          />
          <Group grow>
            <Select
              label="Priority"
              placeholder="Select priority"
              data={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
              value={newIncident.priority}
              onChange={(value) => setNewIncident({ ...newIncident, priority: value })}
            />
            <TextInput
              label="Location"
              placeholder="Enter location"
              value={newIncident.location}
              onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
            />
          </Group>
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={() => setAddModalOpened(false)}>
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
        title={selectedIncident?.title}
        size="lg"
        centered
      >
        {selectedIncident && (
          <Stack gap="lg">
            <Group gap="md">
              <Badge color={getStatusColor(selectedIncident.status)} variant="filled">
                {selectedIncident.status.charAt(0).toUpperCase() + selectedIncident.status.slice(1)}
              </Badge>
              <Badge color={getPriorityColor(selectedIncident.priority)} variant="light">
                {selectedIncident.priority.toUpperCase()}
              </Badge>
            </Group>
            
            <Text>{selectedIncident.description}</Text>
            
            <Divider />
            
            <Stack gap="sm">
              <Group gap="md">
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text size="sm" fw={500}>Location:</Text>
                  <Text size="sm">{selectedIncident.location}</Text>
                </Group>
              </Group>
              
              <Group gap="md">
                <Group gap="xs">
                  <IconUser size={16} />
                  <Text size="sm" fw={500}>Reported By:</Text>
                  <Text size="sm">{selectedIncident.reportedBy}</Text>
                </Group>
              </Group>
              
              <Group gap="md">
                <Group gap="xs">
                  <IconClock size={16} />
                  <Text size="sm" fw={500}>Reported At:</Text>
                  <Text size="sm">{selectedIncident.reportedAt}</Text>
                </Group>
              </Group>
              
              {selectedIncident.assignedTo && (
                <Group gap="md">
                  <Group gap="xs">
                    <IconShieldLock size={16} />
                    <Text size="sm" fw={500}>Assigned To:</Text>
                    <Text size="sm">{selectedIncident.assignedTo}</Text>
                  </Group>
                </Group>
              )}
              
              {selectedIncident.contact && (
                <Group gap="md">
                  <Group gap="xs">
                    <IconPhone size={16} />
                    <Text size="sm" fw={500}>Contact:</Text>
                    <Text size="sm">{selectedIncident.contact}</Text>
                  </Group>
                </Group>
              )}
              
              {selectedIncident.email && (
                <Group gap="md">
                  <Group gap="xs">
                    <IconMail size={16} />
                    <Text size="sm" fw={500}>Email:</Text>
                    <Text size="sm">{selectedIncident.email}</Text>
                  </Group>
                </Group>
              )}
            </Stack>
            
            <Divider />
            
            <Stack gap="sm">
              <Text fw={600}>Updates</Text>
              <Timeline>
                {selectedIncident.updates.map((update, index) => (
                  <Timeline.Item key={index} title={update.action}>
                    <Text size="xs" c="dimmed">
                      {update.time} by {update.user}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Stack>
            
            <Group justify="flex-end">
              <Button 
                onClick={() => {
                  setViewModalOpened(false);
                  setUpdateModalOpened(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Update Incident
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Update Incident Modal */}
      <Modal
        opened={updateModalOpened}
        onClose={() => setUpdateModalOpened(false)}
        title="Update Incident"
        size="lg"
        centered
      >
        {selectedIncident && (
          <Stack gap="md">
            <Textarea
              label="Update Description"
              placeholder="Describe the update or action taken"
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              rows={3}
              required
            />
            
            <Divider />
            
            <Text size="sm" fw={500} c="dimmed">Optional: Update incident details</Text>
            
            <TextInput
              label="Description"
              placeholder="Update incident description"
              value={updateDetails.description}
              onChange={(e) => setUpdateDetails({ ...updateDetails, description: e.target.value })}
            />
            
            <TextInput
              label="Location"
              placeholder="Update location"
              value={updateDetails.location}
              onChange={(e) => setUpdateDetails({ ...updateDetails, location: e.target.value })}
            />
            
            <TextInput
              label="Assigned To"
              placeholder="Update assignment"
              value={updateDetails.assignedTo}
              onChange={(e) => setUpdateDetails({ ...updateDetails, assignedTo: e.target.value })}
            />
            
            <Group grow>
              <TextInput
                label="Contact"
                placeholder="Update contact"
                value={updateDetails.contact}
                onChange={(e) => setUpdateDetails({ ...updateDetails, contact: e.target.value })}
              />
              <TextInput
                label="Email"
                placeholder="Update email"
                value={updateDetails.email}
                onChange={(e) => setUpdateDetails({ ...updateDetails, email: e.target.value })}
              />
            </Group>
            
            <Group justify="flex-end" gap="sm">
              <Button variant="light" onClick={() => setUpdateModalOpened(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateIncident}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Update Incident
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </AppShell>
  );
}

export default StaffIncidentManagement; 