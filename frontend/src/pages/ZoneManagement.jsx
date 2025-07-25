import { useState } from 'react'
import { Container, Title, Text, Paper, Stack, AppShell, Group, rem, Card, Grid, Badge, Button, Modal, ActionIcon, Select } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { 
  IconMapPin, 
  IconPlus, 
  IconUsers,
  IconShieldLock,
  IconAlertTriangle,
  IconSettings,
  IconActivity,
  IconTrendingUp,
  IconTrendingDown,
  IconPhone,
  IconMail,
  IconClock
} from '@tabler/icons-react'
import AppBar from '../components/AppBar'
import StaffSidebar from '../components/StaffSidebar'
import ZoneManager from '../components/ZoneManager'
import FloatingAssistant from '../components/FloatingAssistant'
import { useNavigate, useLocation } from 'react-router-dom'

function ZoneManagement() {
  const [opened, { toggle }] = useDisclosure(true);
  const [zoneManagerOpened, { open: openZoneManager, close: closeZoneManager }] = useDisclosure(false);
  const [selectedZone, setSelectedZone] = useState('All');
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();

  // Sample zones data
  const [zones, setZones] = useState([
    {
      id: 1,
      name: 'Main Entrance',
      zoneType: 'entrance',
      currentCapacity: 45,
      maxCapacity: 100,
      status: 'active',
      x: 10,
      y: 10,
      width: 20,
      height: 20,
      centerLat: 37.7749,
      centerLng: -122.4194,
      radius: 50
    },
    {
      id: 2,
      name: 'VIP Lounge',
      zoneType: 'vip_area',
      currentCapacity: 12,
      maxCapacity: 25,
      status: 'active',
      x: 30,
      y: 20,
      width: 15,
      height: 15,
      centerLat: 37.7750,
      centerLng: -122.4195,
      radius: 30
    },
    {
      id: 3,
      name: 'Food Court',
      zoneType: 'food_court',
      currentCapacity: 89,
      maxCapacity: 150,
      status: 'crowded',
      x: 50,
      y: 40,
      width: 25,
      height: 20,
      centerLat: 37.7751,
      centerLng: -122.4196,
      radius: 75
    },
    {
      id: 4,
      name: 'Emergency Exit A',
      zoneType: 'emergency',
      currentCapacity: 0,
      maxCapacity: 200,
      status: 'clear',
      x: 80,
      y: 10,
      width: 10,
      height: 10,
      centerLat: 37.7752,
      centerLng: -122.4197,
      radius: 100
    }
  ]);

  // Sample zone staff data for the component
  const zoneStaffData = [
    {
      id: 1,
      name: 'Officer Sarah Johnson',
      role: 'Security Officer',
      zone: 'Zone A - Main Entrance',
      status: 'Active',
      distance: '50m'
    },
    {
      id: 2,
      name: 'Officer Mike Chen',
      role: 'Security Officer',
      zone: 'Zone B - Food Court',
      status: 'Active',
      distance: '120m'
    },
    {
      id: 3,
      name: 'Officer Lisa Rodriguez',
      role: 'Security Officer',
      zone: 'Zone C - Parking Area',
      status: 'Active',
      distance: '200m'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      role: 'Medical Staff',
      zone: 'Zone A - Medical Station',
      status: 'Active',
      distance: '75m'
    }
  ];

  const handleMenuClick = () => {
    toggle();
  }

  const getZoneStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'crowded': return 'orange';
      case 'critical': return 'red';
      case 'clear': return 'blue';
      default: return 'gray';
    }
  }

  const getZoneTypeIcon = (type) => {
    switch (type) {
      case 'entrance': return IconUsers;
      case 'vip_area': return IconShieldLock;
      case 'food_court': return IconActivity;
      case 'emergency': return IconAlertTriangle;
      default: return IconMapPin;
    }
  }

  const getZoneTypeLabel = (type) => {
    switch (type) {
      case 'entrance': return 'Entrance';
      case 'exit': return 'Exit';
      case 'seating': return 'Seating Area';
      case 'food_court': return 'Food Court';
      case 'rest_area': return 'Rest Area';
      case 'vip_area': return 'VIP Area';
      case 'stage_area': return 'Stage Area';
      case 'parking': return 'Parking';
      case 'emergency': return 'Emergency Exit';
      case 'general': return 'General Area';
      default: return 'General Area';
    }
  }

  const statCards = [
    {
      title: 'Total Capacity',
      value: zones.reduce((sum, zone) => sum + zone.maxCapacity, 0).toString(),
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Current Capacity',
      value: zones.reduce((sum, zone) => sum + zone.currentCapacity, 0).toString(),
      icon: IconActivity,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Current Incidents',
      value: '3',
      icon: IconAlertTriangle,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Zone Staff Count',
      value: '24',
      icon: IconShieldLock,
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
          userName="Staff User" 
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
                <IconMapPin size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Zone Management
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Monitor and manage event zones, capacity, and safety
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



            {/* Zone Staff Component */}
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

              <Stack spacing="lg">
                {/* Header Section */}
                <Group justify="space-between" align="flex-start">
                  <Group gap="md">
                    <div style={{
                      padding: rem(12),
                      borderRadius: rem(12),
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconUsers size={24} style={{ color: 'white' }} />
                    </div>
                    <Stack gap="xs">
                      <Title order={3} style={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Zone Staff
                      </Title>
                      <Text size="sm" c="dimmed">
                        Contact staff in your area
                      </Text>
                    </Stack>
                  </Group>
                  
                  <Group gap="sm" align="center">
                    <Text size="sm" c="dimmed" fw={600}>Select Zone:</Text>
                    <Select
                      value={selectedZone}
                      onChange={setSelectedZone}
                      data={[
                        { value: 'All', label: 'All' },
                        { value: 'Zone A', label: 'Zone A' },
                        { value: 'Zone B', label: 'Zone B' },
                        { value: 'Zone C', label: 'Zone C' }
                      ]}
                      placeholder="Choose a zone"
                      size="sm"
                      radius="md"
                      styles={{
                        input: {
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          borderRadius: rem(8),
                          minWidth: rem(180)
                        }
                      }}
                    />
                  </Group>
                </Group>

                {/* Zone Staff Grid */}
                <Grid gutter="md">
                  {zoneStaffData.map((staff) => (
                    <Grid.Col key={staff.id} span={{ base: 12, sm: 6, lg: 3 }}>
                      <Card 
                        shadow="sm" 
                        padding="md" 
                        radius="md" 
                        withBorder
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Stack gap="xs">
                          <Group gap="xs" align="center">
                            <Text size="sm" fw={600}>{staff.name}</Text>
                            <Badge 
                              color="green" 
                              variant="light"
                              size="xs"
                            >
                              {staff.status}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed">{staff.role}</Text>
                          <Text size="xs" c="dimmed">{staff.zone}</Text>
                          <Badge 
                            color="blue" 
                            variant="light"
                            size="xs"
                          >
                            Distance: {staff.distance}
                          </Badge>
                          <Button
                            size="xs"
                            leftSection={<IconAlertTriangle size={12} />}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              color: 'white'
                            }}
                          >
                            Report Incident
                          </Button>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            </Paper>

          </Stack>
        </Container>
      </AppShell.Main>

      {/* Zone Manager Modal */}
      <Modal
        opened={zoneManagerOpened}
        onClose={closeZoneManager}
        title="Zone Management"
        size="xl"
        styles={{
          title: {
            fontWeight: 600,
            fontSize: rem(20)
          }
        }}
      >
        <ZoneManager
          zones={zones}
          onZonesChange={setZones}
          opened={zoneManagerOpened}
          onClose={closeZoneManager}
        />
      </Modal>

      <FloatingAssistant />
    </AppShell>
  )
}

export default ZoneManagement 