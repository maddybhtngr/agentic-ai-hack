import { Container, Title, Text, Paper, Stack, AppShell, Grid, Badge, Group, Progress, ActionIcon, rem, Card, Tabs } from '@mantine/core';
import { IconUser, IconCamera, IconLivePhoto, IconVolume, IconVolumeOff, IconMaximize, IconUserCircle, IconUsersGroup, IconAlertTriangle, IconVideo, IconActivity, IconTrash, IconChartBar, IconShield, IconMoodSmile } from '@tabler/icons-react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import AppBar from '../components/AppBar';
import Sidebar from '../components/Sidebar';
import FloatingAssistant from '../components/FloatingAssistant';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Modal, TextInput, Button } from '@mantine/core';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import { apiService } from '../services/api';
import CCTVHeatMapOverlay from '../components/CCTVHeatMapOverlay';

function CommandCenter() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  // Camera state
  const [cameras, setCameras] = useState([]);
  const [cctvData, setCctvData] = useState({});
  const [cameraTimestampIndexes, setCameraTimestampIndexes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editCameraId, setEditCameraId] = useState(null);
  const [editCameraName, setEditCameraName] = useState('');
  const [newCameraName, setNewCameraName] = useState('');
  const [heatMapsEnabled, setHeatMapsEnabled] = useState(true);
  
  // Ref for predictions scroll container to preserve scroll position
  const predictionsScrollRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Video endpoint mapping for each camera
  const getVideoUrl = (cameraId) => {
    const backendUrl = 'http://localhost:8000/'; // Production backend URL
    return `${backendUrl}/cctv/videos/${cameraId}`;
  };

  // Fetch initial CCTV feeds data
  const fetchInitialCCTVData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch CCTV feeds list
      const feedsResponse = await apiService.getCCTVFeeds();
      const feeds = feedsResponse.feeds || [];
      
      // Set cameras from API response
      setCameras(feeds.map(feed => ({
        id: feed.id,
        name: feed.name,
        status: feed.status,
        totalTimestamps: feed.total_timestamps,
        durationSeconds: feed.duration_seconds
      })));
      
      // Initialize timestamp indexes for each camera
      const initialIndexes = {};
      feeds.forEach(feed => {
        initialIndexes[feed.id] = 0;
      });
      setCameraTimestampIndexes(initialIndexes);
      
      // Fetch initial timestamp data for each camera
      await fetchAllCameraData(initialIndexes);
      
    } catch (err) {
      console.error('Error fetching CCTV data:', err);
      setError(err.message);
      // Fallback to static data if API fails
      const fallbackCameras = [
        { id: 'cctv_1', name: 'Camera 1', status: 'active', totalTimestamps: 15, durationSeconds: 30 },
        { id: 'cctv_2', name: 'Camera 2', status: 'active', totalTimestamps: 15, durationSeconds: 30 },
        { id: 'cctv_3', name: 'Camera 3', status: 'active', totalTimestamps: 15, durationSeconds: 30 },
        { id: 'cctv_4', name: 'Camera 4', status: 'active', totalTimestamps: 15, durationSeconds: 30 },
        { id: 'cctv_5', name: 'Camera 5', status: 'active', totalTimestamps: 15, durationSeconds: 30 },
        { id: 'cctv_6', name: 'Camera 6', status: 'active', totalTimestamps: 15, durationSeconds: 30 },
      ];
      setCameras(fallbackCameras);
      
      const fallbackIndexes = {};
      fallbackCameras.forEach(cam => {
        fallbackIndexes[cam.id] = 0;
      });
      setCameraTimestampIndexes(fallbackIndexes);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for all cameras at their current timestamp indexes
  const fetchAllCameraData = async (indexes = cameraTimestampIndexes) => {
    try {
      const dataPromises = Object.entries(indexes).map(([cameraId, timestampIndex]) => 
        apiService.getCCTVFeedData(cameraId, timestampIndex)
      );
      
      const cctvResults = await Promise.all(dataPromises);
      
      // Structure the data by camera ID
      const structuredData = {};
      cctvResults.forEach(result => {
        structuredData[result.cctv_id] = result;
      });
      
      setCctvData(structuredData);
    } catch (err) {
      console.error('Error fetching camera data:', err);
    }
  };

  // Fetch initial CCTV data on component mount
  useEffect(() => {
    fetchInitialCCTVData();
  }, []);

  // Set up cycling intervals for each camera (2 seconds per timestamp)
  useEffect(() => {
    if (cameras.length === 0) return;

    const intervals = {};
    
    cameras.forEach(camera => {
      intervals[camera.id] = setInterval(() => {
        setCameraTimestampIndexes(prev => {
          const newIndexes = { ...prev };
          newIndexes[camera.id] = (prev[camera.id] || 0) + 1;
          
          // Immediately fetch new data for this camera
          apiService.getCCTVFeedData(camera.id, newIndexes[camera.id])
            .then(result => {
              // Preserve scroll position before data update
              const currentScrollTop = predictionsScrollRef.current?.scrollTop || 0;
              
              setCctvData(prevData => ({
                ...prevData,
                [result.cctv_id]: result
              }));
              
              // Restore scroll position after data update
              setTimeout(() => {
                if (predictionsScrollRef.current) {
                  predictionsScrollRef.current.scrollTop = currentScrollTop;
                }
              }, 0);
            })
            .catch(err => console.error(`Error updating ${camera.id}:`, err));
          
          return newIndexes;
        });
      }, 2000); // Update every 2 seconds
    });

    // Cleanup intervals
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [cameras]);

  const handleMenuClick = () => {
    toggle();
    console.log('Command Center menu clicked');
  };

  const handleEditClick = (cam) => {
    setEditCameraId(cam.id);
    setEditCameraName(cam.name);
    setEditModalOpen(true);
  };
  const handleEditSave = () => {
    setCameras(cameras.map(cam => cam.id === editCameraId ? { ...cam, name: editCameraName } : cam));
    setEditModalOpen(false);
  };
  const handleAddCamera = () => {
    setAddModalOpen(true);
    setNewCameraName('');
  };
  const handleAddSave = () => {
    if (newCameraName.trim()) {
      setCameras([...cameras, { id: Date.now(), name: newCameraName }]);
      setAddModalOpen(false);
    }
  };

  const handleDeleteCamera = (cameraId) => {
    setCameras(cameras.filter(cam => cam.id !== cameraId));
  };

  // Add enhanced color constants for box types with gradients
  const BOX_COLORS = {
    face: '3px solid #339af0', // Enhanced blue
    group: '3px solid #51cf66', // Enhanced green
    person: '3px solid #ff8c42', // Enhanced orange
  };

  const BOX_SHADOWS = {
    face: '0 0 15px rgba(51, 154, 240, 0.4)',
    group: '0 0 15px rgba(81, 207, 102, 0.4)',
    person: '0 0 15px rgba(255, 140, 66, 0.4)',
  };

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
          opened={opened} 
          onMenuClick={handleMenuClick}
        />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar onNavigate={() => {}} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="100%" py="xl" px="xl" style={{ position: 'relative' }}>
        <Stack gap="xl">
          <Paper 
            shadow="xl" 
            p="xl" 
            radius="lg"
            mb="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Gradient top border accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: `${rem(12)} ${rem(12)} 0 0`
            }} />
            
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
                  <Title order={3} style={{ fontWeight: 600 }}>
                    Operations Center
                  </Title>
                  <Text size="sm" c="dimmed">
                    Real-time CCTV monitoring with AI analytics
                  </Text>
                </Stack>
              </Group>
              
              <Group gap="sm">
                <Button 
                  size="md"
                  radius="md"
                  variant="light"
                  color="blue"
                  leftSection={<IconActivity size={16} />} 
                  onClick={fetchInitialCCTVData}
                  loading={loading}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    border: '1px solid rgba(102, 126, 234, 0.2)'
                  }}
                >
                  Refresh Data
                </Button>
                <Button 
                  size="md"
                  radius="md"
                  variant={heatMapsEnabled ? "filled" : "light"}
                  color="teal"
                  leftSection={<IconLivePhoto size={16} />} 
                  onClick={() => setHeatMapsEnabled(!heatMapsEnabled)}
                  style={{
                    background: heatMapsEnabled 
                      ? 'linear-gradient(135deg, #12b886 0%, #20c997 100%)'
                      : 'rgba(18, 184, 134, 0.1)',
                    color: heatMapsEnabled ? 'white' : '#12b886',
                    border: `1px solid ${heatMapsEnabled ? 'transparent' : 'rgba(18, 184, 134, 0.2)'}`,
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(18, 184, 134, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {heatMapsEnabled ? 'Show Videos' : 'Show Heat Maps'}
                </Button>
                <Button 
                  size="md"
                  radius="md"
                  leftSection={<IconPlus size={16} />} 
                  onClick={handleAddCamera}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  Add Camera
                </Button>
              </Group>
            </Group>
          </Paper>

          <FloatingAssistant onQuerySubmit={() => {
            // Handle query submission logic here
            console.log('Query submitted to FloatingAssistant');
          }} />

            {/* Loading and Error States */}
            {loading && (
              <Paper 
                shadow="lg" 
                p="xl" 
                radius="lg" 
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center'
                }}
              >
                <Text size="lg" c="dimmed">Loading CCTV feeds...</Text>
              </Paper>
            )}

            {error && (
              <Paper 
                shadow="lg" 
                p="xl" 
                radius="lg" 
                style={{
                  background: 'rgba(255, 240, 240, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <Text size="lg" c="red">Error loading CCTV data: {error}</Text>
                <Text size="sm" c="dimmed" mt="xs">Using fallback data for demonstration</Text>
              </Paper>
            )}

            {/* Camera Grid */}
            <Grid gutter="xl" align="stretch">
              {cameras.map((cam, idx) => {
                // CRITICAL FIX: Do not render the camera card until its data has been loaded.
                if (!cctvData?.[cam.id]) {
                  return null; // Or a loading skeleton
                }
                // Get real CCTV data for this camera
                const cameraData = cctvData?.[cam.id] || {};
                const currentAnalysis = cameraData?.current_analysis || {};
                const summaryStats = cameraData?.summary_stats || {};
                const timestampInfo = currentAnalysis?.timestamp_info || {};
                const currentTimestampIndex = cameraTimestampIndexes?.[cam.id] || 0;
                
                // Extract real data
                const peopleCount = currentAnalysis?.people_count || 0;
                const crowdDensity = currentAnalysis?.crowd_density || 'low';
                const demographics = currentAnalysis?.demographics || {};
                const sentiment = currentAnalysis?.sentiment_analysis || {};
                
                // Security alerts
                const violenceAlert = currentAnalysis?.violence_flag || false;
                const weaponAlert = currentAnalysis?.weapon_detected || false;
                const fireAlert = currentAnalysis?.fire_flag || false;
                const smokeAlert = currentAnalysis?.smoke_flag || false;
                const hasAlert = violenceAlert || weaponAlert || fireAlert || smokeAlert;
                
                // Calculate faces count from demographics
                const faces = (demographics?.male_count || 0) + (demographics?.female_count || 0);
                
                // Quality metric based on data availability and analysis confidence
                const quality = currentAnalysis?.timestamp ? 
                  Math.min(95, 70 + (peopleCount > 0 ? 15 : 0) + (Object.keys(demographics).length > 0 ? 10 : 0)) 
                  : 50;
                
                // Density color mapping
                const getDensityColor = (density) => {
                  switch(density) {
                    case 'low': return 'teal';
                    case 'medium': return 'blue';
                    case 'high': return 'orange';
                    case 'very_high': return 'red';
                    default: return 'gray';
                  }
                };
                
                // Density level mapping
                const densityLevel = (density) => {
                  switch(density) {
                    case 'low': return 'Low';
                    case 'medium': return 'Moderate';
                    case 'high': return 'High';
                    case 'very_high': return 'Critical';
                    default: return 'Unknown';
                  }
                };
                
                // Density value for progress bar (0-1)
                const densityValue = {
                  'low': 0.2,
                  'medium': 0.5,
                  'high': 0.8,
                  'very_high': 1.0
                }[crowdDensity] || 0;
                return (
                  <Grid.Col 
                    span={{ base: 12, sm: 6, lg: 6 }} 
                    key={cam.id}
                    style={{ display: 'flex' }}
                  >
                    <Card 
                      shadow="xl" 
                      padding={0}
                      radius="lg" 
                      withBorder
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        height: '580px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        margin: '0 auto'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <Card.Section>
                        {/* Video Container */}
                        <div style={{ 
                          position: 'relative', 
                          width: '100%', 
                          height: '250px',
                          borderRadius: `${rem(12)} ${rem(12)} 0 0`, 
                          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          {/* CCTV Content - Heatmap or Video */}
                          {heatMapsEnabled ? (
                            <CCTVHeatMapOverlay 
                              heatmapPoints={currentAnalysis?.heatmap_points || []}
                              width={600}
                              height={400}
                              maxOpacity={0.9}
                              minOpacity={0.1}
                            />
                          ) : (
                            <video
                              key={cam.id}
                              autoPlay
                              loop
                              muted
                              playsInline
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 1
                              }}
                              onError={(e) => {
                                console.error(`Error loading video for ${cam.id}:`, e);
                              }}
                            >
                              <source 
                                src={getVideoUrl(cam.id)} 
                                type="video/mp4" 
                              />
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: '#666',
                                textAlign: 'center',
                                fontSize: '14px'
                              }}>
                                Video not available for {cam.name}
                              </div>
                            </video>
                          )}
                          
                          {/* ALERT DETECTED overlay animation */}
                          {hasAlert && (densityLevel(crowdDensity) === 'Critical' || hasAlert) && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'rgba(255,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10,
                                pointerEvents: 'none',
                                animation: 'alertPulse 1s infinite',
                              }}
                            >
                              <span
                                style={{
                                  background: 'rgba(255,0,0,0.85)',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: 22,
                                  padding: '10px 32px',
                                  borderRadius: 12,
                                  boxShadow: '0 2px 16px rgba(255,0,0,0.25)',
                                  letterSpacing: 2,
                                  textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                                  border: '2px solid #fff',
                                  animation: 'alertTextPulse 1s infinite',
                                }}
                              >
                                ALERT DETECTED
                              </span>
                            </div>
                          )}
                          
                          {/* Timestamp Progress Indicator */}
                          {timestampInfo?.total_timestamps && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                right: 8,
                                height: 4,
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: 2,
                                zIndex: 15
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${timestampInfo?.progress_percentage || 0}%`,
                                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                  borderRadius: 2,
                                  transition: 'width 0.5s ease'
                                }}
                              />
                            </div>
                          )}

                          {/* Timestamp Info Badge */}
                          {timestampInfo?.total_timestamps && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 18,
                                left: 8,
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: 12,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                zIndex: 16
                              }}
                            >
                              {timestampInfo?.current_index + 1}/{timestampInfo?.total_timestamps}
                            </div>
                          )}
                          
                          {/* Top controls row: volume, expand, live */}
                          <Group style={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            zIndex: 17 
                          }}>
                            <Group gap={4}>
                              <ActionIcon 
                                size="sm" 
                                variant="light" 
                                color="gray" 
                                aria-label="Toggle volume"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.9)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  '&:hover': {
                                    background: 'rgba(255, 255, 255, 1)'
                                  }
                                }}
                              >
                                <IconVolume size={16} />
                              </ActionIcon>
                              <ActionIcon 
                                size="sm" 
                                variant="light" 
                                color="gray" 
                                aria-label="Expand video"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.9)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  '&:hover': {
                                    background: 'rgba(255, 255, 255, 1)'
                                  }
                                }}
                              >
                                <IconMaximize size={16} />
                              </ActionIcon>
                            </Group>
                            <Badge
                              color="red"
                              variant="filled"
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4,
                                background: 'rgba(239, 68, 68, 0.9)',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                              leftSection={
                                <span style={{ 
                                  display: 'inline-block', 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  background: 'white', 
                                  marginRight: 4,
                                  animation: 'blink 1s infinite'
                                }} />
                              }
                            >
                              Live
                            </Badge>
                          </Group>

                          {/* Camera Title Overlay */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              left: 8,
                              background: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: 16,
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              zIndex: 16
                            }}
                          >
                            {cam.name}
                          </div>
                        </div>
                      </Card.Section>

                      {/* Tabbed Interface */}
                      <div style={{ padding: rem(16), flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Tabs defaultValue="overview" variant="pills" radius="md">
                          <Tabs.List grow mb="md">
                            <Tabs.Tab value="overview" leftSection={<IconChartBar size={14} />}>
                              Overview
                            </Tabs.Tab>
                            <Tabs.Tab value="demographics" leftSection={<IconUsersGroup size={14} />}>
                              Demographics
                            </Tabs.Tab>
                            <Tabs.Tab value="security" leftSection={<IconShield size={14} />}>
                              Security
                            </Tabs.Tab>
                            <Tabs.Tab value="sentiment" leftSection={<IconMoodSmile size={14} />}>
                              Sentiment
                            </Tabs.Tab>
                            <Tabs.Tab value="predictions" leftSection={<IconActivity size={14} />}>
                              Predictions
                            </Tabs.Tab>
                          </Tabs.List>

                          {/* Fixed height container for all tab content */}
                          <div style={{ 
                            minHeight: '280px', 
                            maxHeight: '280px', 
                            overflow: 'auto',
                            padding: '0 4px' // Add small padding to prevent content touching edges
                          }}>
                            <Tabs.Panel value="overview">
                              <Stack gap="sm">
                                {/* Current Status */}
                                <div>
                                  <Text size="sm" fw={600} c="blue" mb="xs">📊 Current Status</Text>
                                  <Stack gap="xs">
                                    <Group justify="space-between">
                                      <Text size="sm">People Count:</Text>
                                      <Text size="sm" fw={600}>{peopleCount}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                      <Text size="sm">Crowd Density:</Text>
                                      <Badge 
                                        color={getDensityColor(crowdDensity)} 
                                        variant="light"
                                        size="sm"
                                      >
                                        {densityLevel(crowdDensity)}
                                      </Badge>
                                    </Group>
                                  </Stack>
                                </div>

                                {/* Progress Bar */}
                                <Progress 
                                  value={densityValue * 100} 
                                  color={getDensityColor(crowdDensity)} 
                                  size="sm" 
                                  radius="md"
                                />

                                {/* Emergency Alerts */}
                                <div>
                                  <Text size="sm" fw={600} c="red" mb="xs">🚨 Emergency Alerts</Text>
                                  <Stack gap="xs">
                                    <Group justify="space-between">
                                      <Text size="sm">Violence:</Text>
                                      <Badge 
                                        color={violenceAlert ? 'red' : 'green'} 
                                        variant="filled" 
                                        size="sm"
                                      >
                                        {violenceAlert ? 'YES' : 'NO'}
                                      </Badge>
                                    </Group>
                                    <Group justify="space-between">
                                      <Text size="sm">Fire:</Text>
                                      <Badge 
                                        color={fireAlert ? 'orange' : 'green'} 
                                        variant="filled" 
                                        size="sm"
                                      >
                                        {fireAlert ? 'YES' : 'NO'}
                                      </Badge>
                                    </Group>
                                    <Group justify="space-between">
                                      <Text size="sm">Smoke:</Text>
                                      <Badge 
                                        color={smokeAlert ? 'gray' : 'green'} 
                                        variant="filled" 
                                        size="sm"
                                      >
                                        {smokeAlert ? 'YES' : 'NO'}
                                      </Badge>
                                    </Group>
                                  </Stack>
                                </div>
                              </Stack>
                            </Tabs.Panel>

                            <Tabs.Panel value="demographics">
                              <Stack gap="sm">
                                <Text size="sm" fw={600} c="blue" mb="xs">👥 People Breakdown</Text>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: rem(8)
                                }}>
                                  <div style={{
                                    background: '#f8fafc',
                                    padding: rem(8),
                                    borderRadius: rem(6),
                                    textAlign: 'center'
                                  }}>
                                    <Text size="lg" fw={700} c="blue">{demographics?.male_count || 0}</Text>
                                    <Text size="xs" c="dimmed">Males</Text>
                                  </div>
                                  <div style={{
                                    background: '#fdf2f8',
                                    padding: rem(8),
                                    borderRadius: rem(6),
                                    textAlign: 'center'
                                  }}>
                                    <Text size="lg" fw={700} c="pink">{demographics?.female_count || 0}</Text>
                                    <Text size="xs" c="dimmed">Females</Text>
                                  </div>
                                  <div style={{
                                    background: '#f0fdf4',
                                    padding: rem(8),
                                    borderRadius: rem(6),
                                    textAlign: 'center'
                                  }}>
                                    <Text size="lg" fw={700} c="green">{demographics?.child_count || 0}</Text>
                                    <Text size="xs" c="dimmed">Children</Text>
                                  </div>
                                  <div style={{
                                    background: '#faf5ff',
                                    padding: rem(8),
                                    borderRadius: rem(6),
                                    textAlign: 'center'
                                  }}>
                                    <Text size="lg" fw={700} c="violet">{demographics?.elder_count || 0}</Text>
                                    <Text size="xs" c="dimmed">Elders</Text>
                                  </div>
                                </div>
                              </Stack>
                            </Tabs.Panel>

                            <Tabs.Panel value="security">
                              <Stack gap="sm">
                                <Text size="sm" fw={600} c="red" mb="xs">🔒 Security Analysis</Text>
                                <Stack gap="xs">
                                  <Group justify="space-between">
                                    <Text size="sm">Weapons Detected:</Text>
                                    <Badge 
                                      color={weaponAlert ? 'red' : 'green'} 
                                      variant="filled" 
                                      size="sm"
                                    >
                                      {weaponAlert ? 'YES' : 'NO'}
                                    </Badge>
                                  </Group>
                                  <Group justify="space-between">
                                    <Text size="sm">Suspicious Behavior:</Text>
                                    <Badge 
                                      color={currentAnalysis?.suspicious_behavior ? 'orange' : 'green'} 
                                      variant="filled" 
                                      size="sm"
                                    >
                                      {currentAnalysis?.suspicious_behavior ? 'YES' : 'NO'}
                                    </Badge>
                                  </Group>
                                  <Group justify="space-between">
                                    <Text size="sm">Emergency Evacuation:</Text>
                                    <Badge 
                                      color={currentAnalysis?.emergency_evacuation ? 'red' : 'green'} 
                                      variant="filled" 
                                      size="sm"
                                    >
                                      {currentAnalysis?.emergency_evacuation ? 'YES' : 'NO'}
                                    </Badge>
                                  </Group>
                                </Stack>

                                {/* Environment */}
                                <div>
                                  <Text size="sm" fw={600} c="teal" mb="xs" mt="md">🌍 Environment</Text>
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: rem(6)
                                  }}>
                                    <div style={{
                                      background: '#f8fafc',
                                      padding: rem(6),
                                      borderRadius: rem(4),
                                      textAlign: 'center'
                                    }}>
                                      <Text size="xs" fw={600}>Lighting</Text>
                                      <Text size="xs" c="dimmed">{currentAnalysis?.environmental?.lighting_condition || 'Unknown'}</Text>
                                    </div>
                                    <div style={{
                                      background: '#f8fafc',
                                      padding: rem(6),
                                      borderRadius: rem(4),
                                      textAlign: 'center'
                                    }}>
                                      <Text size="xs" fw={600}>Weather</Text>
                                      <Text size="xs" c="dimmed">{currentAnalysis?.environmental?.weather_condition || 'Unknown'}</Text>
                                    </div>
                                    <div style={{
                                      background: '#f8fafc',
                                      padding: rem(6),
                                      borderRadius: rem(4),
                                      textAlign: 'center'
                                    }}>
                                      <Text size="xs" fw={600}>Vehicles</Text>
                                      <Text size="xs" c="dimmed">{currentAnalysis?.environmental?.vehicles_present ? 'Yes' : 'No'}</Text>
                                    </div>
                                  </div>
                                </div>
                              </Stack>
                            </Tabs.Panel>

                            <Tabs.Panel value="sentiment">
                              <Stack gap="sm">
                                <Text size="sm" fw={600} c="blue" mb="xs">😊 Crowd Sentiment</Text>
                                <Stack gap="xs">
                                  <Group justify="space-between">
                                    <Text size="sm">Overall Mood:</Text>
                                    <Badge 
                                      color={sentiment?.crowd_mood === 'agitated' ? 'red' : 
                                             sentiment?.crowd_mood === 'calm' ? 'green' : 'blue'} 
                                      variant="light" 
                                      size="sm"
                                    >
                                      {sentiment?.crowd_mood || 'Neutral'}
                                    </Badge>
                                  </Group>
                                  <Group justify="space-between">
                                    <Text size="sm">Energy Level:</Text>
                                    <Badge 
                                      color="teal" 
                                      variant="light" 
                                      size="sm"
                                    >
                                      {(sentiment?.energy_level || 'low').charAt(0).toUpperCase() + (sentiment?.energy_level || 'low').slice(1)}
                                    </Badge>
                                  </Group>
                                </Stack>

                                {/* Dominant Emotions */}
                                {sentiment?.dominant_emotions && sentiment?.dominant_emotions.length > 0 && (
                                  <div>
                                    <Text size="sm" fw={600} c="blue" mb="xs" mt="md">Dominant Emotions:</Text>
                                    <Group gap="xs">
                                      {sentiment?.dominant_emotions.map((emotion, idx) => (
                                        <Badge 
                                          key={idx}
                                          variant="light" 
                                          color="grape" 
                                          size="sm"
                                        >
                                          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                                        </Badge>
                                      ))}
                                    </Group>
                                  </div>
                                )}

                                {/* Timeline Info */}
                                {timestampInfo?.total_timestamps && (
                                  <div>
                                    <Text size="sm" fw={600} c="gray" mb="xs" mt="md">Timeline:</Text>
                                    <Group gap="xs">
                                      <Badge variant="light" color="gray" size="sm">
                                        Frame {timestampInfo?.current_index + 1} / {timestampInfo?.total_timestamps}
                                      </Badge>
                                      <Badge variant="light" color="cyan" size="sm">
                                        {Math.round(timestampInfo?.progress_percentage || 0)}% Complete
                                      </Badge>
                                    </Group>
                                  </div>
                                )}
                              </Stack>
                            </Tabs.Panel>

                            <Tabs.Panel value="predictions">
                              <div 
                                ref={predictionsScrollRef}
                                style={{ 
                                  maxHeight: '450px', 
                                  overflowY: 'auto', 
                                  paddingRight: '12px', 
                                  paddingBottom: '16px',
                                  marginBottom: '8px'
                                }}>
                                <Stack gap="sm">
                                {/* Flow Metrics */}
                                <div>
                                  <Text size="sm" fw={600} c="blue" mb="xs">🔁 Flow Metrics</Text>
                                  <Grid gutter="xs">
                                    <Grid.Col span={6}>
                                      <Paper withBorder p="xs" style={{ textAlign: 'center' }}>
                                        <Text size="xl" fw={700} c="blue">
                                          {currentAnalysis?.flow_metrics?.inflow_count || 0}
                                        </Text>
                                        <Text size="xs" c="dimmed">Inflow</Text>
                                      </Paper>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                      <Paper withBorder p="xs" style={{ textAlign: 'center' }}>
                                        <Text size="xl" fw={700} c="orange">
                                          {currentAnalysis?.flow_metrics?.outflow_count || 0}
                                        </Text>
                                        <Text size="xs" c="dimmed">Outflow</Text>
                                      </Paper>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                      <Paper withBorder p="xs" style={{ textAlign: 'center' }}>
                                        <Text size="xl" fw={700} c="green">
                                          {currentAnalysis?.flow_metrics?.net_flow || 0}
                                        </Text>
                                        <Text size="xs" c="dimmed">Net Flow</Text>
                                      </Paper>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                      <Paper withBorder p="xs" style={{ textAlign: 'center' }}>
                                        <Text size="xl" fw={700} c="violet">
                                          {(currentAnalysis?.flow_metrics?.density_level || 'low').charAt(0).toUpperCase() + (currentAnalysis?.flow_metrics?.density_level || 'low').slice(1)}
                                        </Text>
                                        <Text size="xs" c="dimmed">Density</Text>
                                      </Paper>
                                    </Grid.Col>
                                  </Grid>
                                </div>

                                {/* Future Forecast */}
                                <div>
                                  <Text size="sm" fw={600} c="orange" mb="xs">🔮 Future Forecast</Text>
                                  <Stack gap="xs">
                                    <Group justify="space-between">
                                      <Text size="sm">Incident Probability:</Text>
                                      <Badge 
                                        color={((cctvData?.[cam.id]?.future_forecast?.incident_probability || 0) * 100) >= 70 ? 'red' : 
                                               ((cctvData?.[cam.id]?.future_forecast?.incident_probability || 0) * 100) >= 40 ? 'orange' : 'green'} 
                                        size="sm"
                                      >
                                        {((cctvData?.[cam.id]?.future_forecast?.incident_probability || 0) * 100).toFixed(1)}%
                                      </Badge>
                                    </Group>
                                    <Group justify="space-between">
                                      <Text size="sm">Risk Level:</Text>
                                      <Badge 
                                        color={((cctvData?.[cam.id]?.future_forecast?.incident_probability || 0) * 100) >= 70 ? 'red' : 
                                               ((cctvData?.[cam.id]?.future_forecast?.incident_probability || 0) * 100) >= 40 ? 'orange' : 'green'} 
                                        size="sm"
                                      >
                                        {((cctvData?.[cam.id]?.future_forecast?.incident_probability || 0) * 100) >= 70 ? 'High' : 
                                         ((cctvData?.[cam.id]?.future_forecast?.incident_probability || 0) * 100) >= 40 ? 'Medium' : 'Low'}
                                      </Badge>
                                    </Group>
                                    <Group justify="space-between">
                                      <Text size="sm">Time to Incident:</Text>
                                      <Text size="sm" fw={500} c="orange">
                                        {(() => {
                                          const timeToIncident = cctvData[cam.id]?.future_forecast?.time_to_incident_seconds || 0;
                                          if (timeToIncident > 0) {
                                            const minutes = Math.floor(timeToIncident / 60);
                                            const seconds = timeToIncident % 60;
                                            return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                                          }
                                          return '--';
                                        })()}
                                      </Text>
                                    </Group>
                                  </Stack>
                                </div>

                                {/* Incident Details */}
                                <div>
                                  <Text size="sm" fw={600} c="red" mb="xs">⚠️ Incident Prediction Details</Text>
                                  <Stack gap="xs">
                                    <Group justify="space-between">
                                      <Text size="sm">Predicted Type:</Text>
                                      <Text size="sm" fw={500}>
                                        {(cctvData[cam.id]?.future_forecast?.predicted_incident_type || 'None').charAt(0).toUpperCase() + 
                                         (cctvData[cam.id]?.future_forecast?.predicted_incident_type || 'None').slice(1)}
                                      </Text>
                                    </Group>
                                    <Group justify="space-between">
                                      <Text size="sm">Alert Level:</Text>
                                      <Badge 
                                        color={cctvData[cam.id]?.future_forecast?.alert_level === 'red' ? 'red' : 
                                               cctvData[cam.id]?.future_forecast?.alert_level === 'yellow' ? 'yellow' : 'green'} 
                                        size="sm"
                                      >
                                        {(cctvData[cam.id]?.future_forecast?.alert_level || 'green').toUpperCase()}
                                      </Badge>
                                    </Group>
                                    {/* Risk Factors */}
                                    {cctvData[cam.id]?.future_forecast?.risk_factors && cctvData[cam.id].future_forecast.risk_factors.length > 0 && (
                                      <div>
                                        <Text size="sm" fw={600} c="red" mb="xs">Risk Factors:</Text>
                                        <Group gap="4px">
                                          {cctvData[cam.id].future_forecast.risk_factors.map((factor, idx) => (
                                            <Badge key={idx} color="red" size="xs">
                                              {factor.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </Badge>
                                          ))}
                                        </Group>
                                      </div>
                                    )}
                                  </Stack>
                                </div>
                              </Stack>
                            </div>
                          </Tabs.Panel>
                          </div>
                        </Tabs>
                      </div>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>
        </Stack>
        </Container>
      </AppShell.Main>

      <FloatingAssistant />

            {/* Edit Camera Modal */}
            <Modal 
              opened={editModalOpen} 
              onClose={() => setEditModalOpen(false)} 
              title={
                <Group gap="xs">
                  <IconPencil size={20} style={{ color: '#667eea' }} />
                  <Text fw={600}>Rename Camera</Text>
                </Group>
              }
              centered
              styles={{
                header: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                },
                title: {
                  color: 'white'
                }
              }}
            >
              <Stack gap="md">
                <TextInput
                  label="Camera Name"
                  placeholder="Enter camera name"
                  value={editCameraName}
                  onChange={(e) => setEditCameraName(e.currentTarget.value)}
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      border: '2px solid #e9ecef',
                      '&:focus': {
                        borderColor: '#667eea'
                      }
                    }
                  }}
                />
                <Group justify="flex-end" gap="md">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditModalOpen(false)}
                    size="md"
                    radius="md"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleEditSave} 
                    disabled={!editCameraName.trim()}
                    size="md"
                    radius="md"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: 600
                    }}
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </Modal>

            {/* Add Camera Modal */}
            <Modal 
              opened={addModalOpen} 
              onClose={() => setAddModalOpen(false)} 
              title={
                <Group gap="xs">
                  <IconPlus size={20} style={{ color: '#667eea' }} />
                  <Text fw={600}>Add New Camera</Text>
                </Group>
              }
              centered
              styles={{
                header: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                },
                title: {
                  color: 'white'
                }
              }}
            >
              <Stack gap="md">
                <TextInput
                  label="Camera Name"
                  placeholder="Enter camera name"
                  value={newCameraName}
                  onChange={(e) => setNewCameraName(e.currentTarget.value)}
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      border: '2px solid #e9ecef',
                      '&:focus': {
                        borderColor: '#667eea'
                      }
                    }
                  }}
                />
                <Group justify="flex-end" gap="md">
                  <Button 
                    variant="outline" 
                    onClick={() => setAddModalOpen(false)}
                    size="md"
                    radius="md"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddSave} 
                    disabled={!newCameraName.trim()}
                    size="md"
                    radius="md"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: 600
                    }}
                  >
                    Add Camera
                  </Button>
                </Group>
              </Stack>
            </Modal>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes criticalAlert {
          0%, 100% { background: rgba(239, 68, 68, 0.15); }
          50% { background: rgba(239, 68, 68, 0.25); }
        }
        
        @keyframes alertPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes detectPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        @keyframes alertBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </AppShell>
  );
}

export default CommandCenter;