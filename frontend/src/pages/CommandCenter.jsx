import { Container, Title, Text, Paper, Stack, AppShell, Grid, Badge, Group, Progress, ActionIcon, rem, Card } from '@mantine/core';
import { IconUser, IconCamera, IconLivePhoto, IconVolume, IconVolumeOff, IconMaximize, IconUserCircle, IconUsersGroup, IconAlertTriangle, IconVideo, IconActivity, IconTrash } from '@tabler/icons-react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import AppBar from '../components/AppBar';
import Sidebar from '../components/Sidebar';
import FloatingAssistant from '../components/FloatingAssistant';
import { useMemo, useState } from 'react';
import { Modal, TextInput, Button } from '@mantine/core';
import { IconPencil, IconPlus } from '@tabler/icons-react';

function CommandCenter() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  // Camera state
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
                <IconVideo size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Command Center
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Real-time surveillance and crowd monitoring operations
              </Text>
            </Stack>

            {/* Operations Header */}
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
                      Operations
                    </Title>
                    <Text size="sm" c="dimmed">
                      Live camera feeds and detection monitoring
                    </Text>
                  </Stack>
                </Group>
                
                <Button 
                  size="md"
                  radius="md"
                  leftSection={<IconPlus size={16} />} 
                  onClick={handleAddCamera}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                      },
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  Add Camera
                </Button>
              </Group>
            </Paper>

            {/* Camera Grid */}
            <Grid gutter="lg">
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
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={cam.id}>
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
                      <Card.Section>
                        {/* Video Container */}
                        <div style={{ 
                          position: 'relative', 
                          width: '100%', 
                          borderRadius: `${rem(12)} ${rem(12)} 0 0`, 
                          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          overflow: 'hidden', 
                          minHeight: 200,
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          {/* ALERT DETECTED overlay animation */}
                          {alert && densityLevel(density) === 'Critical' && (
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
                          
                          {/* Top controls row: volume, expand, live */}
                          <Group style={{ 
                            position: 'absolute', 
                            top: 8, 
                            left: 8, 
                            right: 8, 
                            zIndex: 3, 
                            justifyContent: 'space-between' 
                          }} gap={4}>
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
                                  marginRight: 4 
                                }} />
                              }
                            >
                              Live
                            </Badge>
                          </Group>

                          {/* Simulated detection boxes */}
                          {Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map((_, i) => (
                            <div
                              key={`face-${i}`}
                              style={{
                                position: 'absolute',
                                border: BOX_COLORS.face,
                                left: `${10 + Math.random() * 60}%`,
                                top: `${10 + Math.random() * 60}%`,
                                width: '12%',
                                height: '16%',
                                borderRadius: 4,
                                pointerEvents: 'none',
                                zIndex: 2,
                                background: 'transparent',
                              }}
                              title="Face"
                            >
                              <div style={{
                                position: 'absolute',
                                top: -18,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#fff',
                                borderRadius: '50%',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                padding: 2,
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <IconUserCircle size={18} color="#228be6" />
                              </div>
                            </div>
                          ))}
                          {Array.from({ length: Math.floor(Math.random() * 2) }).map((_, i) => (
                            <div
                              key={`group-${i}`}
                              style={{
                                position: 'absolute',
                                border: BOX_COLORS.group,
                                left: `${20 + Math.random() * 50}%`,
                                top: `${20 + Math.random() * 50}%`,
                                width: '22%',
                                height: '22%',
                                borderRadius: 6,
                                pointerEvents: 'none',
                                zIndex: 2,
                                background: 'transparent',
                              }}
                              title="Group"
                            >
                              <div style={{
                                position: 'absolute',
                                top: -18,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#fff',
                                borderRadius: '50%',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                padding: 2,
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <IconUsersGroup size={18} color="#40c057" />
                              </div>
                            </div>
                          ))}
                          {Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map((_, i) => (
                            <div
                              key={`person-${i}`}
                              style={{
                                position: 'absolute',
                                border: BOX_COLORS.person,
                                left: `${5 + Math.random() * 70}%`,
                                top: `${5 + Math.random() * 70}%`,
                                width: '10%',
                                height: '22%',
                                borderRadius: 8,
                                pointerEvents: 'none',
                                zIndex: 2,
                                background: 'transparent',
                              }}
                              title="Person"
                            >
                              <div style={{
                                position: 'absolute',
                                top: -18,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#fff',
                                borderRadius: '50%',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                padding: 2,
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <IconUser size={18} color="#fd7e14" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card.Section>

                      <Group justify="space-between" mt="md" mb="xs">
                        <Text fw={500} size="sm">{cam.name}</Text>
                        <Group gap="xs">
                          <Badge
                            variant="light"
                            size="sm"
                            style={{
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              border: '1px solid rgba(102, 126, 234, 0.2)',
                              fontWeight: 500,
                              fontSize: 12,
                              letterSpacing: 1
                            }}
                          >
                            CAM-{String(idx + 1).padStart(2, '0')}
                          </Badge>
                          <ActionIcon 
                            size="sm" 
                            variant="light" 
                            color="blue" 
                            onClick={() => handleEditClick(cam)}
                            style={{
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              border: '1px solid rgba(102, 126, 234, 0.2)',
                              '&:hover': {
                                background: 'rgba(102, 126, 234, 0.2)'
                              }
                            }}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                          <ActionIcon 
                            size="sm" 
                            variant="light" 
                            color="red" 
                            onClick={() => handleDeleteCamera(cam.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              '&:hover': {
                                background: 'rgba(239, 68, 68, 0.2)'
                              }
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      <Stack gap="sm" mb="md">
                        <Group gap="xs" align="center">
                          <Badge 
                            color={getDensityColor(density)} 
                            variant="light"
                            style={{
                              background: `rgba(${getDensityColor(density) === 'blue' ? '102, 126, 234' : 
                                                   getDensityColor(density) === 'green' ? '34, 197, 94' :
                                                   getDensityColor(density) === 'yellow' ? '245, 158, 11' :
                                                   getDensityColor(density) === 'orange' ? '251, 146, 60' : '239, 68, 68'}, 0.1)`,
                              color: `rgb(${getDensityColor(density) === 'blue' ? '102, 126, 234' : 
                                           getDensityColor(density) === 'green' ? '34, 197, 94' :
                                           getDensityColor(density) === 'yellow' ? '245, 158, 11' :
                                           getDensityColor(density) === 'orange' ? '251, 146, 60' : '239, 68, 68'})`,
                              border: `1px solid rgba(${getDensityColor(density) === 'blue' ? '102, 126, 234' : 
                                                       getDensityColor(density) === 'green' ? '34, 197, 94' :
                                                       getDensityColor(density) === 'yellow' ? '245, 158, 11' :
                                                       getDensityColor(density) === 'orange' ? '251, 146, 60' : '239, 68, 68'}, 0.2)`
                            }}
                          >
                            Density: {densityLevel(density)}
                          </Badge>
                          <Badge 
                            leftSection={<IconUser size={14} />} 
                            variant="light"
                            style={{
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}
                          >
                            Faces: {faces}
                          </Badge>
                        </Group>
                        
                        <Progress 
                          value={density * 100} 
                          color={getDensityColor(density)} 
                          size="sm" 
                          radius="md"
                          style={{
                            height: rem(6)
                          }}
                        />
                      </Stack>


                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>

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
                  value={editCameraName}
                  onChange={e => setEditCameraName(e.target.value)}
                  autoFocus
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      borderColor: '#e9ecef',
                      '&:focus': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 1px #667eea'
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
                    Save
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
                  <Text fw={600}>Add Camera</Text>
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
                  value={newCameraName}
                  onChange={e => setNewCameraName(e.target.value)}
                  autoFocus
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      borderColor: '#e9ecef',
                      '&:focus': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 1px #667eea'
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
                    Add
                  </Button>
                </Group>
              </Stack>
            </Modal>
          </Stack>
        </Container>
        <FloatingAssistant />
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