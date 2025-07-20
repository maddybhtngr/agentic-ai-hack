import { Container, Title, Text, Paper, Stack, AppShell } from '@mantine/core'
import AppBar from '../components/AppBar'

function AttendeeDashboard() {
  const handleMenuClick = () => {
    console.log('Attendee menu clicked')
    // Add your menu logic here
  }

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <AppBar 
          userName="Attendee User" 
          onMenuClick={handleMenuClick}
        />
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="xl">
          <Stack spacing="xl">
            <Title order={1}>Attendee Dashboard</Title>
            
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Text c="dimmed" ta="center" size="lg">
                Attendee Dashboard Content
              </Text>
              <Text c="dimmed" ta="center" size="sm" mt="md">
                This dashboard will contain attendee-specific features and information.
              </Text>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default AttendeeDashboard 