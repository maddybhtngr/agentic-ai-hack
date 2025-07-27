import { useState, useEffect } from 'react'
import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Badge, Avatar, LoadingOverlay } from '@mantine/core'
import { 
  IconUser,
  IconMapPin,
  IconPhone,
  IconMail,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import AppBar from '../components/AppBar'
import StaffSidebar from '../components/StaffSidebar'
import FloatingAssistant from '../components/FloatingAssistant'
import { apiService, authUtils } from '../services/api'

function StaffDetails() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [staffMember, setStaffMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleMenuClick = () => {
    toggle();
  }

  // Get current user from localStorage
  const currentUser = authUtils.getCurrentUser();
  const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Staff User';

  // Debug: Log current user data
  console.log('Current user from localStorage:', currentUser);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      if (!currentUser?.username) {
        setError('No user logged in');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getUserDetails(currentUser.username);
        if (response.success) {
          setStaffMember(response.data);
        } else {
          setError('Failed to fetch staff details');
        }
      } catch (err) {
        console.error('Error fetching staff details:', err);
        setError('Failed to load staff details');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [currentUser?.username]);

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
          userName={userName} 
          onMenuClick={handleMenuClick}
          opened={opened}
        />
      </AppShell.Header>

      <StaffSidebar opened={opened} />

      <AppShell.Main>
        <Container size="100%" py="xl" px="xl" style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          
          {error && (
            <Paper p="md" radius="md" style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)' }}>
              <Text c="red" ta="center">{error}</Text>
            </Paper>
          )}

          {staffMember && (
            <Stack spacing="xl">
            {/* Header Section */}
            <Stack spacing="xs">
              <Group gap="xs">
                <IconUser size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Staff Details
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Personal information, zone assignments, and work details
              </Text>
            </Stack>

            {/* Profile Overview */}
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
                      <IconUser size={24} style={{ color: 'white' }} />
                    </div>
                    <Stack gap="xs">
                      <Title order={3} style={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Profile Overview
                      </Title>
                      <Text size="sm" c="dimmed">
                        Personal information and work details
                      </Text>
                    </Stack>
                  </Group>

                  <Grid gutter="xl">
                    {/* Profile Photo */}
                    <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Stack gap="lg" align="center">
                      <Avatar 
                        size={240} 
                        radius="xl"
                        src={staffMember.profile_photo ? `https://backend-service-178028895966.us-central1.run.app/static/${staffMember.profile_photo.replace('data/', '')}` : undefined}
                        color={staffMember.role?.toLowerCase() === 'security' ? 'blue' : 'green'}
                        style={{
                          border: '4px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {staffMember.first_name?.[0] || 'S'}{staffMember.last_name?.[0] || 'T'}
                      </Avatar>
                      
                      <Stack gap="xs" align="center">
                        <Text size="xl" fw={700} ta="center">{staffMember.first_name} {staffMember.last_name}</Text>
                        <Badge 
                          color={staffMember.role?.toLowerCase() === 'security' ? 'blue' : 'green'}
                          variant="light"
                          size="md"
                          leftSection={<IconCheck size={12} />}
                        >
                          {staffMember.role || 'Staff Member'}
                        </Badge>
                      </Stack>
                    </Stack>
                  </Grid.Col>

                  {/* Staff Details */}
                  <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Stack gap="lg">
                      {/* Personal Information */}
                      <Paper 
                        shadow="sm" 
                        p="lg" 
                        radius="md" 
                        withBorder
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Stack gap="md">
                          <Text fw={600} size="lg" style={{ color: '#667eea' }}>Personal Information</Text>
                          
                          <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconMail size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Email:</Text>
                                  <Text size="sm">{staffMember.email || 'N/A'}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconPhone size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Phone:</Text>
                                  <Text size="sm">{staffMember.phone || 'N/A'}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                            
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconMapPin size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Current Zone:</Text>
                                  <Text size="sm">{staffMember.current_zone || 'N/A'}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconMapPin size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Address:</Text>
                                  <Text size="sm">{staffMember.address || 'N/A'}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                          </Grid>
                        </Stack>
                      </Paper>


                    </Stack>
                  </Grid.Col>
                </Grid>
                </Stack>
            </Paper>
          </Stack>
          )}
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
  );
}

export default StaffDetails; 