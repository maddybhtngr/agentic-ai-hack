import { useState } from 'react'
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
  Table
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
  IconX
} from '@tabler/icons-react'
import AppBar from '../components/AppBar'
import Sidebar from '../components/Sidebar'

function StaffManagement() {
  const [opened, { toggle }] = useDisclosure(true)
  const isSmallScreen = useMediaQuery('(max-width: 768px)')
  const [addModalOpened, setAddModalOpened] = useState(false)
  const [editModalOpened, setEditModalOpened] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const [staffData, setStaffData] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@drishti.com',
      phone: '+1 (555) 123-4567',
      role: 'Security Officer',
      department: 'Security',
      status: 'active',
      joinDate: '2023-01-15',
      employeeId: 'EMP001',
      avatar: null,
      shifts: 'Day Shift',
      location: 'Zone A',
      supervisor: 'Sarah Johnson'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@drishti.com',
      phone: '+1 (555) 234-5678',
      role: 'Security Supervisor',
      department: 'Security',
      status: 'active',
      joinDate: '2022-08-20',
      employeeId: 'EMP002',
      avatar: null,
      shifts: 'Day Shift',
      location: 'All Zones',
      supervisor: 'Mike Wilson'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@drishti.com',
      phone: '+1 (555) 345-6789',
      role: 'Security Manager',
      department: 'Security',
      status: 'active',
      joinDate: '2021-12-10',
      employeeId: 'EMP003',
      avatar: null,
      shifts: 'Flexible',
      location: 'Headquarters',
      supervisor: 'Director'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@drishti.com',
      phone: '+1 (555) 456-7890',
      role: 'Medical Staff',
      department: 'Medical',
      status: 'active',
      joinDate: '2023-03-05',
      employeeId: 'EMP004',
      avatar: null,
      shifts: 'Night Shift',
      location: 'Medical Center',
      supervisor: 'Dr. Robert Brown'
    },
    {
      id: 5,
      name: 'Dr. Robert Brown',
      email: 'robert.brown@drishti.com',
      phone: '+1 (555) 567-8901',
      role: 'Medical Director',
      department: 'Medical',
      status: 'active',
      joinDate: '2022-06-15',
      employeeId: 'EMP005',
      avatar: null,
      shifts: 'Day Shift',
      location: 'Medical Center',
      supervisor: 'Director'
    },
    {
      id: 6,
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@drishti.com',
      phone: '+1 (555) 678-9012',
      role: 'Crowd Control',
      department: 'Operations',
      status: 'inactive',
      joinDate: '2023-02-20',
      employeeId: 'EMP006',
      avatar: null,
      shifts: 'Day Shift',
      location: 'Zone B',
      supervisor: 'Sarah Johnson'
    }
  ])

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    location: ''
  })

  const [editStaff, setEditStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    location: ''
  })

  const handleEditStaff = (staff) => {
    setEditStaff({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      location: staff.location
    })
    setSelectedStaff(staff)
    setEditModalOpened(true)
  }

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.email && newStaff.role && newStaff.location) {
      const staff = {
        id: staffData.length + 1,
        ...newStaff,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        employeeId: `EMP${String(staffData.length + 1).padStart(3, '0')}`,
        avatar: null,
        department: 'General',
        shifts: 'Day Shift',
        supervisor: 'Manager'
      }
      setStaffData([...staffData, staff])
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        role: '',
        location: ''
      })
      setAddModalOpened(false)
    }
  }

  const handleSaveEdit = () => {
    if (editStaff.name && editStaff.email && editStaff.role && editStaff.location) {
      const updatedStaff = staffData.map(staff => 
        staff.id === selectedStaff.id 
          ? { ...staff, ...editStaff }
          : staff
      )
      setStaffData(updatedStaff)
      setEditModalOpened(false)
      setSelectedStaff(null)
    }
  }

  const handleDeleteStaff = (id) => {
    setStaffData(staffData.filter(staff => staff.id !== id))
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

  const getDepartmentColor = (department) => {
    switch (department.toLowerCase()) {
      case 'security': return 'blue'
      case 'medical': return 'red'
      case 'operations': return 'yellow'
      default: return 'gray'
    }
  }

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || staff.department.toLowerCase() === filterRole.toLowerCase()
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
        <Container size="100%" py="xl" px="xl">
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
                      { value: 'all', label: 'All Departments' },
                      { value: 'security', label: 'Security' },
                      { value: 'medical', label: 'Medical' },
                      { value: 'operations', label: 'Operations' }
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
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Zone</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Contact</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredStaff.map((staff) => (
                      <Table.Tr key={staff.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar size="md" radius="xl" color={getDepartmentColor(staff.department)}>
                              {staff.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Stack gap={4}>
                              <Text size="sm" fw={600}>{staff.name}</Text>
                              <Text size="xs" c="dimmed">{staff.employeeId}</Text>
                            </Stack>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{staff.role}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{staff.location}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(staff.status)} variant="light">
                            {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={4}>
                            <Group gap="xs">
                              <IconMail size={12} style={{ color: '#667eea' }} />
                              <Text size="xs">{staff.email}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconPhone size={12} style={{ color: '#667eea' }} />
                              <Text size="xs">{staff.phone}</Text>
                            </Group>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="blue"
                              onClick={() => handleEditStaff(staff)}
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
                              onClick={() => handleDeleteStaff(staff.id)}
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
            onClose={() => setAddModalOpened(false)} 
            title={
              <Text fw={600}>Add New Staff Member</Text>
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
                    label="Full Name"
                    placeholder="Enter full name"
                    size="md"
                    radius="md"
                    value={newStaff.name}
                    onChange={(event) => setNewStaff({...newStaff, name: event.target.value})}
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
                    label="Role"
                    placeholder="Enter role/title"
                    size="md"
                    radius="md"
                    value={newStaff.role}
                    onChange={(event) => setNewStaff({...newStaff, role: event.target.value})}
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
                    label="Zone"
                    placeholder="Enter assigned zone"
                    size="md"
                    radius="md"
                    value={newStaff.location}
                    onChange={(event) => setNewStaff({...newStaff, location: event.target.value})}
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
                    label="Email"
                    placeholder="Enter email address"
                    size="md"
                    radius="md"
                    value={newStaff.email}
                    onChange={(event) => setNewStaff({...newStaff, email: event.target.value})}
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
                label="Phone"
                placeholder="Enter phone number"
                size="md"
                radius="md"
                value={newStaff.phone}
                onChange={(event) => setNewStaff({...newStaff, phone: event.target.value})}
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
                  onClick={() => setAddModalOpened(false)}
                  size="md"
                  radius="md"
                >
                  Cancel
                </Button>
                <Button 
                  size="md"
                  radius="md"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 600
                  }}
                  onClick={handleAddStaff}
                >
                  Add Staff
                </Button>
              </Group>
            </Stack>
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
                    label="Full Name"
                    placeholder="Enter full name"
                    size="md"
                    radius="md"
                    value={editStaff.name}
                    onChange={(event) => setEditStaff({...editStaff, name: event.target.value})}
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
                    label="Role"
                    placeholder="Enter role/title"
                    size="md"
                    radius="md"
                    value={editStaff.role}
                    onChange={(event) => setEditStaff({...editStaff, role: event.target.value})}
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
                    label="Zone"
                    placeholder="Enter assigned zone"
                    size="md"
                    radius="md"
                    value={editStaff.location}
                    onChange={(event) => setEditStaff({...editStaff, location: event.target.value})}
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
                    label="Email"
                    placeholder="Enter email address"
                    size="md"
                    radius="md"
                    value={editStaff.email}
                    onChange={(event) => setEditStaff({...editStaff, email: event.target.value})}
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
                label="Phone"
                placeholder="Enter phone number"
                size="md"
                radius="md"
                value={editStaff.phone}
                onChange={(event) => setEditStaff({...editStaff, phone: event.target.value})}
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
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default StaffManagement 