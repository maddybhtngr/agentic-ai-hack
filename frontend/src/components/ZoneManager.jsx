import { useState } from 'react';
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
  Divider
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

const ZoneManager = ({ zones, onZonesChange, opened, onClose }) => {
  const [editingZone, setEditingZone] = useState(null);
  const [newZone, setNewZone] = useState({
    name: '',
    zoneType: 'general',
    // Visual coordinates (for heat map display)
    x: 10,
    y: 10,
    width: 20,
    height: 20,
    // GPS coordinates (for backend processing)
    centerLat: 0,
    centerLng: 0,
    radius: 50, // meters
    maxCapacity: 100
  });

  const zoneTypes = [
    { value: 'entrance', label: 'Entrance' },
    { value: 'exit', label: 'Exit' },
    { value: 'seating', label: 'Seating Area' },
    { value: 'food_court', label: 'Food Court' },
    { value: 'rest_area', label: 'Rest Area' },
    { value: 'vip_area', label: 'VIP Area' },
    { value: 'stage_area', label: 'Stage Area' },
    { value: 'parking', label: 'Parking' },
    { value: 'emergency', label: 'Emergency Exit' },
    { value: 'general', label: 'General Area' }
  ];

  const handleAddZone = () => {
    if (newZone.name.trim()) {
      const zone = {
        id: Date.now(),
        ...newZone,
        createdAt: new Date().toISOString()
      };
      onZonesChange([...zones, zone]);
      setNewZone({ 
        name: '', 
        zoneType: 'general',
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        centerLat: 0, 
        centerLng: 0, 
        radius: 50,
        maxCapacity: 100 
      });
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
  };

  const handleSaveEdit = () => {
    if (editingZone && editingZone.name.trim()) {
      const updatedZones = zones.map(zone => 
        zone.id === editingZone.id ? editingZone : zone
      );
      onZonesChange(updatedZones);
      setEditingZone(null);
    }
  };

  const handleDeleteZone = (zoneId) => {
    const updatedZones = zones.filter(zone => zone.id !== zoneId);
    onZonesChange(updatedZones);
  };

  const formatCoordinate = (coord) => {
    return coord.toFixed(6);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Zone Management" size="lg">
      <Stack gap="lg">
        {/* Add New Zone */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={500} mb="md">Add New Zone</Text>
          <Stack gap="sm">
            <TextInput
              label="Zone Name"
              placeholder="e.g., VIP Area"
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
            />
            <Select
              label="Zone Type"
              placeholder="Select zone type"
              data={zoneTypes}
              value={newZone.zoneType}
              onChange={(value) => setNewZone({ ...newZone, zoneType: value })}
            />
            
            <Divider label="Visual Position (for heat map display)" labelPosition="center" />
            <Group grow>
              <NumberInput
                label="X Position (%)"
                placeholder="0-100"
                min={0}
                max={100}
                value={newZone.x}
                onChange={(value) => setNewZone({ ...newZone, x: value || 0 })}
              />
              <NumberInput
                label="Y Position (%)"
                placeholder="0-100"
                min={0}
                max={100}
                value={newZone.y}
                onChange={(value) => setNewZone({ ...newZone, y: value || 0 })}
              />
            </Group>
            <Group grow>
              <NumberInput
                label="Width (%)"
                placeholder="0-100"
                min={1}
                max={100}
                value={newZone.width}
                onChange={(value) => setNewZone({ ...newZone, width: value || 20 })}
              />
              <NumberInput
                label="Height (%)"
                placeholder="0-100"
                min={1}
                max={100}
                value={newZone.height}
                onChange={(value) => setNewZone({ ...newZone, height: value || 20 })}
              />
            </Group>

            <Divider label="GPS Coordinates (for backend processing)" labelPosition="center" />
            <Group grow>
              <NumberInput
                label="Center Latitude"
                placeholder="e.g., 40.7128"
                decimalScale={6}
                value={newZone.centerLat}
                onChange={(value) => setNewZone({ ...newZone, centerLat: value || 0 })}
              />
              <NumberInput
                label="Center Longitude"
                placeholder="e.g., -74.0060"
                decimalScale={6}
                value={newZone.centerLng}
                onChange={(value) => setNewZone({ ...newZone, centerLng: value || 0 })}
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
              />
              <NumberInput
                label="Max Capacity"
                placeholder="100"
                min={1}
                max={10000}
                value={newZone.maxCapacity}
                onChange={(value) => setNewZone({ ...newZone, maxCapacity: value || 100 })}
              />
            </Group>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={handleAddZone}
              disabled={!newZone.name.trim()}
            >
              Add Zone
            </Button>
          </Stack>
        </Paper>

        {/* Edit Zone Modal */}
        {editingZone && (
          <Modal 
            opened={!!editingZone} 
            onClose={() => setEditingZone(null)} 
            title="Edit Zone"
            size="md"
          >
            <Stack gap="sm">
              <TextInput
                label="Zone Name"
                value={editingZone.name}
                onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
              />
              <Select
                label="Zone Type"
                data={zoneTypes}
                value={editingZone.zoneType}
                onChange={(value) => setEditingZone({ ...editingZone, zoneType: value })}
              />
              
              <Divider label="Visual Position" labelPosition="center" />
              <Group grow>
                <NumberInput
                  label="X Position (%)"
                  min={0}
                  max={100}
                  value={editingZone.x}
                  onChange={(value) => setEditingZone({ ...editingZone, x: value || 0 })}
                />
                <NumberInput
                  label="Y Position (%)"
                  min={0}
                  max={100}
                  value={editingZone.y}
                  onChange={(value) => setEditingZone({ ...editingZone, y: value || 0 })}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label="Width (%)"
                  min={1}
                  max={100}
                  value={editingZone.width}
                  onChange={(value) => setEditingZone({ ...editingZone, width: value || 20 })}
                />
                <NumberInput
                  label="Height (%)"
                  min={1}
                  max={100}
                  value={editingZone.height}
                  onChange={(value) => setEditingZone({ ...editingZone, height: value || 20 })}
                />
              </Group>

              <Divider label="GPS Coordinates" labelPosition="center" />
              <Group grow>
                <NumberInput
                  label="Center Latitude"
                  decimalScale={6}
                  value={editingZone.centerLat}
                  onChange={(value) => setEditingZone({ ...editingZone, centerLat: value || 0 })}
                />
                <NumberInput
                  label="Center Longitude"
                  decimalScale={6}
                  value={editingZone.centerLng}
                  onChange={(value) => setEditingZone({ ...editingZone, centerLng: value || 0 })}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label="Radius (meters)"
                  min={1}
                  max={1000}
                  value={editingZone.radius}
                  onChange={(value) => setEditingZone({ ...editingZone, radius: value || 50 })}
                />
                <NumberInput
                  label="Max Capacity"
                  min={1}
                  max={10000}
                  value={editingZone.maxCapacity}
                  onChange={(value) => setEditingZone({ ...editingZone, maxCapacity: value || 100 })}
                />
              </Group>
              <Group justify="flex-end">
                <Button variant="outline" onClick={() => setEditingZone(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Modal>
        )}

        {/* Existing Zones Table */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={500} mb="md">Existing Zones ({zones.length})</Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Zone Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Visual Position</Table.Th>
                <Table.Th>GPS Coordinates</Table.Th>
                <Table.Th>Capacity</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {zones.map((zone) => (
                <Table.Tr key={zone.id}>
                  <Table.Td>
                    <Text fw={500}>{zone.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {zoneTypes.find(t => t.value === zone.zoneType)?.label || zone.zoneType}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">
                      X: {zone.x}%, Y: {zone.y}%<br />
                      W: {zone.width}%, H: {zone.height}%
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">
                      {formatCoordinate(zone.centerLat)}, {formatCoordinate(zone.centerLng)}<br />
                      <Badge variant="light" size="xs">{zone.radius}m radius</Badge>
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
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
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm" 
                        variant="light" 
                        color="red"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>
    </Modal>
  );
};

export default ZoneManager; 