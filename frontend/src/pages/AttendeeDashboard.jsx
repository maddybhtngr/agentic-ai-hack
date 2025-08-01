import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge } from '@mantine/core'
import { 
  IconUsers,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconAlertTriangle,
  IconMapPin,
  IconClock,
  IconTicket
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import AppBar from '../components/AppBar'
import AttendeeSidebar from '../components/AttendeeSidebar'
import CrowdHeatMap from '../components/CrowdHeatMap'
import FloatingAssistant from '../components/FloatingAssistant'
import { authUtils } from '../services/api'
import { apiService } from '../services/api'
import { useState, useEffect } from 'react'

function AttendeeDashboard() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current user data
  const currentUser = authUtils.getCurrentUser();
  const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Attendee User';

  // State for Quick Stats
  const [quickStats, setQuickStats] = useState({
    totalZones: 0,
    safeZones: 0,
    busyZones: 0,
    avoidZones: 0
  });
  const [isLoadingQuickStats, setIsLoadingQuickStats] = useState(false);

  const handleMenuClick = () => {
    toggle();
    console.log('Attendee menu clicked')
  }

  const statCards = [
    {
      title: 'Event Capacity',
      value: '12,847',
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Current Attendees',
      value: '8,432',
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Entry Rate',
      value: '156/min',
      icon: IconTrendingUp,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Exit Rate',
      value: '89/min',
      icon: IconTrendingDown,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Current Capacity',
      value: '65%',
      icon: IconActivity,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Incidents',
      value: '2',
      icon: IconAlertTriangle,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Total Zones',
      value: '12',
      icon: IconMapPin,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Event Duration',
      value: '4h 23m',
      icon: IconClock,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  ];

  // Function to fetch and calculate quick stats
  const fetchQuickStats = async () => {
    setIsLoadingQuickStats(true);
    try {
      const [zones, crowdDetails, incidents] = await Promise.all([
        apiService.getAllZones(),
        apiService.getAllZonesCrowdDetails(),
        apiService.getAllIncidents()
      ]);
      const crowdMap = Object.fromEntries(crowdDetails.zones.map(z => [z.zoneId, z.count]));
      const incidentsData = incidents.data || incidents;
      // Avoid Zones: zones with Critical Incidents
      const avoidZoneIds = new Set();
      incidentsData.forEach(incident => {
        if (incident.incident_priority === 'CRITICAL' && incident.status !== 'RESOLVED') {
          if (incident.zone_id) {
            avoidZoneIds.add(incident.zone_id);
          }
        }
      });
      // Busy Zones: crowd > 60% capacity
      const busyZones = zones.filter(zone => {
        const count = crowdMap[zone.id] || 0;
        return (count / zone.maxCapacity) > 0.6;
      }).length;
      // Safe Zones: not busy and not avoid
      const safeZones = zones.filter(zone => {
        const count = crowdMap[zone.id] || 0;
        return (count / zone.maxCapacity) <= 0.6 && !avoidZoneIds.has(zone.id);
      }).length;
      setQuickStats({
        totalZones: zones.length,
        safeZones,
        busyZones,
        avoidZones: avoidZoneIds.size
      });
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setIsLoadingQuickStats(false);
    }
  };

  // Fetch quick stats on component mount
  useEffect(() => {
    fetchQuickStats();
  }, []);
  // Set up 10-second polling interval for quick stats
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuickStats();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

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

      <AttendeeSidebar opened={opened} />

      <AppShell.Main>
        <Container size="100%" py="xl" px="xl">
          <Stack spacing="xl">
            {/* Header Section */}
            <Stack spacing="xs">
              <Group gap="xs">
                <IconTicket size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Attendee Dashboard
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Welcome to the event! Monitor crowd levels and stay informed
              </Text>
            </Stack>
            
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

            {/* Crowd Heat Map */}
            <Paper 
              shadow="xl" 
              p="xl" 
              radius="xl" 
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

              <Stack spacing="xl">
                {/* Header Section */}
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
                      <Title order={3} style={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Real-time Crowd Monitoring
                      </Title>
                      <Text size="sm" c="dimmed">
                        Real-time crowd density across all event zones
                      </Text>
                    </Stack>
                  </Group>
                  
                  {/* Live Status */}
                  <Badge
                    color="red"
                    variant="filled"
                    size="lg"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      background: 'rgba(239, 68, 68, 0.9)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: `${rem(8)} ${rem(16)}`,
                      fontSize: rem(14),
                      fontWeight: 600,
                      minWidth: rem(80)
                    }}
                    leftSection={
                      <span style={{ 
                        display: 'inline-block', 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        background: 'white',
                        animation: 'pulse 2s infinite'
                      }} />
                    }
                  >
                    LIVE
                  </Badge>
                </Group>

                {/* Quick Stats */}
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius="md" withBorder style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      <Stack gap="xs" align="center">
                        <Text size="xl" fw={700} style={{ color: '#667eea' }}>
                          {isLoadingQuickStats ? '...' : quickStats.totalZones}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">Total Zones</Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius="md" withBorder style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      <Stack gap="xs" align="center">
                        <Text size="xl" fw={700} style={{ color: '#22c55e' }}>
                          {isLoadingQuickStats ? '...' : quickStats.safeZones}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">Safe Zones</Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius="md" withBorder style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      <Stack gap="xs" align="center">
                        <Text size="xl" fw={700} style={{ color: '#f59e0b' }}>
                          {isLoadingQuickStats ? '...' : quickStats.busyZones}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">Busy Zones</Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius="md" withBorder style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      <Stack gap="xs" align="center">
                        <Text size="xl" fw={700} style={{ color: '#ef4444' }}>
                          {isLoadingQuickStats ? '...' : quickStats.avoidZones}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">Avoid Zones</Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                </Grid>

                {/* Heat Map Component */}
                <CrowdHeatMap showZoneManagement={false} updateInterval={10000} />
              </Stack>
            </Paper>
          </Stack>
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
  );
}

export default AttendeeDashboard; 