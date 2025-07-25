import { Container, Title, Text, Paper, Stack, AppShell, Grid, Group, rem, Card, Badge, Avatar, Progress, LoadingOverlay, Button, Modal, TextInput, FileInput } from '@mantine/core'
import { 
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconTicket,
  IconCalendar,
  IconClock,
  IconActivity,
  IconCheck,
  IconX,
  IconStar,
  IconPlus,
  IconUsers
} from '@tabler/icons-react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppBar from '../components/AppBar'
import AttendeeSidebar from '../components/AttendeeSidebar'
import FloatingAssistant from '../components/FloatingAssistant'
import { authUtils, apiService } from '../services/api'

function AttendeeDetails() {
  const [opened, { toggle }] = useDisclosure(true);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [familyModalOpened, { open: openFamilyModal, close: closeFamilyModal }] = useDisclosure(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [newFamilyMember, setNewFamilyMember] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    photo: null
  });
  const [addingFamilyMember, setAddingFamilyMember] = useState(false);
  
  // Get current user data
  const currentUser = authUtils.getCurrentUser();
  const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Attendee User';

  const handleMenuClick = () => {
    toggle();
    console.log('Attendee menu clicked')
  }

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!currentUser?.username) {
        setError('No user found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getUserDetails(currentUser.username);
        if (response.success) {
          setUserDetails(response.data);
          setFamilyMembers(response.data.family_members || []);
        } else {
          setError('Failed to fetch user details');
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [currentUser?.username]);

  const recentActivities = [
    {
      id: 1,
      action: 'Attended Keynote Session',
      time: '10:30 AM',
      type: 'Session',
      status: 'Completed'
    },
    {
      id: 2,
      action: 'Checked into Zone B',
      time: '09:45 AM',
      type: 'Location',
      status: 'Active'
    },
    {
      id: 3,
      action: 'Registered for Workshop',
      time: '09:20 AM',
      type: 'Registration',
      status: 'Confirmed'
    },
    {
      id: 4,
      action: 'Event Check-in',
      time: '09:15 AM',
      type: 'Entry',
      status: 'Completed'
    }
  ];

  const zoneHistory = [
    {
      id: 1,
      zone: 'Zone A - Registration',
      time: '09:15 - 09:30',
      duration: '15 min',
      status: 'Completed'
    },
    {
      id: 2,
      zone: 'Zone B - Main Hall',
      time: '09:45 - Present',
      duration: '2h 45m',
      status: 'Active'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Completed': return 'blue';
      case 'Confirmed': return 'green';
      default: return 'gray';
    }
  };

  const handleAddFamilyMember = async () => {
    if (!newFamilyMember.firstName || !newFamilyMember.lastName || !newFamilyMember.contact) {
      return;
    }

    try {
      setAddingFamilyMember(true);
      const response = await apiService.addFamilyMember(currentUser.username, newFamilyMember);
      if (response.success) {
        // Refresh user details to get updated family members
        const userResponse = await apiService.getUserDetails(currentUser.username);
        if (userResponse.success) {
          setUserDetails(userResponse.data);
          setFamilyMembers(userResponse.data.family_members || []);
        }
        
        setNewFamilyMember({
          firstName: '',
          lastName: '',
          contact: '',
          photo: null
        });
        closeFamilyModal();
      }
    } catch (err) {
      console.error('Error adding family member:', err);
      setError('Failed to add family member');
    } finally {
      setAddingFamilyMember(false);
    }
  };

  const handleRemoveFamilyMember = async (familyUsername) => {
    try {
      const response = await apiService.removeFamilyMember(currentUser.username, familyUsername);
      if (response.success) {
        // Refresh user details to get updated family members
        const userResponse = await apiService.getUserDetails(currentUser.username);
        if (userResponse.success) {
          setUserDetails(userResponse.data);
          setFamilyMembers(userResponse.data.family_members || []);
        }
      }
    } catch (err) {
      console.error('Error removing family member:', err);
      setError('Failed to remove family member');
    }
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
          userName={userName} 
          onMenuClick={handleMenuClick}
          opened={opened}
        />
      </AppShell.Header>

      <AttendeeSidebar opened={opened} />

      <AppShell.Main>
        <Container size="100%" py="xl" px="xl" style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          
          {error && (
            <Paper p="md" radius="md" style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)' }}>
              <Text c="red" ta="center">{error}</Text>
            </Paper>
          )}

          {userDetails && (
            <Stack spacing="xl">
              {/* Header Section */}
              <Stack spacing="xs">
                <Group gap="xs">
                  <IconUser size={32} style={{ color: '#667eea' }} />
                  <Title 
                    order={1}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700
                    }}
                  >
                    Attendee Details
                  </Title>
                </Group>
                <Text c="dimmed" size="sm">
                  Your event profile and activity information
                </Text>
              </Stack>

            {/* Profile Overview */}
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
                    <IconUser size={24} style={{ color: 'white' }} />
                  </div>
                  <Stack gap="xs">
                    <Title order={3} style={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Profile Overview
                    </Title>
                    <Text size="sm" c="dimmed">
                      Your personal information and event details
                    </Text>
                  </Stack>
                </Group>

                                <Grid gutter="xl">
                  {/* Profile Photo */}
                  <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Stack gap="lg" align="center">
                      <Avatar 
                        size={240} 
                        radius="xl"
                        src={userDetails.profile_photo ? `http://localhost:8000/static/${userDetails.profile_photo.replace('data/', '')}` : undefined}
                        style={{
                          border: '4px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        <IconUser size={120} style={{ color: 'white' }} />
                      </Avatar>
                      
                      <Stack gap="xs" align="center">
                        <Text size="xl" fw={700} ta="center">{`${userDetails.first_name} ${userDetails.last_name}`}</Text>
                        <Badge 
                          color="green" 
                          variant="light"
                          size="md"
                          leftSection={<IconCheck size={12} />}
                        >
                          {userDetails.role}
                        </Badge>
                      </Stack>
                    </Stack>
                  </Grid.Col>

                  {/* Attendee Details */}
                  <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Stack gap="lg">
                      {/* Personal Information */}
                      <Paper 
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
                          <Text fw={600} size="lg" style={{ color: '#667eea' }}>Personal Information</Text>
                          
                          <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconMail size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Email:</Text>
                                  <Text size="sm">{userDetails.email}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconPhone size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Phone:</Text>
                                  <Text size="sm">{userDetails.phone}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                            
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconMapPin size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Current Zone:</Text>
                                  <Text size="sm">{userDetails.current_zone}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconMapPin size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Address:</Text>
                                  <Text size="sm">{userDetails.address}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                          </Grid>
                        </Stack>
                      </Paper>

                      {/* Emergency Contact */}
                      <Paper 
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
                          <Text fw={600} size="lg" style={{ color: '#667eea' }}>Emergency Contact</Text>
                          
                          <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconUser size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Name:</Text>
                                  <Text size="sm">{userDetails.emergency_contact.name}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconUser size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Relationship:</Text>
                                  <Text size="sm">{userDetails.emergency_contact.relationship}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                            
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="sm">
                                <Group gap="xs">
                                  <IconPhone size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Phone:</Text>
                                  <Text size="sm">{userDetails.emergency_contact.phone}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconMail size={16} style={{ color: '#667eea' }} />
                                  <Text size="sm" fw={500}>Email:</Text>
                                  <Text size="sm">{userDetails.emergency_contact.email}</Text>
                                </Group>
                              </Stack>
                            </Grid.Col>
                          </Grid>
                        </Stack>
                      </Paper>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>

            {/* Family Details */}
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
                <Group gap="md" justify="space-between">
                  <Group gap="md">
                    <div style={{
                      padding: rem(12),
                      borderRadius: rem(12),
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconUsers size={24} style={{ color: 'white' }} />
                    </div>
                    <Stack gap="xs">
                      <Title order={3} style={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Family Details
                      </Title>
                      <Text size="sm" c="dimmed">
                        Manage your family members attending the event
                      </Text>
                    </Stack>
                  </Group>
                  
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={openFamilyModal}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: 'white'
                    }}
                  >
                    Add Family Member
                  </Button>
                </Group>

                {familyMembers.length === 0 ? (
                  <Paper 
                    p="xl" 
                    radius="md" 
                    style={{
                      background: 'rgba(102, 126, 234, 0.05)',
                      border: '2px dashed rgba(102, 126, 234, 0.3)',
                      textAlign: 'center'
                    }}
                  >
                    <Stack gap="md" align="center">
                      <IconUsers size={48} style={{ color: '#667eea', opacity: 0.5 }} />
                      <Text c="dimmed" size="lg">No family members added yet</Text>
                      <Text c="dimmed" size="sm">Click "Add Family Member" to get started</Text>
                    </Stack>
                  </Paper>
                ) : (
                  <Grid gutter="md">
                    {familyMembers.map((member) => (
                      <Grid.Col key={member.username} span={{ base: 12, sm: 6, lg: 4 }}>
                        <Card
                          shadow="sm"
                          padding="lg"
                          radius="md"
                          withBorder
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            position: 'relative'
                          }}
                        >
                          <Stack gap="md" align="center">
                            <Avatar 
                              size={240} 
                              radius="xl"
                              src={member.photo_path ? `http://localhost:8000/static/${member.photo_path.replace('data/', '')}` : undefined}
                              style={{
                                border: '4px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                              }}
                            >
                              <IconUser size={120} style={{ color: 'white' }} />
                            </Avatar>
                            
                            <Stack gap="xs" align="center">
                              <Text size="lg" fw={600} ta="center">
                                {member.first_name} {member.last_name}
                              </Text>
                              <Group gap="xs">
                                <IconPhone size={14} style={{ color: '#667eea' }} />
                                <Text size="sm" c="dimmed">{member.contact}</Text>
                              </Group>
                            </Stack>
                            
                            <Button
                              size="xs"
                              variant="light"
                              color="red"
                              leftSection={<IconX size={12} />}
                              onClick={() => handleRemoveFamilyMember(member.username)}
                              style={{
                                position: 'absolute',
                                top: rem(8),
                                right: rem(8)
                              }}
                            >
                              Remove
                            </Button>
                          </Stack>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                )}
              </Stack>
            </Paper>
            </Stack>
          )}
        </Container>
        <FloatingAssistant />
      </AppShell.Main>

      {/* Add Family Member Modal */}
      <Modal
        opened={familyModalOpened}
        onClose={closeFamilyModal}
        title="Add Family Member"
        size="md"
        centered
        styles={{
          title: {
            fontWeight: 600,
            fontSize: rem(18)
          }
        }}
      >
        <Stack gap="md">
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={newFamilyMember.firstName}
            onChange={(e) => setNewFamilyMember({
              ...newFamilyMember,
              firstName: e.target.value
            })}
            required
          />
          
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={newFamilyMember.lastName}
            onChange={(e) => setNewFamilyMember({
              ...newFamilyMember,
              lastName: e.target.value
            })}
            required
          />
          
          <TextInput
            label="Contact Number"
            placeholder="Enter contact number"
            value={newFamilyMember.contact}
            onChange={(e) => setNewFamilyMember({
              ...newFamilyMember,
              contact: e.target.value
            })}
            required
          />
          
          <FileInput
            label="Profile Photo"
            placeholder="Upload photo (optional)"
            accept="image/*"
            value={newFamilyMember.photo}
            onChange={(file) => setNewFamilyMember({
              ...newFamilyMember,
              photo: file
            })}
          />
          
          <Group gap="sm" justify="flex-end">
            <Button
              variant="light"
              onClick={closeFamilyModal}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFamilyMember}
              disabled={!newFamilyMember.firstName || !newFamilyMember.lastName || !newFamilyMember.contact || addingFamilyMember}
              loading={addingFamilyMember}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              Add Member
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}

export default AttendeeDetails; 