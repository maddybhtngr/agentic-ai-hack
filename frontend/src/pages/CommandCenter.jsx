import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Stack, 
  AppShell, 
  ActionIcon, 
  Grid, 
  Badge, 
  Group, 
  Progress, 
  Tooltip, 
  NumberFormatter, 
  Modal, 
  TextInput, 
  Button 
} from '@mantine/core';
import { 
  IconDashboard, 
  IconUsers, 
  IconCalendar, 
  IconChartBar, 
  IconSettings, 
  IconAlertTriangle, 
  IconUser, 
  IconCamera, 
  IconVolume, 
  IconMaximize, 
  IconUserCircle, 
  IconUsersGroup, 
  IconEye, 
  IconActivity, 
  IconPencil, 
  IconPlus 
} from '@tabler/icons-react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import AppBar from '../components/AppBar';
import { useState } from 'react';

function CommandCenter() {
  const [opened, { toggle }] = useDisclosure();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([
    { id: 1, name: 'Camera 1' },
    { id: 2, name: 'Camera 2' },
    { id: 3, name: 'Camera 3' },
    { id: 4, name: 'Camera 4' },
    { id: 5, name: 'Camera 5' },
    { id: 6, name: 'Camera 6' },
  ]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editCameraId, setEditCameraId] = useState(null);
  const [editCameraName, setEditCameraName] = useState('');
  const [newCameraName, setNewCameraName] = useState('');

  const handleMenuClick = () => {
    toggle();
    console.log('Command Center menu clicked');
    // Add your menu logic here
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
      header={{ height: 70 }}
      navbar={{ 
        width: 300, 
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: isSmallScreen ? false : !opened }
      }}
      padding={0}
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <AppShell.Header style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <AppBar userName="Admin User" onMenuClick={handleMenuClick} opened={opened} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="xs">
            <ActionIcon
              variant="light"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconDashboard size={16} />}
              onClick={() => navigate('/admin/dashboard')}
            >
              <Text size="sm">Overview</Text>
            </ActionIcon>
            <ActionIcon
              variant="filled"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconEye size={16} />}
              onClick={() => navigate('/admin/dashboard/command')}
            >
              <Text size="sm">Command Center</Text>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconAlertTriangle size={16} />}
              onClick={() => navigate('/admin/Incident-management')}
            >
              <Text size="sm">Incident Management</Text>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconChartBar size={16} />}
            >
              <Text size="sm">Analytics</Text>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconSettings size={16} />}
            >
              <Text size="sm">Settings</Text>
            </ActionIcon>
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Text size="sm" c="dimmed">Admin Panel v1.0</Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container fluid px={50} pt={30}>
          <Stack spacing="xl">
            {/* Enhanced Header Section */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              padding: '32px',
              borderRadius: '20px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
            }}>
              <Group justify="space-between" align="center">
                <div>
                  <Title 
                    order={1} 
                    style={{
                      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      letterSpacing: '-0.025em'
                    }}
                  >
                    Command Center
                  </Title>
                  <Text size="lg" c="dimmed" mt="xs">
                    Real-time surveillance monitoring and crowd management
                  </Text>
                </div>
                <Group gap="md">
                  <Paper p="md" radius="xl" style={{
                    background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <Group gap="xs" align="center">
                      <IconActivity size={20} style={{ color: '#059669' }} />
                      <div>
                        <Text size="xs" c="dimmed" fw={500}>Active Cameras</Text>
                        <NumberFormatter value={cameras.length} thousandSeparator />
                      </div>
                    </Group>
                  </Paper>
                  <Paper p="md" radius="xl" style={{
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <Group gap="xs" align="center">
                      <IconUsers size={20} style={{ color: '#2563eb' }} />
                      <div>
                        <Text size="xs" c="dimmed" fw={500}>Total Detections</Text>
                        <NumberFormatter value={cameras.reduce((acc) => acc + Math.floor(Math.random() * 10) + 1, 0)} thousandSeparator />
                      </div>
                    </Group>
                  </Paper>
                </Group>
              </Group>
            </div>

            {/* Enhanced Operations Section */}
            <Group justify="space-between" align="center" mb="md">
              <Group gap="md" align="center">
                <Title 
                  order={2} 
                  size="h2" 
                  style={{
                    background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Live Operations
                </Title>
                <Badge 
                  color="red" 
                  variant="light" 
                  size="lg"
                  leftSection={
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#ef4444',
                      animation: 'pulse 2s infinite'
                    }} />
                  }
                >
                  LIVE
                </Badge>
              </Group>
              <Button 
                size="md" 
                leftSection={<IconPlus size={18} />} 
                onClick={handleAddCamera}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                }}
              >
                Add Camera
              </Button>
            </Group>

            {/* Enhanced Camera Grid */}
            <Grid gutter="xl">
              {cameras.map((cam, idx) => {
                // Simulate data for demo
                const density = Math.random();
                const faces = Math.floor(Math.random() * 10) + 1;
                const quality = Math.floor(Math.random() * 100) + 1;
                const alert = density > 0.8;
                const getDensityColor = (d) => {
                  if (d < 0.3) return 'teal';
                  if (d < 0.5) return 'blue';
                  if (d < 0.7) return 'yellow';
                  if (d < 0.9) return 'orange';
                  return 'red';
                };
                const densityLevel = (d) => {
                  if (d < 0.3) return 'Low';
                  if (d < 0.5) return 'Moderate';
                  if (d < 0.7) return 'High';
                  if (d < 0.9) return 'Very High';
                  return 'Critical';
                };
                return (
                  <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={cam.id}>
                    <Paper 
                      shadow="xl" 
                      p="lg" 
                      radius="xl" 
                      withBorder 
                      style={{ 
                        position: 'relative',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: alert ? '2px solid #ef4444' : '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: alert ? '0 20px 60px rgba(239, 68, 68, 0.15)' : '0 20px 60px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = alert ? '0 30px 80px rgba(239, 68, 68, 0.2)' : '0 30px 80px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = alert ? '0 20px 60px rgba(239, 68, 68, 0.15)' : '0 20px 60px rgba(0,0,0,0.08)';
                      }}
                    >
                      <Group justify="space-between" align="center" mb="md">
                        <Text fw={600} size="lg" c="dark">
                          {cam.name} 
                          <Badge
                            color="gray"
                            variant="light"
                            radius="xl"
                            style={{ 
                              marginLeft: 12, 
                              fontWeight: 600, 
                              fontSize: 11, 
                              letterSpacing: 1,
                              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                              border: '1px solid rgba(148, 163, 184, 0.3)'
                            }}
                          >
                            CAM-{String(idx + 1).padStart(2, '0')}
                          </Badge>
                        </Text>
                        <Tooltip label="Edit Camera" position="top">
                          <ActionIcon 
                            size="lg" 
                            variant="light" 
                            color="blue" 
                            onClick={() => handleEditClick(cam)}
                            style={{
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <IconPencil size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>

                      {/* Enhanced Video Container */}
                      <div style={{ 
                        position: 'relative', 
                        width: '100%', 
                        borderRadius: 16, 
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                        overflow: 'hidden', 
                        minHeight: 200,
                        border: '2px solid rgba(226, 232, 240, 0.5)',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
                      }}>
                        {/* Enhanced ALERT overlay */}
                        {alert && densityLevel(density) === 'Critical' && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'rgba(239, 68, 68, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 10,
                              pointerEvents: 'none',
                              animation: 'criticalAlert 1.5s infinite',
                              backdropFilter: 'blur(1px)'
                            }}
                          >
                            <div
                              style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: 20,
                                padding: '14px 28px',
                                borderRadius: 16,
                                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
                                letterSpacing: 2,
                                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                border: '2px solid rgba(255,255,255,0.9)',
                                animation: 'alertPulse 1.5s infinite',
                                backdropFilter: 'blur(10px)'
                              }}
                            >
                              ⚠️ CRITICAL ALERT
                            </div>
                          </div>
                        )}

                        {/* Enhanced top controls */}
                        <Group style={{ 
                          position: 'absolute', 
                          top: 12, 
                          left: 12, 
                          right: 12, 
                          zIndex: 3, 
                          justifyContent: 'space-between' 
                        }} gap={8}>
                          <Group gap={8}>
                            <Tooltip label="Audio Control">
                              <ActionIcon 
                                size="md" 
                                variant="light" 
                                color="gray" 
                                style={{
                                  background: 'rgba(255,255,255,0.9)',
                                  backdropFilter: 'blur(10px)',
                                  borderRadius: '50%'
                                }}
                              >
                                <IconVolume size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Fullscreen">
                              <ActionIcon 
                                size="md" 
                                variant="light" 
                                color="gray"
                                style={{
                                  background: 'rgba(255,255,255,0.9)',
                                  backdropFilter: 'blur(10px)',
                                  borderRadius: '50%'
                                }}
                              >
                                <IconMaximize size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                          <Badge
                            color="red"
                            variant="filled"
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 6,
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              padding: '8px 12px',
                              borderRadius: 20,
                              fontWeight: 600,
                              fontSize: 11,
                              letterSpacing: 0.5,
                              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                            }}
                            leftSection={
                              <div style={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                background: 'white',  
                                animation: 'livePulse 2s infinite'
                              }} />
                            }
                          >
                            Live
                          </Badge>
                        </Group>

                        {/* Enhanced detection boxes with better styling */}
                        {Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map((_, i) => (
                          <div
                            key={`face-${i}`}
                            style={{
                              position: 'absolute',
                              border: BOX_COLORS.face,
                              boxShadow: BOX_SHADOWS.face,
                              left: `${10 + Math.random() * 60}%`,
                              top: `${10 + Math.random() * 60}%`,
                              width: '14%',
                              height: '18%',
                              borderRadius: 8,
                              pointerEvents: 'none',
                              zIndex: 2,
                              background: 'rgba(51, 154, 240, 0.1)',
                              animation: 'detectPulse 3s infinite'
                            }}
                          >
                            <div style={{
                              position: 'absolute',
                              top: -20,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                              borderRadius: '50%',
                              boxShadow: '0 4px 20px rgba(51, 154, 240, 0.25)',
                              padding: 4,
                              border: '2px solid #339af0'
                            }}>
                              <IconUserCircle size={16} color="#339af0" />
                            </div>
                          </div>
                        ))}

                        {Array.from({ length: Math.floor(Math.random() * 2) }).map((_, i) => (
                          <div
                            key={`group-${i}`}
                            style={{
                              position: 'absolute',
                              border: BOX_COLORS.group,
                              boxShadow: BOX_SHADOWS.group,
                              left: `${20 + Math.random() * 50}%`,
                              top: `${20 + Math.random() * 50}%`,
                              width: '22%',
                              height: '22%',
                              borderRadius: 6,
                              pointerEvents: 'none',
                              zIndex: 2,
                              background: 'rgba(81, 207, 102, 0.1)',
                              animation: 'detectPulse 3s infinite'
                            }}
                          >
                            <div style={{
                              position: 'absolute',
                              top: -20,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                              borderRadius: '50%',
                              boxShadow: '0 4px 20px rgba(81, 207, 102, 0.25)',
                              padding: 4,
                              border: '2px solid #51cf66'
                            }}>
                              <IconUsersGroup size={16} color="#51cf66" />
                            </div>
                          </div>
                        ))}

                        {Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map((_, i) => (
                          <div
                            key={`person-${i}`}
                            style={{
                              position: 'absolute',
                              border: BOX_COLORS.person,
                              boxShadow: BOX_SHADOWS.person,
                              left: `${5 + Math.random() * 70}%`,
                              top: `${5 + Math.random() * 70}%`,
                              width: '10%',
                              height: '22%',
                              borderRadius: 8,
                              pointerEvents: 'none',
                              zIndex: 2,
                              background: 'rgba(255, 140, 66, 0.1)',
                              animation: 'detectPulse 3s infinite'
                            }}
                          >
                            <div style={{
                              position: 'absolute',
                              top: -20,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                              borderRadius: '50%',
                              boxShadow: '0 4px 20px rgba(255, 140, 66, 0.25)',
                              padding: 4,
                              border: '2px solid #ff8c42'
                            }}>
                              <IconUser size={16} color="#ff8c42" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Enhanced Info Badges */}
                      <Group mt="lg" gap="xs" align="center" wrap="wrap">
                        <Badge 
                          color={getDensityColor(density)} 
                          variant="gradient"
                          gradient={{ from: getDensityColor(density), to: getDensityColor(density), deg: 135 }}
                          size="md"
                          style={{
                            fontWeight: 600,
                            letterSpacing: 0.5,
                            boxShadow: `0 4px 15px rgba(${getDensityColor(density) === 'red' ? '239, 68, 68' : '59, 130, 246'}, 0.2)`
                          }}
                        >
                          {densityLevel(density)} Density
                        </Badge>
                        <Badge 
                          leftSection={<IconUser size={14} />} 
                          color="indigo" 
                          variant="light"
                          size="md"
                          style={{
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                            fontWeight: 500
                          }}
                        >
                          {faces} Faces
                        </Badge>
                        <Badge 
                          leftSection={<IconCamera size={14} />} 
                          color={quality > 70 ? 'teal' : quality > 40 ? 'yellow' : 'red'} 
                          variant="light"
                          size="md"
                          style={{ fontWeight: 500 }}
                        >
                          {quality}% Quality
                        </Badge>
                        {alert && (
                          <Badge 
                            leftSection={<IconAlertTriangle size={14} />} 
                            color="red" 
                            variant="gradient"
                            gradient={{ from: 'red', to: 'pink', deg: 135 }}
                            size="md"
                            style={{
                              fontWeight: 600,
                              animation: 'alertBadge 2s infinite',
                              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                            }}
                          >
                            Critical Alert
                          </Badge>
                        )}
                      </Group>
                      
                      {/* Enhanced Progress Bar */}
                      <Progress 
                        value={density * 100} 
                        color={getDensityColor(density)} 
                        size="md" 
                        mt="md" 
                        radius="xl"
                        style={{
                          background: 'rgba(226, 232, 240, 0.5)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      />
                    </Paper>
                  </Grid.Col>
                );
              })}
            </Grid>

            {/* Edit Camera Modal */}
            <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Rename Camera" centered>
              <TextInput
                label="Camera Name"
                value={editCameraName}
                onChange={e => setEditCameraName(e.target.value)}
                autoFocus
              />
              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleEditSave} disabled={!editCameraName.trim()}>Save</Button>
              </Group>
            </Modal>
            {/* Add Camera Modal */}
            <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Camera" centered>
              <TextInput
                label="Camera Name"
                value={newCameraName}
                onChange={e => setNewCameraName(e.target.value)}
                autoFocus
              />
              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSave} disabled={!newCameraName.trim()}>Add</Button>
              </Group>
            </Modal>
          </Stack>
        </Container>
      </AppShell.Main>

      {/* Add CSS animations */}
      <style jsx>{`
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
      `}</style>
    </AppShell>
  );
}

export default CommandCenter;