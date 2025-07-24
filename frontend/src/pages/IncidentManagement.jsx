import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Stack, 
  AppShell, 
  ActionIcon, 
  Group, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  TextInput, 
  Select, 
  Card,
  Grid,
  SimpleGrid,
  ThemeIcon,
  rem,
  Textarea,
  Flex,
  Menu,
  Divider
} from '@mantine/core';
import { 
  IconDashboard, 
  IconCalendar, 
  IconAlertTriangle, 
  IconChartBar, 
  IconSettings, 
  IconPlus,
  IconAlertCircle,
  IconClock,
  IconInfoCircle,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye
} from '@tabler/icons-react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AppBar from '../components/AppBar';

function IncidentManagement() {
  const [opened, { toggle }] = useDisclosure();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const [modalOpened, setModalOpened] = useState(false);
  const [incidents, setIncidents] = useState([
    { 
      id: 1, 
      title: 'Server Down', 
      type: 'critical', 
      description: 'Main server is not responding', 
      status: 'Open',
      createdAt: '2024-01-20 10:30',
      assignee: 'John Doe'
    },
    { 
      id: 2, 
      title: 'Network Latency', 
      type: 'urgent', 
      description: 'High network latency in EU region', 
      status: 'In Progress',
      createdAt: '2024-01-20 09:15',
      assignee: 'Jane Smith'
    },
    { 
      id: 3, 
      title: 'Deployment Success', 
      type: 'success', 
      description: 'New version deployed successfully', 
      status: 'Closed',
      createdAt: '2024-01-20 08:00',
      assignee: 'Mike Johnson'
    },
    { 
      id: 4, 
      title: 'System Maintenance', 
      type: 'info', 
      description: 'Scheduled maintenance window', 
      status: 'Scheduled',
      createdAt: '2024-01-20 07:45',
      assignee: 'Sarah Wilson'
    },
  ]);
  const [newIncident, setNewIncident] = useState({
    title: '',
    type: '',
    description: '',
    assignee: '',
  });

  const handleMenuClick = () => {
    toggle();
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      critical: 'red',
      urgent: 'orange',
      info: 'blue',
      success: 'green'
    };
    return colors[type] || 'gray';
  };

  const getTypeIcon = (type) => {
    const icons = {
      critical: IconAlertCircle,
      urgent: IconClock,
      info: IconInfoCircle,
      success: IconCheck
    };
    return icons[type] || IconInfoCircle;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'red',
      'In Progress': 'yellow',
      'Closed': 'green',
      'Scheduled': 'blue'
    };
    return colors[status] || 'gray';
  };

  const handleAddIncident = () => {
    if (newIncident.title && newIncident.type && newIncident.description) {
      setIncidents([
        ...incidents,
        {
          id: incidents.length + 1,
          ...newIncident,
          status: 'Open',
          createdAt: new Date().toLocaleString(),
          assignee: newIncident.assignee || 'Unassigned'
        }
      ]);
      setNewIncident({ title: '', type: '', description: '', assignee: '' });
      setModalOpened(false);
    }
  };

  const getIncidentStats = () => {
    const stats = {
      total: incidents.length,
      open: incidents.filter(i => i.status === 'Open').length,
      critical: incidents.filter(i => i.type === 'critical').length,
      inProgress: incidents.filter(i => i.status === 'In Progress').length,
    };
    return stats;
  };

  const stats = getIncidentStats();

  const rows = incidents.map((incident) => {
    const TypeIcon = getTypeIcon(incident.type);
    
    return (
      <Table.Tr key={incident.id}>
        <Table.Td>
          <Group gap="sm">
            <ThemeIcon 
              color={getTypeBadgeColor(incident.type)} 
              size="sm" 
              variant="light"
            >
              <TypeIcon size={rem(14)} />
            </ThemeIcon>
            <div>
              <Text fw={500} size="sm">{incident.title}</Text>
              <Text size="xs" c="dimmed">#{incident.id}</Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge 
            color={getTypeBadgeColor(incident.type)} 
            variant="light"
            size="sm"
          >
            {incident.type}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm" lineClamp={2}>
            {incident.description}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge 
            color={getStatusColor(incident.status)} 
            variant="light"
            size="sm"
          >
            {incident.status}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{incident.assignee}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="xs" c="dimmed">{incident.createdAt}</Text>
        </Table.Td>
        <Table.Td>
          <Menu shadow="md" width={120}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconDotsVertical size={rem(12)} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>
                View Details
              </Menu.Item>
              <Menu.Item>
                Edit
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red">
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: isSmallScreen ? false : !opened }
      }}
      padding={0}
    >
      <AppShell.Header>
        <AppBar userName="Admin User" onMenuClick={handleMenuClick} opened={opened} />
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="xs">
            <ActionIcon
              variant="light"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconDashboard size={16} />}
              onClick={() => navigate('/admin/dashboard')}
            >
              <Text size="sm">Overview</Text>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconCalendar size={16} />}
              onClick={() => navigate('/admin/dashboard/command')}
            >
              <Text size="sm">Command center</Text>
            </ActionIcon>
            <ActionIcon
              variant="filled"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconAlertTriangle size={16} />}
              onClick={() => navigate('/admin/Incident-management')}
            >
              <Text size="sm">Incident management</Text>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconChartBar size={16} />}
            >
              <Text size="sm">Analytics</Text>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconSettings size={16} />}
            >
              <Text size="sm">Settings</Text>
            </ActionIcon>
          </Stack>
        </AppShell.Section>
        <AppShell.Section>
          <Text size="sm" c="dimmed">Admin Panel v1.0</Text>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Container fluid py="xl">
          <Stack gap="xl">
            <Group justify="space-between" align="center">
              <div>
                <Title order={1} mb="xs">Incident Management</Title>
                <Text c="dimmed">Monitor and manage system incidents</Text>
              </div>
              <Button 
                leftSection={<IconPlus size={16} />}
                onClick={() => setModalOpened(true)}
                size="md"
                gradient={{ from: 'blue', to: 'cyan' }}
                variant="gradient"
              >
                Add Incident
              </Button>
            </Group>

            {/* Stats Cards */}
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                      Total Incidents
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.total}
                    </Text>
                  </div>
                  <ThemeIcon color="blue" size={40} radius="md">
                    <IconAlertTriangle size={rem(24)} />
                  </ThemeIcon>
                </Group>
              </Card>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                      Open Issues
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.open}
                    </Text>
                  </div>
                  <ThemeIcon color="red" size={40} radius="md">
                    <IconAlertCircle size={rem(24)} />
                  </ThemeIcon>
                </Group>
              </Card>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                      Critical
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.critical}
                    </Text>
                  </div>
                  <ThemeIcon color="red" size={40} radius="md">
                    <IconAlertCircle size={rem(24)} />
                  </ThemeIcon>
                </Group>
              </Card>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                      In Progress
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.inProgress}
                    </Text>
                  </div>
                  <ThemeIcon color="yellow" size={40} radius="md">
                    <IconClock size={rem(24)} />
                  </ThemeIcon>
                </Group>
              </Card>
            </SimpleGrid>

            {/* Incidents Table */}
            <Paper shadow="sm" radius="md" withBorder>
              <Group p="md" justify="space-between">
                <Text fw={600} size="lg">Recent Incidents</Text>
                <Group gap="xs">
                  <Badge variant="light">Live Updates</Badge>
                </Group>
              </Group>
              <Divider />
              <div style={{ overflowX: 'auto' }}>
                <Table highlightOnHover verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Incident</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Assignee</Table.Th>
                      <Table.Th>Created</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </div>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group>
            <ThemeIcon color="blue" size="sm">
              <IconPlus size={rem(16)} />
            </ThemeIcon>
            <Text fw={600}>Add New Incident</Text>
          </Group>
        }
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Enter incident title"
            value={newIncident.title}
            onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
            required
          />
          <Select
            label="Type"
            placeholder="Select incident type"
            data={[
              { value: 'critical', label: 'Critical' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'info', label: 'Info' },
              { value: 'success', label: 'Success' },
            ]}
            value={newIncident.type}
            onChange={(value) => setNewIncident({ ...newIncident, type: value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="Enter incident description"
            value={newIncident.description}
            onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
            minRows={3}
            required
          />
          <TextInput
            label="Assignee"
            placeholder="Enter assignee name (optional)"
            value={newIncident.assignee}
            onChange={(e) => setNewIncident({ ...newIncident, assignee: e.target.value })}
          />
          <Group justify="flex-end" gap="sm">
            <Button 
              variant="light" 
              onClick={() => setModalOpened(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddIncident}
              disabled={!newIncident.title || !newIncident.type || !newIncident.description}
            >
              Add Incident
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}

export default IncidentManagement;