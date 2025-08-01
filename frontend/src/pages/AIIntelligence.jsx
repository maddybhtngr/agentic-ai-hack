import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Button, Progress, RingProgress } from '@mantine/core'
import { 
  IconBrain,
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconAlertTriangle,
  IconUsers,
  IconClock,
  IconTarget,
  IconEye,
  IconCpu,
  IconRobot,
  IconChartLine,
  IconBulb
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import AppBar from '../components/AppBar'
import Sidebar from '../components/Sidebar'
import FloatingAssistant from '../components/FloatingAssistant'
import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

function AIIntelligence() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [crowdMetrics, setCrowdMetrics] = useState({
    accuracy: 90,
    confidence: 0.90,
    status: 'Loading...',
    isLoading: true
  });

  const handleMenuClick = () => {
    toggle();
  }

  // Fetch crowd monitoring data
  const fetchCrowdMetrics = async () => {
    try {
      const response = await apiService.getCrowdMonitoringAnalysis();
      if (response.success && response.ui_metrics) {
        setCrowdMetrics({
          accuracy: response.ui_metrics.accuracy_percentage || 90,
          confidence: response.ui_metrics.confidence_percentage / 100 || 0.90,
          status: 'Active - Real-time Analysis',
          isLoading: false,
          lastUpdated: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      console.error('Failed to fetch crowd metrics:', error);
      setCrowdMetrics(prev => ({
        ...prev,
        status: 'Connection Error',
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    // Fetch on component mount
    fetchCrowdMetrics();
    
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchCrowdMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const aiInsights = [
    {
      id: 1,
      title: 'Crowd Density Prediction',
      description: 'Real-time AI analysis of crowd levels and incident detection',
      accuracy: crowdMetrics.accuracy,
      status: crowdMetrics.status,
      type: 'Real-time',
      confidence: crowdMetrics.confidence,
      isLoading: crowdMetrics.isLoading,
      lastUpdated: crowdMetrics.lastUpdated
    },
    {
      id: 2,
      title: 'Threat Detection',
      description: 'Real-time anomaly detection in crowd behavior patterns',
      accuracy: 89,
      status: 'Active',
      type: 'Detection',
      confidence: 0.89
    },
    {
      id: 3,
      title: 'Traffic Flow Optimization',
      description: 'AI-driven traffic management for smoother attendee flow',
      accuracy: 92,
      status: 'Active',
      type: 'Optimization',
      confidence: 0.92
    },
    {
      id: 4,
      title: 'Resource Allocation',
      description: 'Intelligent staff and resource distribution based on demand',
      accuracy: 87,
      status: 'Active',
      type: 'Allocation',
      confidence: 0.87
    }
  ];

  const aiMetrics = [
    {
      title: 'Predictions Made',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: IconTarget
    },
    {
      title: 'Accuracy Rate',
      value: '91.2%',
      change: '+3.4%',
      trend: 'up',
      icon: IconBrain
    },
    {
      title: 'Alerts Generated',
      value: '89',
      change: '-5%',
      trend: 'down',
      icon: IconAlertTriangle
    },
    {
      title: 'Response Time',
      value: '2.3s',
      change: '-0.8s',
      trend: 'down',
      icon: IconClock
    }
  ];

  const statCards = [
    {
      title: 'Weather',
      value: '72°F',
      icon: IconActivity,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Women Count',
      value: '4,521',
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Children Count',
      value: '1,234',
      icon: IconUsers,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Senior Citizen Count',
      value: '892',
      icon: IconUsers,
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
                  AI Intelligence
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Advanced AI analytics, predictions, and intelligent insights
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



            {/* AI Insights & Predictions */}
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
                      <IconBulb size={24} style={{ color: 'white' }} />
                    </div>
                    <Stack gap="xs">
                      <Title order={3} style={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        AI Insights & Predictions
                      </Title>
                      <Text size="sm" c="dimmed">
                        Intelligent predictions and actionable insights
                      </Text>
                    </Stack>
                  </Group>
                </Group>

                {/* AI Insights Grid */}
                <Grid gutter="lg">
                  {aiInsights.map((insight) => (
                    <Grid.Col key={insight.id} span={{ base: 12, sm: 6, lg: 6 }}>
                      <Card 
                        shadow="md" 
                        padding="lg" 
                        radius="lg" 
                        withBorder
                        style={{
                          background: insight.id === 1 && !insight.isLoading 
                            ? 'rgba(102, 126, 234, 0.05)' 
                            : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(5px)',
                          border: insight.id === 1 && !insight.isLoading 
                            ? '1px solid rgba(102, 126, 234, 0.3)' 
                            : '1px solid rgba(255, 255, 255, 0.3)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Stack gap="md">
                          <Group justify="space-between" align="flex-start">
                            <Stack gap="xs" style={{ flex: 1 }}>
                              <Group gap="xs" align="center">
                                <Text fw={600} size="lg">{insight.title}</Text>
                                <Badge 
                                  color={insight.id === 1 ? "green" : "blue"} 
                                  variant={insight.id === 1 ? "filled" : "light"}
                                  size="sm"
                                >
                                  {insight.type}
                                </Badge>
                                {insight.id === 1 && insight.lastUpdated && (
                                  <Badge color="gray" variant="light" size="xs">
                                    {insight.lastUpdated}
                                  </Badge>
                                )}
                              </Group>
                              <Text size="sm" c="dimmed">{insight.description}</Text>
                              {insight.id === 1 && (
                                <Text size="xs" c="dimmed" fw={500}>
                                  Status: {insight.status}
                                </Text>
                              )}
                            </Stack>
                            <RingProgress
                              size={60}
                              thickness={4}
                              sections={[{ 
                                value: insight.isLoading ? 0 : insight.accuracy, 
                                color: insight.id === 1 ? '#10B981' : '#667eea' 
                              }]}
                              label={
                                <Text ta="center" size="xs" fw={700}>
                                  {insight.isLoading ? '...' : `${insight.accuracy}%`}
                                </Text>
                              }
                            />
                          </Group>

                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="sm" fw={500}>Accuracy</Text>
                              <Text size="sm" fw={600}>
                                {insight.isLoading ? 'Loading...' : `${insight.accuracy}%`}
                              </Text>
                            </Group>
                            <Progress 
                              value={insight.isLoading ? 0 : insight.accuracy} 
                              color={insight.id === 1 ? "#10B981" : "#667eea"} 
                              size="sm"
                              radius="xl"
                              animated={insight.isLoading}
                            />
                            <Group gap="xs">
                              <IconEye size={14} style={{ 
                                color: insight.id === 1 ? '#10B981' : '#667eea' 
                              }} />
                              <Text size="xs" c="dimmed">
                                Confidence: {insight.isLoading ? 'Loading...' : `${(insight.confidence * 100).toFixed(0)}%`}
                              </Text>
                            </Group>
                            {insight.id === 1 && !insight.isLoading && (
                              <Group gap="xs" mt="xs">
                                <Button 
                                  size="xs" 
                                  variant="light" 
                                  color="green"
                                  onClick={fetchCrowdMetrics}
                                >
                                  Refresh Data
                                </Button>
                              </Group>
                            )}
                          </Stack>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            </Paper>


          </Stack>
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
  );
}

export default AIIntelligence; 