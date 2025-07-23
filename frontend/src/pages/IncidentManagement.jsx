import { Container, Title, Text, Paper, Stack, AppShell, ActionIcon, Group } from '@mantine/core';
import { IconDashboard, IconCalendar, IconAlertTriangle, IconChartBar, IconSettings } from '@tabler/icons-react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import AppBar from '../components/AppBar';

function IncidentManagement() {
  const [opened, { toggle }] = useDisclosure();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  const handleMenuClick = () => {
    toggle();
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
              variant="subtle"
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
        <Container size="lg" py="xl">
          <Stack spacing="xl">
            <Title order={1}>Incident Management</Title>
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Text c="dimmed" ta="center" size="lg">
                Incident Management Content (placeholder)
              </Text>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default IncidentManagement; 