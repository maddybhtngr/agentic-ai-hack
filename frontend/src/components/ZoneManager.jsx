import { useState, useEffect } from 'react';
import { 
  Modal, 
  TextInput, 
  NumberInput, 
  Button, 
  Group, 
  Stack, 
  Text, 
  Paper,
  ActionIcon,
  Table,
  Badge,
  Select,
  Divider,
  Title,
  rem,
  Box,
  Alert,
  LoadingOverlay
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconMap, 
  IconSettings, 
  IconInfoCircle, 
  IconShieldLock
} from '@tabler/icons-react';
import { apiService } from '../services/api';

const ZoneManager = ({ zones, onZonesChange, opened, onClose }) => {
  const [editingZone, setEditingZone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiZones, setApiZones] = useState([]);
  const [zoneTypes, setZoneTypes] = useState([]);
  
  const [newZone, setNewZone] = useState({
    name: '',
    zoneType: 'general',
    // Visual coordinates (for heat map display)
    x: 10,
    y: 10,
    width: 15,
    height: 15,
    // GPS coordinates (for backend processing)
    centerLat: 0,
    centerLng: 0,
    radius: 50, // meters
    maxCapacity: 100
  });

  // Fetch zones and zone types from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [zonesData, typesData] = await Promise.all([
          apiService.getAllZones(),
          apiService.getZoneTypes()
        ]);
        
        setApiZones(zonesData);
        setZoneTypes(typesData.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ') })));
        
        // Update parent component with API zones only when modal opens
        if (opened) {
          onZonesChange(zonesData);
        }
      } catch (err) {
        console.error('Error fetching zones:', err);
        setError('Failed to load zones from server');
      } finally {
        setLoading(false);
      }
    };

    if (opened) {
      fetchData();
    }
  }, [opened]); // Removed onZonesChange from dependencies

  const handleAddZone = async () => {
    if (newZone.name.trim()) {
      setLoading(true);
      try {
        const createdZone = await apiService.createZone({
          name: newZone.name,
          zoneType: newZone.zoneType,
          x: newZone.x,
          y: newZone.y,
          width: newZone.width,
          height: newZone.height,
          centerLat: newZone.centerLat,
          centerLng: newZone.centerLng,
          radius: newZone.radius,
          maxCapacity: newZone.maxCapacity
        });
        
        setApiZones([...apiZones, createdZone]);
        onZonesChange([...apiZones, createdZone]);
        
        setNewZone({ 
          name: '', 
          zoneType: 'general',
          x: 10,
          y: 10,
          width: 15,
          height: 15,
          centerLat: 0, 
          centerLng: 0, 
          radius: 50,
          maxCapacity: 100 
        });
      } catch (err) {
        console.error('Error creating zone:', err);
        setError('Failed to create zone');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
  };

  const handleSaveEdit = async () => {
    if (editingZone && editingZone.name.trim()) {
      setLoading(true);
      try {
        const updatedZone = await apiService.updateZone(editingZone.id, {
          name: editingZone.name,
          zoneType: editingZone.zoneType,
          x: editingZone.x,
          y: editingZone.y,
          width: editingZone.width,
          height: editingZone.height,
          centerLat: editingZone.centerLat,
          centerLng: editingZone.centerLng,
          radius: editingZone.radius,
          maxCapacity: editingZone.maxCapacity
        });
        
        const updatedZones = apiZones.map(zone => 
          zone.id === editingZone.id ? updatedZone : zone
        );
        setApiZones(updatedZones);
        onZonesChange(updatedZones);
        setEditingZone(null);
      } catch (err) {
        console.error('Error updating zone:', err);
        setError('Failed to update zone');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteZone = async (zoneId) => {
    setLoading(true);
    try {
      await apiService.deleteZone(zoneId);
      const updatedZones = apiZones.filter(zone => zone.id !== zoneId);
      setApiZones(updatedZones);
      onZonesChange(updatedZones);
    } catch (err) {
      console.error('Error deleting zone:', err);
      setError('Failed to delete zone');
    } finally {
      setLoading(false);
    }
  };

  const formatCoordinate = (coord) => {
    return coord.toFixed(6);
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={
        <Group gap="xs">
          <IconMap size={20} style={{ color: '#667eea' }} />
          <Text fw={600}>Zone Management</Text>
        </Group>
      }
      size="xl"
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
      <Stack gap="xl">
        {/* Info Alert */}
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          title="Zone Configuration" 
          color="blue" 
          variant="light"
          style={{
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}
        >
          Configure zones for crowd monitoring. Visual coordinates are used for heat map display, while GPS coordinates enable precise location tracking.
        </Alert>

        {/* Add New Zone */}
        <Paper 
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

          <Stack gap="lg">
            <Group gap="xs">
              <IconPlus size={20} style={{ color: '#667eea' }} />
              <Title order={4} style={{ fontWeight: 600 }}>
                Add New Zone
              </Title>
            </Group>

            <Stack gap="md">
              <Group grow>
                <TextInput
                  label="Zone Name"
                  placeholder="e.g., VIP Area"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
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
                <Select
                  label="Zone Type"
                  placeholder="Select zone type"
                  data={zoneTypes}
                  value={newZone.zoneType}
                  onChange={(value) => setNewZone({ ...newZone, zoneType: value })}
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
              </Group>
              
              <Divider 
                label={
                  <Group gap="xs">
                    <IconMap size={14} />
                    <Text size="sm" fw={600}>Visual Position (Heat Map Display)</Text>
                  </Group>
                } 
                labelPosition="center" 
              />
              
              <Group grow>
                <NumberInput
                  label="X Position (%)"
                  placeholder="0-100"
                  min={0}
                  max={100}
                  value={newZone.x}
                  onChange={(value) => setNewZone({ ...newZone, x: value || 0 })}
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
                <NumberInput
                  label="Y Position (%)"
                  placeholder="0-100"
                  min={0}
                  max={100}
                  value={newZone.y}
                  onChange={(value) => setNewZone({ ...newZone, y: value || 0 })}
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
              </Group>
              <Group grow>
                <NumberInput
                  label="Width (%)"
                  placeholder="1-100"
                  min={1}
                  max={100}
                  value={newZone.width}
                  onChange={(value) => setNewZone({ ...newZone, width: value || 15 })}
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
                <NumberInput
                  label="Height (%)"
                  placeholder="1-100"
                  min={1}
                  max={100}
                  value={newZone.height}
                  onChange={(value) => setNewZone({ ...newZone, height: value || 15 })}
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
              </Group>


              <Divider 
                label={
                  <Group gap="xs">
                    <IconShieldLock size={14} />
                    <Text size="sm" fw={600}>GPS Coordinates (Location Tracking)</Text>
                  </Group>
                } 
                labelPosition="center" 
              />
              
              <Group grow>
                <NumberInput
                  label="Center Latitude"
                  placeholder="e.g., 40.7128"
                  decimalScale={6}
                  value={newZone.centerLat}
                  onChange={(value) => setNewZone({ ...newZone, centerLat: value || 0 })}
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
                <NumberInput
                  label="Center Longitude"
                  placeholder="e.g., -74.0060"
                  decimalScale={6}
                  value={newZone.centerLng}
                  onChange={(value) => setNewZone({ ...newZone, centerLng: value || 0 })}
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
              </Group>
              <Group grow>
                <NumberInput
                  label="Radius (meters)"
                  placeholder="50"
                  min={1}
                  max={1000}
                  value={newZone.radius}
                  onChange={(value) => setNewZone({ ...newZone, radius: value || 50 })}
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
                <NumberInput
                  label="Max Capacity"
                  placeholder="100"
                  min={1}
                  max={10000}
                  value={newZone.maxCapacity}
                  onChange={(value) => setNewZone({ ...newZone, maxCapacity: value || 100 })}
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
              </Group>
              
              <Button 
                leftSection={<IconPlus size={16} />}
                onClick={handleAddZone}
                disabled={!newZone.name.trim()}
                size="md"
                radius="md"
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
                Add Zone
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Edit Zone Modal */}
        {editingZone && (
          <Modal 
            opened={!!editingZone} 
            onClose={() => setEditingZone(null)} 
            title={
              <Group gap="xs">
                <IconEdit size={20} style={{ color: '#667eea' }} />
                <Text fw={600}>Edit Zone</Text>
              </Group>
            }
            size="lg"
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
              <Group grow>
                <TextInput
                  label="Zone Name"
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
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
                <Select
                  label="Zone Type"
                  data={zoneTypes}
                  value={editingZone.zoneType}
                  onChange={(value) => setEditingZone({ ...editingZone, zoneType: value })}
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
              </Group>
              
              <Divider 
                label={
                  <Group gap="xs">
                    <IconMap size={14} />
                    <Text size="sm" fw={600}>Visual Position</Text>
                  </Group>
                } 
                labelPosition="center" 
              />
              
              <Group grow>
                <NumberInput
                  label="X Position (%)"
                  min={0}
                  max={100}
                  value={editingZone.x}
                  onChange={(value) => setEditingZone({ ...editingZone, x: value || 0 })}
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
                <NumberInput
                  label="Y Position (%)"
                  min={0}
                  max={100}
                  value={editingZone.y}
                  onChange={(value) => setEditingZone({ ...editingZone, y: value || 0 })}
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
              </Group>
              <Group grow>
                <NumberInput
                  label="Width (%)"
                  min={1}
                  max={100}
                  value={editingZone.width}
                  onChange={(value) => setEditingZone({ ...editingZone, width: value || 20 })}
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
                <NumberInput
                  label="Height (%)"
                  min={1}
                  max={100}
                  value={editingZone.height}
                  onChange={(value) => setEditingZone({ ...editingZone, height: value || 20 })}
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
              </Group>

              <Divider 
                label={
                  <Group gap="xs">
                    <IconShieldLock size={14} />
                    <Text size="sm" fw={600}>GPS Coordinates</Text>
                  </Group>
                } 
                labelPosition="center" 
              />
              
              <Group grow>
                <NumberInput
                  label="Center Latitude"
                  decimalScale={6}
                  value={editingZone.centerLat}
                  onChange={(value) => setEditingZone({ ...editingZone, centerLat: value || 0 })}
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
                <NumberInput
                  label="Center Longitude"
                  decimalScale={6}
                  value={editingZone.centerLng}
                  onChange={(value) => setEditingZone({ ...editingZone, centerLng: value || 0 })}
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
              </Group>
              <Group grow>
                <NumberInput
                  label="Radius (meters)"
                  min={1}
                  max={1000}
                  value={editingZone.radius}
                  onChange={(value) => setEditingZone({ ...editingZone, radius: value || 50 })}
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
                <NumberInput
                  label="Max Capacity"
                  min={1}
                  max={10000}
                  value={editingZone.maxCapacity}
                  onChange={(value) => setEditingZone({ ...editingZone, maxCapacity: value || 100 })}
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
              </Group>
              <Group justify="flex-end" gap="md">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingZone(null)}
                  size="md"
                  radius="md"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
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
        )}

        {/* Existing Zones Table */}
        <Paper 
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
          <LoadingOverlay visible={loading} />
          
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

          <Stack gap="lg">
            <Group gap="xs">
              <IconSettings size={20} style={{ color: '#667eea' }} />
              <Title order={4} style={{ fontWeight: 600 }}>
                Existing Zones ({apiZones.length})
              </Title>
            </Group>

            {error && (
              <Alert 
                icon={<IconInfoCircle size={16} />} 
                title="Error" 
                color="red"
                variant="light"
              >
                {error}
              </Alert>
            )}

            <Box style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Zone Name</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Visual Position</Table.Th>
                    <Table.Th>Dimensions</Table.Th>
                    <Table.Th>GPS Coordinates</Table.Th>
                    <Table.Th>Capacity</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {apiZones.map((zone) => (
                    <Table.Tr key={zone.id}>
                      <Table.Td>
                        <Text fw={600}>{zone.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          variant="light" 
                          size="sm"
                          style={{
                            background: 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                          }}
                        >
                          {zoneTypes.find(t => t.value === zone.zoneType)?.label || zone.zoneType}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          X: {zone.x}%, Y: {zone.y}%
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          W: {zone.width || 15}%, H: {zone.height || 15}%
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {formatCoordinate(zone.centerLat)}, {formatCoordinate(zone.centerLng)}<br />
                          <Badge 
                            variant="light" 
                            size="xs"
                            style={{
                              background: 'rgba(34, 197, 94, 0.1)',
                              color: '#22c55e',
                              border: '1px solid rgba(34, 197, 94, 0.2)'
                            }}
                          >
                            {zone.radius}m radius
                          </Badge>
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          variant="light" 
                          size="sm"
                          style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                          }}
                        >
                          {zone.maxCapacity}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon 
                            size="sm" 
                            variant="light" 
                            color="blue"
                            onClick={() => handleEditZone(zone)}
                            style={{
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              border: '1px solid rgba(102, 126, 234, 0.2)',
                              '&:hover': {
                                background: 'rgba(102, 126, 234, 0.2)'
                              }
                            }}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon 
                            size="sm" 
                            variant="light" 
                            color="red"
                            onClick={() => handleDeleteZone(zone.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              '&:hover': {
                                background: 'rgba(239, 68, 68, 0.2)'
                              }
                            }}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Modal>
  );
};

export default ZoneManager; 