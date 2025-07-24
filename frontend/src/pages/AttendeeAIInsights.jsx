import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Progress, RingProgress, Select } from '@mantine/core'
import { useState } from 'react'
import { 
  IconBrain,
  IconActivity,
  IconUsers,
  IconMapPin,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconClock,
  IconThermometer,
  IconDroplet
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import AppBar from '../components/AppBar'
import AttendeeSidebar from '../components/AttendeeSidebar'

function AttendeeAIInsights() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [selectedZone, setSelectedZone] = useState('All');

  const handleMenuClick = () => {
    toggle();
    console.log('Attendee menu clicked')
  }

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
  }

  const aiInsights = [
    {
      id: 1,
      title: 'Crowd Capacity',
      value: '78%',
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      title: 'Weather',
      value: '72°F',
      icon: IconThermometer,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 3,
      title: 'Crowd Flow Rate',
      value: '156/min',
      icon: IconTrendingUp,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 4,
      title: 'Battery Status',
      value: '85%',
      icon: IconActivity,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  ];

  const zoneAnalytics = [
    {
      zone: 'Zone A - Main Entrance',
      crowdLevel: 75,
      waitTime: '5 min',
      temperature: '72°F',
      humidity: '45%',
      status: 'Moderate'
    },
    {
      zone: 'Zone B - Food Court',
      crowdLevel: 90,
      waitTime: '12 min',
      temperature: '74°F',
      humidity: '50%',
      status: 'High'
    },
    {
      zone: 'Zone C - Parking Area',
      crowdLevel: 30,
      waitTime: '2 min',
      temperature: '70°F',
      humidity: '40%',
      status: 'Low'
    }
  ];

  const aiGuidelines = [
    {
      id: 1,
      type: 'Optimal Route',
      suggestion: 'Take Zone C → Zone A → Zone B for best experience',
      reason: 'Avoids peak crowd times and shortest wait periods'
    },
    {
      id: 2,
      type: 'Best Time',
      suggestion: 'Visit Food Court in 20 minutes',
      reason: 'Current wait time will reduce from 12 to 5 minutes'
    },
    {
      id: 3,
      type: 'Weather Alert',
      suggestion: 'Bring light jacket for evening',
      reason: 'Temperature expected to drop to 65°F by 8 PM'
    }
  ];



  const getCrowdColor = (level) => {
    if (level >= 80) return '#ef4444';
    if (level >= 60) return '#f59e0b';
    return '#22c55e';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'High': return 'red';
      case 'Moderate': return 'orange';
      case 'Low': return 'green';
      default: return 'gray';
    }
  };

  // Get unique zones from analytics data
  const zones = ['All', ...new Set(zoneAnalytics.map(zone => zone.zone.split(' - ')[0]))];

  // Filter zones based on selected zone
  const filteredZones = selectedZone === 'All' 
    ? zoneAnalytics 
    : zoneAnalytics.filter(zone => zone.zone.startsWith(selectedZone));

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
          userName="Attendee User" 
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
                <IconBrain size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  AI Insights
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Smart recommendations and real-time analytics for your event experience
              </Text>
            </Stack>
            
            {/* AI Insights Cards */}
            <Grid gutter="lg">
              {aiInsights.map((card, index) => (
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

            {/* AI Guidelines */}
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
                    <IconBrain size={24} style={{ color: 'white' }} />
                  </div>
                  <Stack gap="xs">
                    <Title order={3} style={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      AI Guidelines
                    </Title>
                    <Text size="sm" c="dimmed">
                      AI-powered suggestions for your best experience
                    </Text>
                  </Stack>
                </Group>

                <Stack gap="md">
                  {aiGuidelines.map((rec) => (
                    <Card 
                      key={rec.id}
                      shadow="sm" 
                      p="md" 
                      radius="md" 
                      withBorder
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <Stack gap="xs">
                        <Badge 
                          color="blue" 
                          variant="light"
                          size="xs"
                          style={{ alignSelf: 'flex-start' }}
                        >
                          {rec.type}
                        </Badge>
                        
                        <Text size="sm" fw={600}>{rec.suggestion}</Text>
                        <Text size="xs" c="dimmed">{rec.reason}</Text>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Paper>

            {/* Zone Analytics */}
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
                      <IconMapPin size={24} style={{ color: 'white' }} />
                    </div>
                    <Stack gap="xs">
                      <Title order={3} style={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Zone Analytics
                      </Title>
                      <Text size="sm" c="dimmed">
                        Real-time crowd levels and conditions across zones
                      </Text>
                    </Stack>
                  </Group>

                  {/* Zone Selection Dropdown */}
                  <Group gap="sm" align="center">
                    <Text size="sm" fw={600} c="dimmed">Select Zone:</Text>
                    <Select
                      value={selectedZone}
                      onChange={handleZoneSelect}
                      data={zones}
                      placeholder="Choose a zone"
                      style={{ minWidth: 180 }}
                      styles={{
                        input: {
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          borderRadius: rem(8),
                          '&:focus': {
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        },
                        dropdown: {
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          borderRadius: rem(8)
                        },
                        item: {
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.1)'
                          },
                          '&[data-selected]': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }
                        }
                      }}
                    />
                  </Group>
                </Group>

                <Stack gap="md">
                  {filteredZones.map((zone, index) => (
                    <Card 
                      key={index}
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
                        <Group justify="space-between" align="center">
                          <Text fw={600} size="lg">{zone.zone}</Text>
                          <Badge 
                            color={getStatusColor(zone.status)} 
                            variant="light"
                            size="sm"
                          >
                            {zone.status} Crowd
                          </Badge>
                        </Group>
                        
                        <Grid gutter="md">
                          <Grid.Col span={6}>
                            <Stack gap="xs">
                              <Text size="sm" c="dimmed">Crowd Level</Text>
                              <Progress 
                                value={zone.crowdLevel} 
                                color={getCrowdColor(zone.crowdLevel)}
                                size="md"
                                radius="md"
                              />
                              <Text size="sm" fw={600}>{zone.crowdLevel}%</Text>
                            </Stack>
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <Stack gap="xs">
                              <Text size="sm" c="dimmed">Wait Time</Text>
                              <Text size="lg" fw={700} style={{ color: '#667eea' }}>
                                {zone.waitTime}
                              </Text>
                            </Stack>
                          </Grid.Col>
                        </Grid>

                        <Group gap="lg">
                          <Group gap="xs">
                            <IconThermometer size={14} style={{ color: '#667eea' }} />
                            <Text size="xs" c="dimmed">{zone.temperature}</Text>
                          </Group>
                          <Group gap="xs">
                            <IconDroplet size={14} style={{ color: '#667eea' }} />
                            <Text size="xs" c="dimmed">{zone.humidity}</Text>
                          </Group>
                        </Group>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default AttendeeAIInsights; 