import { Paper, Text, Stack, Group, Badge, useMantineTheme, Button, Alert } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconSettings, IconInfoCircle } from '@tabler/icons-react';
import ZoneManager from './ZoneManager';

const CrowdHeatMap = ({ venueData, crowdData, updateInterval = 30000 }) => {
  const theme = useMantineTheme();
  const [zoneManagerOpened, setZoneManagerOpened] = useState(false);

  // Default venue data if none provided
  const defaultVenueData = {
    name: "Generic Venue",
    zones: [
      { 
        id: 1, 
        name: "Main Entrance", 
        zoneType: "entrance",
        x: 10, y: 10, width: 80, height: 20,
        centerLat: 40.7128, 
        centerLng: -74.0060, 
        radius: 50,
        maxCapacity: 200,
        createdAt: new Date().toISOString()
      },
      { 
        id: 2, 
        name: "Central Area", 
        zoneType: "seating",
        x: 20, y: 40, width: 60, height: 30,
        centerLat: 40.7130, 
        centerLng: -74.0058, 
        radius: 100,
        maxCapacity: 1000,
        createdAt: new Date().toISOString()
      },
      { 
        id: 3, 
        name: "Food Court", 
        zoneType: "food_court",
        x: 5, y: 80, width: 40, height: 15,
        centerLat: 40.7126, 
        centerLng: -74.0062, 
        radius: 75,
        maxCapacity: 300,
        createdAt: new Date().toISOString()
      },
      { 
        id: 4, 
        name: "Rest Area", 
        zoneType: "rest_area",
        x: 60, y: 80, width: 35, height: 15,
        centerLat: 40.7132, 
        centerLng: -74.0064, 
        radius: 40,
        maxCapacity: 150,
        createdAt: new Date().toISOString()
      },
      { 
        id: 5, 
        name: "Exit Zone", 
        zoneType: "exit",
        x: 85, y: 10, width: 10, height: 20,
        centerLat: 40.7124, 
        centerLng: -74.0056, 
        radius: 30,
        maxCapacity: 100,
        createdAt: new Date().toISOString()
      }
    ]
  };

  const venue = venueData || defaultVenueData;
  const [zones, setZones] = useState(venue.zones);

  // Generate default crowd data
  function getDefaultData() {
    return {
      zones: zones.map(zone => ({
        ...zone,
        density: Math.random() * 0.9 + 0.1, // Random density between 0.1 and 1.0
        count: Math.floor(Math.random() * zone.maxCapacity) + 10 // Random count based on max capacity
      })),
      lastUpdated: new Date().toISOString()
    };
  }

  const [currentData, setCurrentData] = useState(crowdData || getDefaultData());

  // Update current data when zones change
  useEffect(() => {
    setCurrentData(getDefaultData());
  }, [zones]);

  // Simulate periodic data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (crowdData) {
        setCurrentData(crowdData);
      } else {
        // Simulate real-time updates with random variations
        setCurrentData(prevData => ({
          zones: prevData.zones.map(zone => ({
            ...zone,
            density: Math.max(0.1, Math.min(1.0, zone.density + (Math.random() - 0.5) * 0.1)),
            count: Math.max(0, Math.min(zone.maxCapacity, zone.count + Math.floor((Math.random() - 0.5) * 20)))
          })),
          lastUpdated: new Date().toISOString()
        }));
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [crowdData, updateInterval]);

  // Get color based on density
  const getDensityColor = (density) => {
    if (density < 0.3) return theme.colors.blue[4];
    if (density < 0.5) return theme.colors.green[4];
    if (density < 0.7) return theme.colors.yellow[4];
    if (density < 0.9) return theme.colors.orange[4];
    return theme.colors.red[4];
  };

  // Get density level text
  const getDensityLevel = (density) => {
    if (density < 0.3) return "Low";
    if (density < 0.5) return "Moderate";
    if (density < 0.7) return "High";
    if (density < 0.9) return "Very High";
    return "Critical";
  };

  const handleZonesChange = (newZones) => {
    setZones(newZones);
  };

  return (
    <>
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Text size="lg" fw={600}>Crowd Heat Map</Text>
            <Group gap="sm">
              <Badge color="blue" variant="light">
                Last Updated: {new Date(currentData.lastUpdated).toLocaleTimeString()}
              </Badge>
              <Button 
                size="sm" 
                variant="light" 
                leftSection={<IconSettings size={16} />}
                onClick={() => setZoneManagerOpened(true)}
              >
                Manage Zones
              </Button>
            </Group>
          </Group>

          {/* Info Alert */}
          <Alert 
            icon={<IconInfoCircle size={16} />} 
            title="Dual Coordinate System" 
            color="blue" 
            variant="light"
          >
            Zones use percentage-based X/Y coordinates for visual display and GPS coordinates for backend processing. 
            This allows for intuitive visual positioning while maintaining precise location data for real-time tracking.
          </Alert>

          {/* Heat Map Visualization */}
          <Paper 
            style={{ 
              position: 'relative', 
              height: '400px', 
              background: theme.colors.gray[1],
              border: `2px solid ${theme.colors.gray[3]}`,
              borderRadius: theme.radius.md
            }}
          >
            {currentData.zones.map((zone) => (
              <div
                key={zone.id}
                style={{
                  position: 'absolute',
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                  backgroundColor: getDensityColor(zone.density),
                  border: `2px solid ${theme.colors.gray[6]}`,
                  borderRadius: theme.radius.sm,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: 0.8 + (zone.density * 0.2)
                }}
                title={`${zone.name}: ${zone.count} people (${getDensityLevel(zone.density)} density)`}
              >
                <Text size="xs" fw={600} c="white" ta="center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                  {zone.name}
                </Text>
                <Text size="xs" c="white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                  {zone.count}
                </Text>
              </div>
            ))}
          </Paper>

          {/* Legend */}
          <Group gap="md" wrap="wrap">
            <Text size="sm" fw={500}>Density Levels:</Text>
            <Badge color="blue" variant="filled">Low</Badge>
            <Badge color="green" variant="filled">Moderate</Badge>
            <Badge color="yellow" variant="filled">High</Badge>
            <Badge color="orange" variant="filled">Very High</Badge>
            <Badge color="red" variant="filled">Critical</Badge>
          </Group>

          {/* Zone Details */}
          <Group gap="md" wrap="wrap">
            {currentData.zones.map((zone) => (
              <Badge 
                key={zone.id}
                color={getDensityColor(zone.density) === theme.colors.blue[4] ? 'blue' :
                       getDensityColor(zone.density) === theme.colors.green[4] ? 'green' :
                       getDensityColor(zone.density) === theme.colors.yellow[4] ? 'yellow' :
                       getDensityColor(zone.density) === theme.colors.orange[4] ? 'orange' : 'red'}
                variant="light"
                size="lg"
              >
                {zone.name}: {zone.count}/{zone.maxCapacity} people
              </Badge>
            ))}
          </Group>
        </Stack>
      </Paper>

      {/* Zone Manager Modal */}
      <ZoneManager
        zones={zones}
        onZonesChange={handleZonesChange}
        opened={zoneManagerOpened}
        onClose={() => setZoneManagerOpened(false)}
      />
    </>
  );
};

export default CrowdHeatMap; 