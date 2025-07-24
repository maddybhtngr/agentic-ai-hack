import { useState } from 'react'
import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Button, Modal, TextInput, Textarea, Select, ActionIcon } from '@mantine/core'
import { 
  IconAlertTriangle,
  IconPlus,
  IconEdit,
  IconEye,
  IconClock,
  IconCheck,
  IconX,
  IconMapPin,
  IconUser
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import AppBar from '../components/AppBar'
import AttendeeSidebar from '../components/AttendeeSidebar'
import FloatingAssistant from '../components/FloatingAssistant'

function AttendeeIncidentManagement() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [reportModalOpened, { open: openReportModal, close: closeReportModal }] = useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleMenuClick = () => {
    toggle();
    console.log('Attendee menu clicked')
  }

  const [incidents, setIncidents] = useState([
    {
      id: 1,
      title: 'Medical Emergency',
      description: 'Someone fainted near the main stage',
      status: 'Active',
      priority: 'High',
      location: 'Zone A - Main Stage',
      reportedBy: 'John Doe',
      reportedAt: '2024-12-15 14:30',
      assignedTo: 'Medical Team',
      contact: '+1 (555) 123-4567',
      email: 'medical@event.com',
      updates: [
        { time: '14:30', message: 'Incident reported', status: 'Reported' },
        { time: '14:32', message: 'Medical team dispatched', status: 'Responding' },
        { time: '14:35', message: 'Patient stabilized', status: 'Active' }
      ]
    },
    {
      id: 2,
      title: 'Lost Child',
      description: 'Child separated from parents in food court area',
      status: 'Investigating',
      priority: 'Medium',
      location: 'Zone C - Food Court',
      reportedBy: 'Sarah Johnson',
      reportedAt: '2024-12-15 13:45',
      assignedTo: 'Security Team',
      contact: '+1 (555) 987-6543',
      email: 'security@event.com',
      updates: [
        { time: '13:45', message: 'Incident reported', status: 'Reported' },
        { time: '13:47', message: 'Security team searching area', status: 'Investigating' }
      ]
    }
  ]);

  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    priority: '',
    location: ''
  });

  const statCards = [
    {
      title: 'My Reports',
      value: '2',
      icon: IconAlertTriangle,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active',
      value: '1',
      icon: IconClock,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Investigating',
      value: '1',
      icon: IconEdit,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Resolved',
      value: '0',
      icon: IconCheck,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  ];

  const handleReportIncident = () => {
    const newIncident = {
      id: incidents.length + 1,
      ...reportForm,
      status: 'Active',
      reportedBy: 'Current User',
      reportedAt: new Date().toLocaleString(),
      assignedTo: 'Security Team',
      contact: '+1 (555) 123-4567',
      email: 'security@event.com',
      updates: [
        { time: new Date().toLocaleTimeString(), message: 'Incident reported', status: 'Reported' }
      ]
    };
    setIncidents([newIncident, ...incidents]);
    setReportForm({ title: '', description: '', priority: '', location: '' });
    closeReportModal();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'red';
      case 'Investigating': return 'yellow';
      case 'Resolved': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'red';
      case 'Medium': return 'yellow';
      case 'Low': return 'green';
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
                      Report any safety concerns or incidents you witness
                    </Text>
                  </Stack>
                </Group>
                
                <Button 
                  size="md"
                  radius="md"
                  leftSection={<IconPlus size={16} />} 
                  onClick={openReportModal}
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

            {/* My Incidents List */}
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
                      My Reported Incidents
                    </Title>
                    <Text size="sm" c="dimmed">
                      Track the status of incidents you've reported
                    </Text>
                  </Stack>
                </Group>

                <Stack gap="md">
                  {incidents.map((incident) => (
                    <Paper 
                      key={incident.id}
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
                            <Text fw={600} size="lg">{incident.title}</Text>
                            <Badge 
                              color={getStatusColor(incident.status)} 
                              variant="light"
                              size="sm"
                            >
                              {incident.status}
                            </Badge>
                            <Badge 
                              color={getPriorityColor(incident.priority)} 
                              variant="light"
                              size="sm"
                            >
                              {incident.priority} Priority
                            </Badge>
                          </Group>
                          
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {incident.description}
                          </Text>
                          
                          <Group gap="lg">
                            <Group gap="xs">
                              <IconMapPin size={14} style={{ color: '#667eea' }} />
                              <Text size="xs" c="dimmed">{incident.location}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconClock size={14} style={{ color: '#667eea' }} />
                              <Text size="xs" c="dimmed">{incident.reportedAt}</Text>
                            </Group>
                          </Group>
                        </Stack>
                        
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            size="md"
                            onClick={() => {
                              setSelectedIncident(incident);
                              openViewModal();
                            }}
                            style={{ color: '#667eea' }}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
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

      {/* Report Incident Modal */}
      <Modal 
        opened={reportModalOpened} 
        onClose={closeReportModal}
        title="Report New Incident"
        size="lg"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Incident Title"
            placeholder="Brief description of the incident"
            value={reportForm.title}
            onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Detailed description of what happened"
            value={reportForm.description}
            onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
            rows={4}
            required
          />
          
          <Select
            label="Priority"
            placeholder="Select priority level"
            data={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' }
            ]}
            value={reportForm.priority}
            onChange={(value) => setReportForm({ ...reportForm, priority: value })}
            required
          />
          
          <TextInput
            label="Location"
            placeholder="Where did this happen?"
            value={reportForm.location}
            onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
            required
          />
          
          <Group justify="flex-end" gap="md">
            <Button variant="light" onClick={closeReportModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleReportIncident}
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
        onClose={closeViewModal}
        title={selectedIncident?.title}
        size="lg"
        centered
      >
        {selectedIncident && (
          <Stack gap="lg">
            <Stack gap="xs">
              <Group gap="md">
                <Badge 
                  color={getStatusColor(selectedIncident.status)} 
                  variant="light"
                  size="lg"
                >
                  {selectedIncident.status}
                </Badge>
                <Badge 
                  color={getPriorityColor(selectedIncident.priority)} 
                  variant="light"
                  size="lg"
                >
                  {selectedIncident.priority} Priority
                </Badge>
              </Group>
              
              <Text size="sm">{selectedIncident.description}</Text>
            </Stack>
            
            <Stack gap="sm">
              <Group gap="xs">
                <IconMapPin size={16} style={{ color: '#667eea' }} />
                <Text size="sm" fw={500}>Location:</Text>
                <Text size="sm">{selectedIncident.location}</Text>
              </Group>
              
              <Group gap="xs">
                <IconUser size={16} style={{ color: '#667eea' }} />
                <Text size="sm" fw={500}>Reported by:</Text>
                <Text size="sm">{selectedIncident.reportedBy}</Text>
              </Group>
              
              <Group gap="xs">
                <IconClock size={16} style={{ color: '#667eea' }} />
                <Text size="sm" fw={500}>Reported at:</Text>
                <Text size="sm">{selectedIncident.reportedAt}</Text>
              </Group>
              
              <Group gap="xs">
                <IconUser size={16} style={{ color: '#667eea' }} />
                <Text size="sm" fw={500}>Assigned to:</Text>
                <Text size="sm">{selectedIncident.assignedTo}</Text>
              </Group>
              
              <Group gap="xs">
                <IconUser size={16} style={{ color: '#667eea' }} />
                <Text size="sm" fw={500}>Contact:</Text>
                <Text size="sm">{selectedIncident.contact}</Text>
              </Group>
              
              <Group gap="xs">
                <IconUser size={16} style={{ color: '#667eea' }} />
                <Text size="sm" fw={500}>Email:</Text>
                <Text size="sm">{selectedIncident.email}</Text>
              </Group>
            </Stack>
            
            <Stack gap="sm">
              <Text size="sm" fw={600}>Updates:</Text>
              {selectedIncident.updates.map((update, index) => (
                <Group key={index} gap="xs">
                  <IconClock size={14} style={{ color: '#667eea' }} />
                  <Text size="xs" c="dimmed">{update.time}</Text>
                  <Text size="sm">{update.message}</Text>
                  <Badge 
                    color={getStatusColor(update.status)} 
                    variant="light"
                    size="xs"
                  >
                    {update.status}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Stack>
        )}
      </Modal>
      <FloatingAssistant />
    </AppShell>
  );
}

export default AttendeeIncidentManagement; 