import { useState, useEffect } from 'react'
import { 
  AppShell,
  Container,
  Stack,
  Title,
  Text,
  Group,
  Card,
  Grid,
  Badge,
  Button,
  Paper,
  Divider,
  Box,
  rem,
  Modal,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Avatar,
  Table,
  LoadingOverlay,
  Stepper,
  FileInput,
  Alert
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { 
  IconShieldLock, 
  IconUsers, 
  IconCalendar, 
  IconChartBar, 
  IconSettings, 
  IconAlertTriangle,
  IconActivity,
  IconMap,
  IconReportAnalytics,
  IconCalendarEvent,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconFilter,
  IconPhone,
  IconMail,
  IconUser,
  IconId,
  IconBriefcase,
  IconClock,
  IconCheck,
  IconX,
  IconUpload,
  IconEye
} from '@tabler/icons-react'
import AppBar from '../components/AppBar'
import Sidebar from '../components/Sidebar'
import FloatingAssistant from '../components/FloatingAssistant'
import { apiService } from '../services/api'

function StaffManagement() {
  const [opened, { toggle }] = useDisclosure(true)
  const isSmallScreen = useMediaQuery('(max-width: 768px)')
  const [addModalOpened, setAddModalOpened] = useState(false)
  const [editModalOpened, setEditModalOpened] = useState(false)
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [staffData, setStaffData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingStaff, setAddingStaff] = useState(false)
  const [updatingStaff, setUpdatingStaff] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const [newStaff, setNewStaff] = useState({
    username: '',
    firstName: '',
    lastName: '',
    role: '',
    assignedZone: '',
    contactEmail: '',
    contactNumber: '',
    address: '',
    status: 'active',
    profile_photo: null
  })

  const [editStaff, setEditStaff] = useState({
    username: '',
    firstName: '',
    lastName: '',
    role: '',
    assignedZone: '',
    contactEmail: '',
    contactNumber: '',
    address: '',
    status: 'active',
    profile_photo: null
  })

  // Fetch staff data on component mount
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true)
        const response = await apiService.getAllStaff()
        if (response.success) {
          setStaffData(response.data)
        } else {
          setError('Failed to fetch staff data')
        }
      } catch (err) {
        console.error('Error fetching staff data:', err)
        setError('Failed to load staff data')
      } finally {
        setLoading(false)
      }
    }

    fetchStaffData()
  }, [])

  const handleViewStaff = (staff) => {
    console.log('Viewing staff:', staff);
    console.log('Profile photo path:', staff.profile_photo);
    setSelectedStaff(staff)
    setViewModalOpened(true)
  }

  const handleEditStaff = (staff) => {
    // Prefill the add staff form with existing data
    setNewStaff({
      username: staff.username,
      firstName: staff.first_name,
      lastName: staff.last_name,
      role: staff.role,
      assignedZone: staff.assigned_zone,
      contactEmail: staff.contact_email,
      contactNumber: staff.contact_number,
      address: staff.address,
      status: staff.status,
      profile_photo: null // We'll handle profile photo separately
    })
    setSelectedStaff(staff)
    setActiveStep(0) // Start from the first step
    setAddModalOpened(true)
  }

  const resetAddForm = () => {
    setNewStaff({
      username: '',
      firstName: '',
      lastName: '',
      role: '',
      assignedZone: '',
      contactEmail: '',
      contactNumber: '',
      address: '',
      status: 'active',
      profile_photo: null
    })
    setActiveStep(0)
    setSelectedStaff(null)
  }

  const handleAddStaff = async () => {
    if (!newStaff.username || !newStaff.firstName || !newStaff.lastName || !newStaff.role || !newStaff.assignedZone || !newStaff.contactEmail || !newStaff.contactNumber || !newStaff.address) {
      return
    }

    try {
      setAddingStaff(true)
      
      let response
      if (selectedStaff) {
        // Update existing staff
        response = await apiService.updateStaff(selectedStaff.username, newStaff)
      } else {
        // Add new staff
        response = await apiService.addStaff(newStaff)
      }
      
      if (response.success) {
        // Refresh staff data
        const staffResponse = await apiService.getAllStaff()
        if (staffResponse.success) {
          setStaffData(staffResponse.data)
        }
        
        resetAddForm()
        setAddModalOpened(false)
        setSelectedStaff(null) // Clear selected staff
      }
    } catch (err) {
      console.error('Error saving staff:', err)
      setError(selectedStaff ? 'Failed to update staff member' : 'Failed to add staff member')
    } finally {
      setAddingStaff(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editStaff.username || !editStaff.firstName || !editStaff.lastName || !editStaff.role || !editStaff.assignedZone || !editStaff.contactEmail || !editStaff.contactNumber || !editStaff.address) {
      return
    }

    try {
      setUpdatingStaff(true)
      const response = await apiService.updateStaff(selectedStaff.username, editStaff)
      if (response.success) {
        // Refresh staff data
        const staffResponse = await apiService.getAllStaff()
        if (staffResponse.success) {
          setStaffData(staffResponse.data)
        }
        setEditModalOpened(false)
        setSelectedStaff(null)
      }
    } catch (err) {
      console.error('Error updating staff:', err)
      setError('Failed to update staff member')
    } finally {
      setUpdatingStaff(false)
    }
  }

  const handleDeleteStaff = async (username) => {
    try {
      const response = await apiService.deleteStaff(username)
      if (response.success) {
        // Refresh staff data
        const staffResponse = await apiService.getAllStaff()
        if (staffResponse.success) {
          setStaffData(staffResponse.data)
        }
      }
    } catch (err) {
      console.error('Error deleting staff:', err)
      setError('Failed to delete staff member')
    }
  }

  const handleToggleStatus = (id) => {
    setStaffData(staffData.map(staff => 
      staff.id === id 
        ? { ...staff, status: staff.status === 'active' ? 'inactive' : 'active' }
        : staff
    ))
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red'
  }

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'security': return 'blue'
      case 'volunteer': return 'green'
      default: return 'gray'
    }
  }

  const filteredStaff = staffData.filter(staff => {
    const fullName = `${staff.first_name} ${staff.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         staff.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || staff.role.toLowerCase() === filterRole.toLowerCase()
    return matchesSearch && matchesRole
  })

  const activeStaff = staffData.filter(staff => staff.status === 'active')
  const inactiveStaff = staffData.filter(staff => staff.status === 'inactive')

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
        <AppBar userName="Admin User" opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar opened={opened} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="100%" py="xl" px="xl" style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          
          {error && (
            <Paper p="md" radius="md" style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)' }}>
              <Text c="red" ta="center">{error}</Text>
            </Paper>
          )}

          <Stack spacing="xl">
            {/* Header */}
            <Stack spacing="xs">
              <Group gap="xs">
                <IconUsers size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Staff Management
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Manage staff members, roles, and assignments
              </Text>
            </Stack>

            {/* Stats Overview */}
            <Grid gutter="lg">
              {[
                {
                  title: 'Total Staff',
                  value: staffData.length.toString(),
                  icon: IconUsers,
                  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                },
                {
                  title: 'Active Staff',
                  value: activeStaff.length.toString(),
                  icon: IconCheck,
                  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                },
                {
                  title: 'Busy',
                  value: activeStaff.length.toString(),
                  icon: IconActivity,
                  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                },
                {
                  title: 'Inactive Staff',
                  value: inactiveStaff.length.toString(),
                  icon: IconX,
                  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }
              ].map((card, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
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

            {/* Staff Management Section */}
            <Paper
              shadow="xl"
              radius="lg"
              p="xl"
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
                      <IconUsers size={24} style={{ color: 'white' }} />
                    </div>
                    <Stack gap="xs">
                      <Title order={3} style={{ fontWeight: 600 }}>
                        Staff Directory
                      </Title>
                      <Text size="sm" c="dimmed">
                        Manage and view all staff members
                      </Text>
                    </Stack>
                  </Group>
                  
                  <Button 
                    size="md"
                    radius="md"
                    leftSection={<IconPlus size={16} />} 
                    onClick={() => setAddModalOpened(true)}
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
                    Add Staff
                  </Button>
                </Group>

                {/* Search and Filter */}
                <Group gap="md">
                  <TextInput
                    placeholder="Search by name, email, or ID..."
                    leftSection={<IconSearch size={16} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1 }}
                    size="md"
                    radius="md"
                  />
                  <Select
                    placeholder="Filter by department"
                    leftSection={<IconFilter size={16} />}
                    value={filterRole}
                    onChange={setFilterRole}
                    data={[
                      { value: 'all', label: 'All Roles' },
                      { value: 'Security', label: 'Security' },
                      { value: 'Volunteer', label: 'Volunteer' }
                    ]}
                    size="md"
                    radius="md"
                  />
                </Group>

                {/* Staff Table */}
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Username</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Zone</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Contact</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredStaff.map((staff) => (
                      <Table.Tr key={staff.id || staff.username}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar size="md" radius="xl" color={getRoleColor(staff.role)}>
                              {staff.first_name?.[0] || 'S'}{staff.last_name?.[0] || 'T'}
                            </Avatar>
                            <Stack gap={4}>
                              <Text size="sm" fw={600}>{staff.first_name || 'Unknown'} {staff.last_name || 'Staff'}</Text>
                            </Stack>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">{staff.username || 'N/A'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{staff.role || 'N/A'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{staff.assigned_zone || 'N/A'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(staff.status || 'active')} variant="light">
                            {(staff.status || 'active').charAt(0).toUpperCase() + (staff.status || 'active').slice(1)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={4}>
                            <Group gap="xs">
                              <IconMail size={12} style={{ color: '#667eea' }} />
                              <Text size="xs">{staff.contact_email || 'N/A'}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconPhone size={12} style={{ color: '#667eea' }} />
                              <Text size="xs">{staff.contact_number || 'N/A'}</Text>
                            </Group>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="blue"
                              onClick={() => handleViewStaff(staff)}
                              style={{
                                background: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                '&:hover': {
                                  background: 'rgba(102, 126, 234, 0.2)'
                                }
                              }}
                            >
                              <IconEye size={14} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="orange"
                              onClick={() => handleEditStaff(staff)}
                              style={{
                                background: 'rgba(255, 165, 0, 0.1)',
                                color: '#ffa500',
                                border: '1px solid rgba(255, 165, 0, 0.2)',
                                '&:hover': {
                                  background: 'rgba(255, 165, 0, 0.2)'
                                }
                              }}
                            >
                              <IconEdit size={14} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="red"
                              onClick={() => handleDeleteStaff(staff.username)}
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
              </Stack>
            </Paper>
          </Stack>

          {/* Add Staff Modal */}
          <Modal 
            opened={addModalOpened} 
            onClose={() => {
              setAddModalOpened(false)
              resetAddForm()
              setSelectedStaff(null)
            }} 
            title={
              <Text fw={600}>{selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</Text>
            }
            centered
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
            <Stepper 
              active={activeStep} 
              onStepClick={setActiveStep}
              breakpoint="sm"
              size="sm"
              styles={{
                step: {
                  '&[data-progress="true"]': {
                    borderColor: '#667eea'
                  }
                },
                stepIcon: {
                  '&[data-progress="true"]': {
                    backgroundColor: '#667eea',
                    borderColor: '#667eea'
                  }
                }
              }}
            >
              <Stepper.Step label="Basic Info" description="Personal details">
                <Stack spacing="lg" mt="xl">
                  <TextInput
                    label="Username"
                    placeholder="Enter username"
                    value={newStaff.username}
                    onChange={(event) => setNewStaff({...newStaff, username: event.target.value})}
                    required
                    size="md"
                    radius="md"
                  />

                  <Group grow>
                    <TextInput
                      label="First Name"
                      placeholder="Enter first name"
                      value={newStaff.firstName}
                      onChange={(event) => setNewStaff({...newStaff, firstName: event.target.value})}
                      required
                      size="md"
                      radius="md"
                    />
                    <TextInput
                      label="Last Name"
                      placeholder="Enter last name"
                      value={newStaff.lastName}
                      onChange={(event) => setNewStaff({...newStaff, lastName: event.target.value})}
                      required
                      size="md"
                      radius="md"
                    />
                  </Group>

                  <FileInput
                    label="Profile Photo"
                    placeholder="Upload profile photo"
                    accept="image/*"
                    icon={<IconUpload size={14} />}
                    value={newStaff.profile_photo}
                    onChange={(value) => setNewStaff({...newStaff, profile_photo: value})}
                    size="md"
                    radius="md"
                  />
                </Stack>
              </Stepper.Step>

              <Stepper.Step label="Role & Zone" description="Assignment details">
                <Stack spacing="lg" mt="xl">
                  <Group grow>
                    <Select
                      label="Role"
                      placeholder="Select role"
                      value={newStaff.role}
                      onChange={(value) => setNewStaff({...newStaff, role: value})}
                      data={[
                        { value: 'Security', label: 'Security' },
                        { value: 'Volunteer', label: 'Volunteer' }
                      ]}
                      required
                      size="md"
                      radius="md"
                    />
                    <TextInput
                      label="Assigned Zone"
                      placeholder="Enter assigned zone"
                      value={newStaff.assignedZone}
                      onChange={(event) => setNewStaff({...newStaff, assignedZone: event.target.value})}
                      required
                      size="md"
                      radius="md"
                    />
                  </Group>

                  <Select
                    label="Status"
                    placeholder="Select status"
                    value={newStaff.status}
                    onChange={(value) => setNewStaff({...newStaff, status: value})}
                    data={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                    size="md"
                    radius="md"
                  />
                </Stack>
              </Stepper.Step>

              <Stepper.Step label="Contact Info" description="Contact details">
                <Stack spacing="lg" mt="xl">
                  <Group grow>
                    <TextInput
                      label="Contact Email"
                      placeholder="Enter email address"
                      value={newStaff.contactEmail}
                      onChange={(event) => setNewStaff({...newStaff, contactEmail: event.target.value})}
                      required
                      type="email"
                      size="md"
                      radius="md"
                    />
                    <TextInput
                      label="Contact Number"
                      placeholder="Enter phone number"
                      value={newStaff.contactNumber}
                      onChange={(event) => setNewStaff({...newStaff, contactNumber: event.target.value})}
                      required
                      size="md"
                      radius="md"
                    />
                  </Group>

                  <Textarea
                    label="Address"
                    placeholder="Enter address"
                    value={newStaff.address}
                    onChange={(event) => setNewStaff({...newStaff, address: event.target.value})}
                    required
                    size="md"
                    radius="md"
                    minRows={3}
                  />
                </Stack>
              </Stepper.Step>

              <Stepper.Completed>
                <Stack spacing="lg" mt="xl">
                  <Text ta="center" size="lg" fw={600}>
                    Review Staff Information
                  </Text>
                  
                  <Paper p="md" withBorder>
                    <Stack spacing="xs">
                      <Text><strong>Name:</strong> {newStaff.firstName} {newStaff.lastName}</Text>
                      <Text><strong>Username:</strong> {newStaff.username}</Text>
                      <Text><strong>Role:</strong> {newStaff.role}</Text>
                      <Text><strong>Zone:</strong> {newStaff.assignedZone}</Text>
                      <Text><strong>Email:</strong> {newStaff.contactEmail}</Text>
                      <Text><strong>Phone:</strong> {newStaff.contactNumber}</Text>
                      <Text><strong>Address:</strong> {newStaff.address}</Text>
                      <Text><strong>Status:</strong> {newStaff.status}</Text>
                    </Stack>
                  </Paper>
                </Stack>
              </Stepper.Completed>
            </Stepper>

            {activeStep < 3 && (
              <Group justify="center" mt="xl">
                <Button 
                  variant="default" 
                  onClick={() => setActiveStep(activeStep - 1)}
                  disabled={activeStep === 0}
                  size="md"
                  radius="md"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={
                    (activeStep === 0 && (!newStaff.username || !newStaff.firstName || !newStaff.lastName)) ||
                    (activeStep === 1 && (!newStaff.role || !newStaff.assignedZone)) ||
                    (activeStep === 2 && (!newStaff.contactEmail || !newStaff.contactNumber || !newStaff.address))
                  }
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600
                  }}
                  size="md"
                  radius="md"
                >
                  {activeStep === 2 ? 'Complete' : 'Next'}
                </Button>
              </Group>
            )}

            {activeStep === 3 && (
              <Stack spacing="lg" mt="xl">
                <Button 
                  onClick={handleAddStaff}
                  loading={addingStaff}
                  fullWidth
                  size="md"
                  radius="md"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: rem(16),
                    height: rem(48)
                  }}
                                  >
                    {addingStaff ? (selectedStaff ? 'Updating Staff...' : 'Adding Staff...') : (selectedStaff ? 'Update Staff' : 'Add Staff')}
                  </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAddModalOpened(false)
                    resetAddForm()
                  }}
                  fullWidth
                  size="md"
                  radius="md"
                >
                  {selectedStaff ? 'Cancel Edit' : 'Cancel'}
                </Button>
              </Stack>
            )}
          </Modal>

          {/* Edit Staff Modal */}
          <Modal 
            opened={editModalOpened} 
            onClose={() => setEditModalOpened(false)} 
            title={
              <Text fw={600}>Edit Staff Member</Text>
            }
            centered
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
              <Grid gutter="md">
                <Grid.Col span={6}>
                  <TextInput
                    label="Username"
                    placeholder="Enter username"
                    size="md"
                    radius="md"
                    value={editStaff.username}
                    onChange={(event) => setEditStaff({...editStaff, username: event.target.value})}
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
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="First Name"
                    placeholder="Enter first name"
                    size="md"
                    radius="md"
                    value={editStaff.firstName}
                    onChange={(event) => setEditStaff({...editStaff, firstName: event.target.value})}
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
                </Grid.Col>
              </Grid>

              <Grid gutter="md">
                <Grid.Col span={6}>
                  <TextInput
                    label="Last Name"
                    placeholder="Enter last name"
                    size="md"
                    radius="md"
                    value={editStaff.lastName}
                    onChange={(event) => setEditStaff({...editStaff, lastName: event.target.value})}
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
                </Grid.Col>
                <Grid.Col span={6}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setEditStaff({...editStaff, profile_photo: event.target.files[0]})}
                    style={{
                      padding: '8px',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      width: '100%',
                      fontSize: '14px'
                    }}
                  />
                  <Text size="xs" c="dimmed" mt={4}>Profile Photo</Text>
                </Grid.Col>
              </Grid>

              <Grid gutter="md">
                <Grid.Col span={6}>
                  <Select
                    label="Role"
                    placeholder="Select role"
                    size="md"
                    radius="md"
                    value={editStaff.role}
                    onChange={(value) => setEditStaff({...editStaff, role: value})}
                    data={[
                      { value: 'Security', label: 'Security' },
                      { value: 'Volunteer', label: 'Volunteer' }
                    ]}
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
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Assigned Zone"
                    placeholder="Enter assigned zone"
                    size="md"
                    radius="md"
                    value={editStaff.assignedZone}
                    onChange={(event) => setEditStaff({...editStaff, assignedZone: event.target.value})}
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
                </Grid.Col>
              </Grid>

              <Grid gutter="md">
                <Grid.Col span={6}>
                  <TextInput
                    label="Contact Email"
                    placeholder="Enter email address"
                    size="md"
                    radius="md"
                    value={editStaff.contactEmail}
                    onChange={(event) => setEditStaff({...editStaff, contactEmail: event.target.value})}
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
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Contact Number"
                    placeholder="Enter phone number"
                    size="md"
                    radius="md"
                    value={editStaff.contactNumber}
                    onChange={(event) => setEditStaff({...editStaff, contactNumber: event.target.value})}
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
                </Grid.Col>
              </Grid>

              <TextInput
                label="Address"
                placeholder="Enter address"
                size="md"
                radius="md"
                value={editStaff.address}
                onChange={(event) => setEditStaff({...editStaff, address: event.target.value})}
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
                  onClick={() => setEditModalOpened(false)}
                  size="md"
                  radius="md"
                >
                  Cancel
                </Button>
                <Button 
                  size="md"
                  radius="md"
                  loading={updatingStaff}
                  disabled={updatingStaff}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600
                  }}
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Modal>

          {/* View Staff Modal */}
          <Modal 
            opened={viewModalOpened} 
            onClose={() => setViewModalOpened(false)} 
            title={
              <Text fw={600}>Staff Member Details</Text>
            }
            centered
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
            {selectedStaff && (
              <Stack spacing="lg">
                {/* Profile Photo */}
                <Group justify="center">
                  {selectedStaff.profile_photo ? (
                    <Avatar 
                      size={120} 
                      radius="xl" 
                      src={`http://localhost:8000/static/${selectedStaff.profile_photo.replace('data/', '')}`}
                      color={getRoleColor(selectedStaff.role)}
                      onError={(e) => {
                        console.log('Image failed to load:', selectedStaff.profile_photo);
                        e.target.style.display = 'none';
                      }}
                    >
                      {selectedStaff.first_name?.[0] || 'S'}{selectedStaff.last_name?.[0] || 'T'}
                    </Avatar>
                  ) : (
                    <Avatar 
                      size={120} 
                      radius="xl" 
                      color={getRoleColor(selectedStaff.role)}
                    >
                      {selectedStaff.first_name?.[0] || 'S'}{selectedStaff.last_name?.[0] || 'T'}
                    </Avatar>
                  )}
                </Group>

                {/* Staff Information */}
                <Paper p="md" withBorder>
                  <Stack spacing="md">
                    <Group grow>
                      <div>
                        <Text size="sm" fw={600} c="dimmed">Full Name</Text>
                        <Text size="md">{selectedStaff.first_name || 'Unknown'} {selectedStaff.last_name || 'Staff'}</Text>
                      </div>
                      <div>
                        <Text size="sm" fw={600} c="dimmed">Username</Text>
                        <Text size="md">{selectedStaff.username || 'N/A'}</Text>
                      </div>
                    </Group>

                    <Group grow>
                      <div>
                        <Text size="sm" fw={600} c="dimmed">Role</Text>
                        <Badge color={getRoleColor(selectedStaff.role)} variant="light">
                          {selectedStaff.role || 'N/A'}
                        </Badge>
                      </div>
                      <div>
                        <Text size="sm" fw={600} c="dimmed">Status</Text>
                        <Badge color={getStatusColor(selectedStaff.status || 'active')} variant="light">
                          {(selectedStaff.status || 'active').charAt(0).toUpperCase() + (selectedStaff.status || 'active').slice(1)}
                        </Badge>
                      </div>
                    </Group>

                    <div>
                      <Text size="sm" fw={600} c="dimmed">Assigned Zone</Text>
                      <Text size="md">{selectedStaff.assigned_zone || 'N/A'}</Text>
                    </div>

                    <Divider />

                    <div>
                      <Text size="sm" fw={600} c="dimmed">Contact Information</Text>
                      <Stack spacing="xs" mt="xs">
                        <Group gap="xs">
                          <IconMail size={16} style={{ color: '#667eea' }} />
                          <Text size="sm">{selectedStaff.contact_email || 'N/A'}</Text>
                        </Group>
                        <Group gap="xs">
                          <IconPhone size={16} style={{ color: '#667eea' }} />
                          <Text size="sm">{selectedStaff.contact_number || 'N/A'}</Text>
                        </Group>
                      </Stack>
                    </div>

                    <div>
                      <Text size="sm" fw={600} c="dimmed">Address</Text>
                      <Text size="sm">{selectedStaff.address || 'N/A'}</Text>
                    </div>
                  </Stack>
                </Paper>

                <Group justify="center">
                  <Button 
                    variant="outline" 
                    onClick={() => setViewModalOpened(false)}
                    size="md"
                    radius="md"
                  >
                    Close
                  </Button>
                </Group>
              </Stack>
            )}
          </Modal>
        </Container>
        <FloatingAssistant />
      </AppShell.Main>
    </AppShell>
  )
}

export default StaffManagement 