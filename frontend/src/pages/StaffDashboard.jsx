import { Container, Title, Text, Paper, Stack, AppShell, Group, rem, Card, Grid, Badge } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { 
  IconDashboard, 
  IconAlertTriangle, 
  IconUsers,
  IconShieldLock,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import AppBar from '../components/AppBar'
import StaffSidebar from '../components/StaffSidebar'
import CrowdHeatMap from '../components/CrowdHeatMap'
import FloatingAssistant from '../components/FloatingAssistant'
import { useNavigate, useLocation } from 'react-router-dom'
import { authUtils, apiService } from '../services/api'

function StaffDashboard() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();

  // Get current user data
  const currentUser = authUtils.getCurrentUser();
  const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Staff User';

  // State for Quick Stats
  const [quickStats, setQuickStats] = useState({
    totalZones: 0,
    activeZones: 0,
    highDensity: 0,
    critical: 0
  });
  const [isLoadingQuickStats, setIsLoadingQuickStats] = useState(false);

  // State for Staff Zone Crowd Details (will be populated from heat map data)
  const [staffZoneCrowd, setStaffZoneCrowd] = useState({
    count: 0,
    maxCapacity: 0,
    zoneName: '',
    lastUpdated: null
  });
  const [totalZones, setTotalZones] = useState(0);
  const [staffZoneName, setStaffZoneName] = useState('');
  const [staffZoneId, setStaffZoneId] = useState(null);
  const [zoneStaff, setZoneStaff] = useState([]);
  const [isLoadingZoneStaff, setIsLoadingZoneStaff] = useState(false);
  const [zoneIncidents, setZoneIncidents] = useState([]);
  const [isLoadingZoneIncidents, setIsLoadingZoneIncidents] = useState(false);

  const handleMenuClick = () => {
    toggle();
  }

  // Function to get staff member's zone name and ID
  const fetchStaffZoneName = async () => {
    try {
      const currentUser = authUtils.getCurrentUser();
      if (!currentUser || !currentUser.username) {
        console.error('No current user found');
        return;
      }

      const userDetails = await apiService.getUserDetails(currentUser.username);
      const zoneName = userDetails.data.current_zone;
      
      if (zoneName) {
        setStaffZoneName(zoneName);
        
        // Get zone ID for the zone name
        const allZones = await apiService.getAllZones();
        const zone = allZones.find(z => z.name === zoneName);
        if (zone) {
          setStaffZoneId(zone.id);
        }
      }
    } catch (error) {
      console.error('Error fetching staff zone name:', error);
    }
  };

  // Function to fetch staff for the zone
  const fetchZoneStaff = async () => {
    if (!staffZoneId) return;
    
    setIsLoadingZoneStaff(true);
    try {
      const staffResponse = await apiService.getAvailableStaff(staffZoneId);
      if (staffResponse.success) {
        setZoneStaff(staffResponse.data);
      }
    } catch (error) {
      console.error('Error fetching zone staff:', error);
    } finally {
      setIsLoadingZoneStaff(false);
    }
  };

  // Function to fetch incidents for the zone
  const fetchZoneIncidents = async () => {
    if (!staffZoneId) return;
    
    setIsLoadingZoneIncidents(true);
    try {
      const incidentsResponse = await apiService.getAllIncidents();
      const allIncidents = incidentsResponse.data || incidentsResponse;
      
      // Filter incidents for this zone and broadcast incidents
      const filteredIncidents = allIncidents.filter(incident => {
        // Show broadcast incidents (relevant to all staff)
        if (incident.is_broadcast) return true;
        
        // Show incidents assigned to this staff member's zone
        if (incident.zone_id === staffZoneId) return true;
        
        return false;
      });
      
      setZoneIncidents(filteredIncidents);
    } catch (error) {
      console.error('Error fetching zone incidents:', error);
    } finally {
      setIsLoadingZoneIncidents(false);
    }
  };

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

  // Function to update staff zone crowd from heat map data
  const updateStaffZoneCrowdFromHeatMap = (heatMapData) => {
    console.log('Heat map data received:', heatMapData);
    
    if (heatMapData) {
      // Update total zones count - try totalZones field first, then fallback to zones array length
      const zonesCount = heatMapData.totalZones || (heatMapData.zones ? heatMapData.zones.length : 0);
      console.log('Total zones from heat map:', heatMapData.totalZones);
      console.log('Zones array length:', heatMapData.zones ? heatMapData.zones.length : 0);
      console.log('Final zones count:', zonesCount);
      setTotalZones(zonesCount);
      
      // Update staff zone crowd data
      if (staffZoneName && heatMapData.zones) {
        const staffZoneData = heatMapData.zones.find(zone => zone.name === staffZoneName);
        if (staffZoneData) {
          setStaffZoneCrowd({
            count: staffZoneData.count || 0,
            maxCapacity: staffZoneData.maxCapacity || 0,
            zoneName: staffZoneData.name,
            lastUpdated: new Date(heatMapData.lastUpdated)
          });
        }
      }
    }
  };

  // Fetch staff zone name on component mount
  useEffect(() => {
    fetchStaffZoneName();
  }, []);

  // Fetch zone staff when zone ID is available
  useEffect(() => {
    if (staffZoneId) {
      fetchZoneStaff();
      fetchZoneIncidents();
    }
  }, [staffZoneId]);

  // Fetch quick stats on component mount
  useEffect(() => {
    fetchQuickStats();
  }, []);

  // Set up 10-second polling interval for quick stats, zone staff, and zone incidents
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuickStats();
      if (staffZoneId) {
        fetchZoneStaff();
        fetchZoneIncidents();
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [staffZoneId]);

  const statCards = [
    {
      title: 'Total Attendees',
      value: isLoadingQuickStats ? '...' : staffZoneCrowd.count.toString(),
      subtitle: staffZoneCrowd.zoneName ? `in ${staffZoneCrowd.zoneName}` : '',
      lastUpdated: staffZoneCrowd.lastUpdated,
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Volunteers',
      value: isLoadingZoneStaff ? '...' : zoneStaff.filter(staff => staff.role !== 'Security').length.toString(),
      lastUpdated: staffZoneCrowd.lastUpdated,
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Security Staff',
      value: isLoadingZoneStaff ? '...' : zoneStaff.filter(staff => staff.role === 'Security').length.toString(),
      lastUpdated: staffZoneCrowd.lastUpdated,
      icon: IconShieldLock,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Incidents',
      value: isLoadingZoneIncidents ? '...' : zoneIncidents.length.toString(),
      lastUpdated: staffZoneCrowd.lastUpdated,
      icon: IconAlertTriangle,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Current Capacity',
      value: staffZoneCrowd.maxCapacity > 0 ? `${Math.round((staffZoneCrowd.count / staffZoneCrowd.maxCapacity) * 100)}%` : '0%',
      lastUpdated: staffZoneCrowd.lastUpdated,
      icon: IconActivity,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Crowd Flow',
      value: 'Normal',
      icon: IconTrendingUp,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Alerts',
      value: '0',
      icon: IconAlertTriangle,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Total Zones',
      value: totalZones.toString(),
      lastUpdated: staffZoneCrowd.lastUpdated,
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
          userName={userName} 
          onMenuClick={handleMenuClick}
          opened={opened}
        />
      </AppShell.Header>

      <StaffSidebar opened={opened} />

      <AppShell.Main>
        <Container size="100%" py="xl" px="xl">
          <Stack spacing="xl">
            {/* Header Section */}
            <Stack spacing="xs">
              <Group gap="xs">
                <IconDashboard size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Staff Dashboard
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Monitor and manage event operations as staff member
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
                    

                    
                    {/* Last updated time */}
                    {card.lastUpdated && (
                      <Text size="xs" c="dimmed" mt="xs">
                        Updated: {card.lastUpdated.toLocaleTimeString()}
                      </Text>
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
                <CrowdHeatMap showZoneManagement={false} updateInterval={10000} onDataUpdate={updateStaffZoneCrowdFromHeatMap} />
              </Stack>
            </Paper>
          </Stack>
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
  )
}

export default StaffDashboard 