import { Container, Title, Text, Paper, Stack, AppShell, ActionIcon, Grid, Badge, Group, Progress } from '@mantine/core';
import { IconDashboard, IconUsers, IconCalendar, IconChartBar, IconSettings, IconAlertTriangle, IconUser, IconCamera, IconLivePhoto, IconVolume, IconVolumeOff, IconMaximize, IconUserCircle, IconUsersGroup } from '@tabler/icons-react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import AppBar from '../components/AppBar';
import { useMemo, useState } from 'react';
import { Modal, TextInput, Button } from '@mantine/core';
import { IconPencil, IconPlus } from '@tabler/icons-react';

function CommandCenter() {
  const [opened, { toggle }] = useDisclosure();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

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

  // Add color constants for box types
  const BOX_COLORS = {
    face: '2px solid #4dabf7', // blue
    group: '2px solid #51cf66', // green
    person: '2px solid #ff922b', // orange
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
    >
      <AppShell.Header>
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
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconCalendar size={16} />}
              onClick={() => navigate('/admin/dashboard/command')}
            >
              <Text size="sm">Command center</Text>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              style={{ justifyContent: 'flex-start', width: '100%' }}
              leftSection={<IconAlertTriangle size={16} />}
              onClick={() => navigate('/admin/Incident-management')}
            >
              <Text size="sm">Incident management</Text>
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
        <Container fluid p={0} style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20 }}>
          <Stack spacing="xl">
            <Title order={1}>Command Center</Title>
            {/* Remove the Paper with Command Center Content and description */}
            {/* Camera Grid */}
            <Group justify="space-between" align="center" mb="md" mt="xl">
              <Title order={2} size="h3" m={0}>Operations</Title>
              <Button size="compact-sm" leftSection={<IconPlus size={14} />} onClick={handleAddCamera}>
                Add Camera
              </Button>
            </Group>
            <Grid gutter="md">
              {cameras.map((cam, idx) => {
                // Simulate data for demo
                const density = Math.random();
                const faces = Math.floor(Math.random() * 10) + 1;
                const quality = Math.floor(Math.random() * 100) + 1;
                const alert = density > 0.8;
                const getDensityColor = (d) => {
                  if (d < 0.3) return 'blue';
                  if (d < 0.5) return 'green';
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
                    <Paper shadow="sm" p="md" radius="md" withBorder style={{ position: 'relative' }}>
                      <Group justify="space-between" align="center" mb="xs">
                        <Text fw={500}>
                          {cam.name} 
                          <Badge
                            color="gray"
                            variant="outline"
                            radius="xl"
                            style={{ marginLeft: 8, fontWeight: 500, fontSize: 13, letterSpacing: 1 }}
                          >
                            CAM-{String(idx + 1).padStart(2, '0')}
                          </Badge>
                        </Text>
                        <ActionIcon size="sm" variant="light" color="blue" onClick={() => handleEditClick(cam)}>
                          <IconPencil size={16} />
                        </ActionIcon>
                      </Group>
                      {/* Video with overlayed detection boxes and controls */}
                      <div style={{ position: 'relative', width: '100%', borderRadius: 8, background: '#fff', overflow: 'hidden', minHeight: 180 }}>
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
                        <Group style={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 3, justifyContent: 'space-between' }} gap={4}>
                          <Group gap={4}>
                            <ActionIcon size="sm" variant="light" color="gray" aria-label="Toggle volume">
                              <IconVolume size={16} />
                            </ActionIcon>
                            <ActionIcon size="sm" variant="light" color="gray" aria-label="Expand video">
                              <IconMaximize size={16} />
                            </ActionIcon>
                          </Group>
                          <Badge
                            color="red"
                            variant="filled"
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            leftSection={<span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'white', marginRight: 4 }} />}
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
                      <Group mt="sm" gap="xs" align="center">
                        <Badge color={getDensityColor(density)} variant="filled">
                          Density: {densityLevel(density)}
                        </Badge>
                        <Badge leftSection={<IconUser size={14} />} color="gray" variant="light">
                          Faces: {faces}
                        </Badge>
                        <Badge leftSection={<IconCamera size={14} />} color={quality > 70 ? 'green' : quality > 40 ? 'yellow' : 'red'} variant="light">
                          Quality: {quality}%
                        </Badge>
                        {alert && (
                          <Badge leftSection={<IconAlertTriangle size={14} />} color="red" variant="filled">
                            Alert: High Crowd
                          </Badge>
                        )}
                      </Group>
                      <Progress value={density * 100} color={getDensityColor(density)} size="xs" mt="xs" />
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
    </AppShell>
  );
}

export default CommandCenter; 