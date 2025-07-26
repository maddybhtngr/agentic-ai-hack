import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge } from '@mantine/core'
import { 
  IconShieldLock,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconUsers,
  IconAlertTriangle
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useState, useEffect } from 'react'
import AppBar from '../components/AppBar'
import Sidebar from '../components/Sidebar'
import CrowdHeatMap from '../components/CrowdHeatMap'
import FloatingAssistant from '../components/FloatingAssistant'
import { apiService } from '../services/api'

function AdminDashboard() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [totalAttendees, setTotalAttendees] = useState('0');
  const [currentCapacity, setCurrentCapacity] = useState('0%');
  const [totalZones, setTotalZones] = useState('0');
  const [activeVolunteers, setActiveVolunteers] = useState('0');
  const [securityStaff, setSecurityStaff] = useState('0');
  const [activeIncidents, setActiveIncidents] = useState('0');
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastStaffUpdated, setLastStaffUpdated] = useState(null);
  const [lastIncidentsUpdated, setLastIncidentsUpdated] = useState(null);
  const [entryAvgWindow, setEntryAvgWindow] = useState([null, null]); // [prev, curr]
  const [exitAvgWindow, setExitAvgWindow] = useState([null, null]); // [prev, curr]
  const [entryRate, setEntryRate] = useState('0/min');
  const [exitRate, setExitRate] = useState('0/min');
  const [lastEntryExitUpdated, setLastEntryExitUpdated] = useState(null);
  const [quickStats, setQuickStats] = useState({
    totalZones: 0,
    activeZones: 0,
    highDensity: 0,
    critical: 0
  });
  const [isLoadingQuickStats, setIsLoadingQuickStats] = useState(false);
  const ENTRY_EXIT_POLL_INTERVAL = 30000; // 30 seconds

  const handleMenuClick = () => {
    toggle();
    console.log('Admin menu clicked')
  }

  // Function to fetch crowd details and calculate total attendees and capacity
  const fetchTotalAttendees = async () => {
    setIsLoadingAttendees(true);
    try {
      const crowdDetails = await apiService.getAllZonesCrowdDetails();
      const total = crowdDetails.zones.reduce((sum, zone) => sum + zone.count, 0);
      const totalCapacity = crowdDetails.zones.reduce((sum, zone) => sum + zone.maxCapacity, 0);
      
      setTotalAttendees(total.toLocaleString());
      setCurrentCapacity(`${Math.round((total / totalCapacity) * 100)}%`);
      setTotalZones(crowdDetails.totalZones.toString());
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching crowd details:', error);
      setTotalAttendees('Error');
      setCurrentCapacity('Error');
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  // Function to fetch staff data and calculate counts
  const fetchStaffData = async () => {
    setIsLoadingStaff(true);
    try {
      const staffResponse = await apiService.getAllStaff();
      if (staffResponse.success) {
        const staffData = staffResponse.data;
        
        // Count active volunteers (staff with role "Volunteer" and status "active")
        const volunteers = staffData.filter(staff => 
          staff.role?.toLowerCase() === 'volunteer' && staff.status === 'active'
        );
        
        // Count security staff (staff with role "Security" and status "active")
        const security = staffData.filter(staff => 
          staff.role?.toLowerCase() === 'security' && staff.status === 'active'
        );
        
        setActiveVolunteers(volunteers.length.toString());
        setSecurityStaff(security.length.toString());
        setLastStaffUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
      setActiveVolunteers('Error');
      setSecurityStaff('Error');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  // Function to fetch incident data and get active incidents count
  const fetchIncidentData = async () => {
    setIsLoadingIncidents(true);
    try {
      const incidentStats = await apiService.getIncidentStats();
      if (incidentStats.success) {
        const stats = incidentStats.data;
        // Active incidents are those that are assigned (being worked on)
        setActiveIncidents(stats.assigned_count.toString());
        setLastIncidentsUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching incident data:', error);
      setActiveIncidents('Error');
    } finally {
      setIsLoadingIncidents(false);
    }
  };

  // Function to fetch and update entry/exit rates
  const fetchEntryExitRates = async () => {
    try {
      const [zones, crowdDetails] = await Promise.all([
        apiService.getAllZones(),
        apiService.getAllZonesCrowdDetails()
      ]);
      const entranceZones = zones.filter(z => z.zoneType && z.zoneType.toLowerCase() === 'entrance');
      const exitZones = zones.filter(z => z.zoneType && z.zoneType.toLowerCase() === 'exit');
      const crowdMap = Object.fromEntries(crowdDetails.zones.map(z => [z.zoneId, z.count]));
      // Calculate averages
      const entranceAvg = entranceZones.length > 0 ?
        entranceZones.reduce((sum, z) => sum + (crowdMap[z.id] || 0), 0) / entranceZones.length : 0;
      const exitAvg = exitZones.length > 0 ?
        exitZones.reduce((sum, z) => sum + (crowdMap[z.id] || 0), 0) / exitZones.length : 0;
      // Sliding window update
      setEntryAvgWindow(([prev, curr]) => [curr, entranceAvg]);
      setExitAvgWindow(([prev, curr]) => [curr, exitAvg]);
      setLastEntryExitUpdated(new Date());
    } catch (error) {
      console.error('Error fetching entry/exit rates:', error);
      setEntryRate('Error');
      setExitRate('Error');
    }
  };

  // Calculate rates when window updates
  useEffect(() => {
    const [prev, curr] = entryAvgWindow;
    if (prev !== null && curr !== null) {
      // Rate per minute
      const rate = ((curr - prev) / (ENTRY_EXIT_POLL_INTERVAL / 60000));
      setEntryRate(`${Math.round(rate)}/min`);
    }
  }, [entryAvgWindow]);

  useEffect(() => {
    const [prev, curr] = exitAvgWindow;
    if (prev !== null && curr !== null) {
      // Rate per minute
      const rate = ((curr - prev) / (ENTRY_EXIT_POLL_INTERVAL / 60000));
      setExitRate(`${Math.round(rate)}/min`);
    }
  }, [exitAvgWindow]);

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
      
      // Calculate stats
      const totalZones = zones.length;
      
      // High Density: zones with crowd > 60% capacity
      const highDensity = zones.filter(zone => {
        const count = crowdMap[zone.id] || 0;
        return (count / zone.maxCapacity) > 0.6;
      }).length;
      
      // Active Zones: zones that have breached 100% capacity
      const activeZones = zones.filter(zone => {
        const count = crowdMap[zone.id] || 0;
        return (count / zone.maxCapacity) >= 1.0;
      }).length;
      
      // Critical: zones with Critical Incidents
      const criticalIncidentZones = new Set();
      incidentsData.forEach(incident => {
        if (incident.incident_priority === 'CRITICAL' && incident.status !== 'RESOLVED') {
          if (incident.zone_id) {
            criticalIncidentZones.add(incident.zone_id);
          }
        }
      });
      const critical = criticalIncidentZones.size;
      
      setQuickStats({
        totalZones,
        activeZones,
        highDensity,
        critical
      });
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setIsLoadingQuickStats(false);
    }
  };

  // Poll for entry/exit rates
  useEffect(() => {
    fetchEntryExitRates(); // initial
    const interval = setInterval(fetchEntryExitRates, ENTRY_EXIT_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchTotalAttendees();
    fetchStaffData();
    fetchIncidentData();
    fetchQuickStats();
  }, []);

  // Set up 10-second polling interval for crowd data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTotalAttendees();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Set up 10-second polling interval for staff data (less frequent since staff changes less often)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStaffData();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Set up 10-second polling interval for incident data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchIncidentData();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Set up 10-second polling interval for quick stats
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuickStats();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Attendees',
      value: isLoadingAttendees ? 'Loading...' : totalAttendees,
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Volunteers',
      value: isLoadingStaff ? 'Loading...' : activeVolunteers,
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Security Staff',
      value: isLoadingStaff ? 'Loading...' : securityStaff,
      icon: IconShieldLock,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Incidents',
      value: isLoadingIncidents ? 'Loading...' : activeIncidents,
      icon: IconAlertTriangle,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Current Capacity',
      value: isLoadingAttendees ? 'Loading...' : currentCapacity,
      icon: IconActivity,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Entry Rate',
      value: entryRate,
      icon: IconTrendingUp,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Exit Rate',
      value: exitRate,
      icon: IconTrendingDown,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Total Zones',
      value: isLoadingAttendees ? 'Loading...' : totalZones,
      icon: IconActivity,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  ];

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
          userName="Admin User" 
          onMenuClick={handleMenuClick}
          opened={opened}
        />
      </AppShell.Header>

      <Sidebar opened={opened} />

      <AppShell.Main>
        <Container size="100%" py="xl" px="xl">
          <Stack spacing="xl">
            {/* Header Section */}
            <Stack spacing="xs">
              <Group gap="xs">
                <IconShieldLock size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Admin Dashboard
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Monitor and manage event security in real-time
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
                    
                    {/* Loading indicator for Total Attendees */}
                    {card.title === 'Total Attendees' && isLoadingAttendees && (
                      <Badge 
                        size="xs" 
                        color="blue" 
                        variant="light" 
                        style={{ marginTop: rem(8) }}
                      >
                        Updating...
                      </Badge>
                    )}
                    
                    {/* Last updated timestamp for Total Attendees */}
                    {card.title === 'Total Attendees' && lastUpdated && !isLoadingAttendees && (
                      <Text size="xs" c="dimmed" style={{ marginTop: rem(4) }}>
                        Updated: {lastUpdated.toLocaleTimeString()}
                      </Text>
                    )}
                    
                    {/* Last updated timestamp for Current Capacity */}
                    {card.title === 'Current Capacity' && lastUpdated && !isLoadingAttendees && (
                      <Text size="xs" c="dimmed" style={{ marginTop: rem(4) }}>
                        Updated: {lastUpdated.toLocaleTimeString()}
                      </Text>
                    )}
                    
                    {/* Last updated timestamp for Total Zones */}
                    {card.title === 'Total Zones' && lastUpdated && !isLoadingAttendees && (
                      <Text size="xs" c="dimmed" style={{ marginTop: rem(4) }}>
                        Updated: {lastUpdated.toLocaleTimeString()}
                      </Text>
                    )}
                    
                    {/* Last updated timestamp for staff cards */}
                    {(card.title === 'Active Volunteers' || card.title === 'Security Staff') && lastStaffUpdated && !isLoadingStaff && (
                      <Text size="xs" c="dimmed" style={{ marginTop: rem(4) }}>
                        Updated: {lastStaffUpdated.toLocaleTimeString()}
                      </Text>
                    )}
                    
                    {/* Last updated timestamp for incident cards */}
                    {card.title === 'Active Incidents' && lastIncidentsUpdated && !isLoadingIncidents && (
                      <Text size="xs" c="dimmed" style={{ marginTop: rem(4) }}>
                        Updated: {lastIncidentsUpdated.toLocaleTimeString()}
                      </Text>
                    )}
                    
                    {/* Last updated timestamp for entry/exit rate cards */}
                    {(card.title === 'Entry Rate' || card.title === 'Exit Rate') && lastEntryExitUpdated && (
                      <Text size="xs" c="dimmed" style={{ marginTop: rem(4) }}>
                        Updated: {lastEntryExitUpdated.toLocaleTimeString()}
                      </Text>
                    )}
                    
                    {/* Loading indicator for staff cards */}
                    {(card.title === 'Active Volunteers' || card.title === 'Security Staff') && isLoadingStaff && (
                      <Badge 
                        size="xs" 
                        color="blue" 
                        variant="light" 
                        style={{ marginTop: rem(8) }}
                      >
                        Updating...
                      </Badge>
                    )}
                    
                    {/* Loading indicator for incident cards */}
                    {card.title === 'Active Incidents' && isLoadingIncidents && (
                      <Badge 
                        size="xs" 
                        color="blue" 
                        variant="light" 
                        style={{ marginTop: rem(8) }}
                      >
                        Updating...
                      </Badge>
                    )}
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
                        Live crowd density visualization across all zones
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
                          {isLoadingQuickStats ? '...' : quickStats.activeZones}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">Active Zones</Text>
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
                          {isLoadingQuickStats ? '...' : quickStats.highDensity}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">High Density</Text>
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
                          {isLoadingQuickStats ? '...' : quickStats.critical}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">Critical</Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                </Grid>

                {/* Heat Map Component */}
                <CrowdHeatMap updateInterval={10000} />
              </Stack>
            </Paper>
          </Stack>
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
  );
}

export default AdminDashboard; 