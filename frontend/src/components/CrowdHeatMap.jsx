import { Paper, Text, Stack, Group, Badge, useMantineTheme, Button, Alert, LoadingOverlay } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconSettings, IconInfoCircle } from '@tabler/icons-react';
import ZoneManager from './ZoneManager';
import { apiService } from '../services/api';

const CrowdHeatMap = ({ venueData, crowdData, updateInterval = 10000, showZoneManagement = true }) => {
  const theme = useMantineTheme();
  const [zoneManagerOpened, setZoneManagerOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default venue data if none provided
  const defaultVenueData = {
    name: "Generic Venue",
    zones: [] // Start with empty zones array
  };

  const venue = venueData || defaultVenueData;
  const [zones, setZones] = useState(venue.zones);
  const [crowdDataState, setCrowdDataState] = useState(null);
  const [crowdLoading, setCrowdLoading] = useState(false);

  // Fetch zones from API on component mount
  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      setError(null);
      try {
        const zonesData = await apiService.getAllZones();
        setZones(zonesData);
      } catch (err) {
        console.error('Error fetching zones:', err);
        setError('Failed to load zones from server');
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  // Fetch crowd data from API
  const fetchCrowdData = async () => {
    setCrowdLoading(true);
    try {
      const crowdDataResponse = await apiService.getAllZonesCrowdDetails();
      
      // Merge zone data with crowd data
      const mergedData = {
        zones: zones.map(zone => {
          const crowdInfo = crowdDataResponse.zones.find(crowd => crowd.zoneId === zone.id);
          return {
            ...zone,
            count: crowdInfo ? crowdInfo.count : 0,
            density: crowdInfo ? (crowdInfo.count / zone.maxCapacity) : 0
          };
        }),
        lastUpdated: crowdDataResponse.lastUpdated
      };
      
      setCrowdDataState(mergedData);
    } catch (err) {
      console.error('Error fetching crowd data:', err);
      setError('Failed to load crowd data from server');
    } finally {
      setCrowdLoading(false);
    }
  };

  // Fetch crowd data on component mount and when zones change
  useEffect(() => {
    if (zones.length > 0) {
      fetchCrowdData();
    }
  }, [zones]);

  // Simulate periodic data updates
  useEffect(() => {
    if (crowdData) {
      setCrowdDataState(crowdData);
    } else if (zones.length > 0) {
      const interval = setInterval(() => {
        fetchCrowdData();
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [crowdData, updateInterval, zones]);

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

  // Use crowdDataState if available, otherwise use the passed crowdData prop
  const currentData = crowdDataState || crowdData || { zones: [], lastUpdated: new Date().toISOString() };

  return (
    <>
      <Paper shadow="sm" p="xl" radius="md" withBorder style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        {error && (
          <Alert color="red" title="Error" mb="md">
            {error}
          </Alert>
        )}
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Text size="lg" fw={600}>Crowd Heat Map</Text>
            <Group gap="sm">
              <Badge color="blue" variant="light">
                Last Updated: {new Date(currentData.lastUpdated).toLocaleTimeString()}
              </Badge>
              {crowdLoading && (
                <Badge color="yellow" variant="light">
                  Updating...
                </Badge>
              )}
              {showZoneManagement && (
                <Button 
                  size="sm" 
                  variant="light" 
                  leftSection={<IconSettings size={16} />}
                  onClick={() => setZoneManagerOpened(true)}
                >
                  Manage Zones
                </Button>
              )}
            </Group>
          </Group>

          {/* Info Alert - Only show for admin users */}
          {showZoneManagement && (
            <Alert 
              icon={<IconInfoCircle size={16} />} 
              title="Dual Coordinate System" 
              color="blue" 
              variant="light"
            >
              Zones use percentage-based X/Y coordinates for visual display and GPS coordinates for backend processing. 
              This allows for intuitive visual positioning while maintaining precise location data for real-time tracking.
            </Alert>
          )}

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
                  width: `${zone.width || 15}%`,
                  height: `${zone.height || 15}%`,
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
      {showZoneManagement && (
        <ZoneManager
          zones={zones}
          onZonesChange={handleZonesChange}
          opened={zoneManagerOpened}
          onClose={() => setZoneManagerOpened(false)}
        />
      )}
    </>
  );
};

export default CrowdHeatMap; 