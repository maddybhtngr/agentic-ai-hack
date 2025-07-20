import { Container, Title, Text, Paper, Stack, AppShell, ActionIcon, Grid } from '@mantine/core'
import { IconDashboard, IconUsers, IconCalendar, IconChartBar, IconSettings } from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import AppBar from '../components/AppBar'
import CrowdHeatMap from '../components/CrowdHeatMap'

function AdminDashboard() {
  const [opened, { toggle }] = useDisclosure();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const handleMenuClick = () => {
    toggle();
    console.log('Admin menu clicked')
    // Add your menu logic here
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
    >
      <AppShell.Header>
        <AppBar 
          userName="Admin User" 
          onMenuClick={handleMenuClick}
          opened={opened}
        />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="xs">
            <ActionIcon
              variant="light"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconDashboard size={16} />}
            >
              <Text size="sm">Overview</Text>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconCalendar size={16} />}
            >
              <Text size="sm">Events</Text>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconUsers size={16} />}
            >
              <Text size="sm">Users</Text>
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
        <Container size="100%" py="xl">
          <Stack spacing="xl">
            <Title order={1}>Admin Dashboard</Title>
            
            {/* Score Cards - Always Visible */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper 
                  shadow="md" 
                  p="lg" 
                  radius="lg" 
                  withBorder
                  style={{
                    background: 'var(--mantine-color-blue-6)',
                    border: 'none'
                  }}
                >
                  <Stack gap="xs" align="center" ta="center">
                    <Text size="sm" c="white" tt="uppercase" fw={500} opacity={0.9}>
                      Volunteers
                    </Text>
                    <Text size="2xl" fw={700} c="white">
                      156
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper 
                  shadow="md" 
                  p="lg" 
                  radius="lg" 
                  withBorder
                  style={{
                    background: 'var(--mantine-color-blue-6)',
                    border: 'none'
                  }}
                >
                  <Stack gap="xs" align="center" ta="center">
                    <Text size="sm" c="white" tt="uppercase" fw={500} opacity={0.9}>
                      Guests
                    </Text>
                    <Text size="2xl" fw={700} c="white">
                      2,847
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper 
                  shadow="md" 
                  p="lg" 
                  radius="lg" 
                  withBorder
                  style={{
                    background: 'var(--mantine-color-blue-6)',
                    border: 'none'
                  }}
                >
                  <Stack gap="xs" align="center" ta="center">
                    <Text size="sm" c="white" tt="uppercase" fw={500} opacity={0.9}>
                      Incidents
                    </Text>
                    <Text size="2xl" fw={700} c="white">
                      3
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper 
                  shadow="md" 
                  p="lg" 
                  radius="lg" 
                  withBorder
                  style={{
                    background: 'var(--mantine-color-blue-6)',
                    border: 'none'
                  }}
                >
                  <Stack gap="xs" align="center" ta="center">
                    <Text size="sm" c="white" tt="uppercase" fw={500} opacity={0.9}>
                      Alerts
                    </Text>
                    <Text size="2xl" fw={700} c="white">
                      7
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper 
                  shadow="md" 
                  p="lg" 
                  radius="lg" 
                  withBorder
                  style={{
                    background: 'var(--mantine-color-blue-6)',
                    border: 'none'
                  }}
                >
                  <Stack gap="xs" align="center" ta="center">
                    <Text size="sm" c="white" tt="uppercase" fw={500} opacity={0.9}>
                      Current Capacity
                    </Text>
                    <Text size="2xl" fw={700} c="white">
                      56%
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper 
                  shadow="md" 
                  p="lg" 
                  radius="lg" 
                  withBorder
                  style={{
                    background: 'var(--mantine-color-blue-6)',
                    border: 'none'
                  }}
                >
                  <Stack gap="xs" align="center" ta="center">
                    <Text size="sm" c="white" tt="uppercase" fw={500} opacity={0.9}>
                      Entry Rate
                    </Text>
                    <Text size="2xl" fw={700} c="white">
                      45/min
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper 
                  shadow="md" 
                  p="lg" 
                  radius="lg" 
                  withBorder
                  style={{
                    background: 'var(--mantine-color-blue-6)',
                    border: 'none'
                  }}
                >
                  <Stack gap="xs" align="center" ta="center">
                    <Text size="sm" c="white" tt="uppercase" fw={500} opacity={0.9}>
                      Exit Rate
                    </Text>
                    <Text size="2xl" fw={700} c="white">
                      23/min
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                <Paper 
                  shadow="md" 
                  p="lg" 
                  radius="lg" 
                  withBorder
                  style={{
                    background: 'var(--mantine-color-blue-6)',
                    border: 'none'
                  }}
                >
                  <Stack gap="xs" align="center" ta="center">
                    <Text size="sm" c="white" tt="uppercase" fw={500} opacity={0.9}>
                      Security Staff
                    </Text>
                    <Text size="2xl" fw={700} c="white">
                      28
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Crowd Heat Map */}
            <CrowdHeatMap updateInterval={30000} />
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default AdminDashboard 