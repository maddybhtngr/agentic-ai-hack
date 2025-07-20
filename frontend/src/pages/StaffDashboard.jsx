import { Container, Title, Text, Paper, Stack, AppShell } from '@mantine/core'
import AppBar from '../components/AppBar'

function StaffDashboard() {
  const handleMenuClick = () => {
    console.log('Staff menu clicked')
    // Add your menu logic here
  }

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <AppBar 
          userName="Staff User" 
          onMenuClick={handleMenuClick}
        />
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="xl">
          <Stack spacing="xl">
            <Title order={1}>Staff Dashboard</Title>
            
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Text c="dimmed" ta="center" size="lg">
                Staff Dashboard Content
              </Text>
              <Text c="dimmed" ta="center" size="sm" mt="md">
                This dashboard will contain staff-specific features and tools.
              </Text>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default StaffDashboard 