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
  NumberInput,
  ActionIcon
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { 
  IconShieldLock, 
  IconCalendar, 
  IconMapPin, 
  IconUsers, 
  IconClock, 
  IconEdit,
  IconPlus,
  IconTrash,
  IconSettings,
  IconChartBar,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconPhone,
  IconMail,
  IconWorld,
  IconTicket,
  IconCamera,
  IconMicrophone,
  IconMusic,
  IconActivity
} from '@tabler/icons-react'
import AppBar from '../components/AppBar'
import Sidebar from '../components/Sidebar'

function EventDetails() {
  const [opened, { toggle }] = useDisclosure(true)
  const isSmallScreen = useMediaQuery('(max-width: 768px)')
  const [editModalOpened, setEditModalOpened] = useState(false)
  const [scheduleModalOpened, setScheduleModalOpened] = useState(false)
  const [eventData, setEventData] = useState({
    name: 'Tech Conference 2024',
    date: 'December 15, 2024',
    time: '9:00 AM - 6:00 PM',
    location: 'Convention Center, Downtown',
    address: '123 Main Street, City, State 12345',
    capacity: 500,
    registered: 342,
    description: 'Annual technology conference featuring keynote speakers, workshops, and networking opportunities. Join industry leaders and innovators for a day of learning and collaboration.',
    organizer: 'Tech Events Inc.',
    contact: '+1 (555) 123-4567',
    email: 'info@techconference.com',
    website: 'www.techconference.com',
    status: 'active',
    type: 'Conference',
    category: 'Technology'
  })

  const [editForm, setEditForm] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    address: '',
    capacity: 0,
    description: '',
    organizer: '',
    contact: '',
    email: '',
    website: '',
    type: '',
    category: ''
  })

  const [schedule, setSchedule] = useState([
    {
      id: 1,
      time: '9:00 AM - 9:30 AM',
      title: 'Registration & Welcome',
      speaker: 'Event Team',
      location: 'Main Hall',
      type: 'Registration'
    },
    {
      id: 2,
      time: '9:30 AM - 10:30 AM',
      title: 'Keynote: Future of AI',
      speaker: 'Dr. Sarah Johnson',
      location: 'Main Stage',
      type: 'Keynote'
    },
    {
      id: 3,
      time: '10:45 AM - 11:45 AM',
      title: 'Workshop: Machine Learning Basics',
      speaker: 'Prof. Michael Chen',
      location: 'Workshop Room A',
      type: 'Workshop'
    },
    {
      id: 4,
      time: '12:00 PM - 1:00 PM',
      title: 'Lunch & Networking',
      speaker: 'All Attendees',
      location: 'Dining Hall',
      type: 'Break'
    },
    {
      id: 5,
      time: '1:00 PM - 2:00 PM',
      title: 'Panel: Cybersecurity Trends',
      speaker: 'Expert Panel',
      location: 'Main Stage',
      type: 'Panel'
    },
    {
      id: 6,
      time: '2:15 PM - 3:15 PM',
      title: 'Workshop: Cloud Computing',
      speaker: 'Alex Rodriguez',
      location: 'Workshop Room B',
      type: 'Workshop'
    },
    {
      id: 7,
      time: '3:30 PM - 4:30 PM',
      title: 'Closing Remarks',
      speaker: 'Event Director',
      location: 'Main Stage',
      type: 'Closing'
    }
  ])

  const [newScheduleItem, setNewScheduleItem] = useState({
    time: '',
    title: '',
    speaker: '',
    location: '',
    type: ''
  })

  const handleEditEvent = () => {
    setEditForm({
      name: eventData.name,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      address: eventData.address,
      capacity: eventData.capacity,
      description: eventData.description,
      organizer: eventData.organizer,
      contact: eventData.contact,
      email: eventData.email,
      website: eventData.website,
      type: eventData.type,
      category: eventData.category
    })
    setEditModalOpened(true)
  }

  const handleSaveEvent = () => {
    setEventData(editForm)
    setEditModalOpened(false)
  }

  const handleAddScheduleItem = () => {
    if (newScheduleItem.time && newScheduleItem.title && newScheduleItem.speaker) {
      const item = {
        id: schedule.length + 1,
        ...newScheduleItem
      }
      setSchedule([...schedule, item])
      setNewScheduleItem({
        time: '',
        title: '',
        speaker: '',
        location: '',
        type: ''
      })
      setScheduleModalOpened(false)
    }
  }

  const handleDeleteScheduleItem = (id) => {
    setSchedule(schedule.filter(item => item.id !== id))
  }

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'keynote': return 'blue'
      case 'workshop': return 'green'
      case 'panel': return 'purple'
      case 'break': return 'yellow'
      case 'registration': return 'gray'
      case 'closing': return 'red'
      default: return 'gray'
    }
  }

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'keynote': return <IconMicrophone size={16} />
      case 'workshop': return <IconSettings size={16} />
      case 'panel': return <IconUsers size={16} />
      case 'break': return <IconClock size={16} />
      case 'registration': return <IconTicket size={16} />
      case 'closing': return <IconCheck size={16} />
      default: return <IconCalendar size={16} />
    }
  }

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
        <AppBar opened={opened} toggle={toggle} />
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
                <IconCalendar size={32} style={{ color: '#667eea' }} />
                <Title 
                  order={1}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Event Details
                </Title>
              </Group>
              <Text c="dimmed" size="sm">
                Manage and view comprehensive event information
              </Text>
            </Stack>

            {/* Event Information */}
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, lg: 8 }}>
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
                    <Group justify="space-between" align="flex-start">
                      <Stack gap="xs">
                        <Title order={2} size="h3" style={{ color: '#667eea' }}>
                          {eventData.name}
                        </Title>
                        <Group gap="lg">
                          <Badge color="blue" variant="light">{eventData.type}</Badge>
                          <Badge color="green" variant="light">{eventData.category}</Badge>
                          <Badge 
                            color={eventData.status === 'active' ? 'green' : 'red'} 
                            variant="light"
                          >
                            {eventData.status.charAt(0).toUpperCase() + eventData.status.slice(1)}
                          </Badge>
                        </Group>
                      </Stack>
                      <Button
                        leftSection={<IconEdit size={16} />}
                        onClick={handleEditEvent}
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
                        Edit Event
                      </Button>
                    </Group>

                    <Divider />

                    <Stack gap="md">
                      <Text size="lg" fw={600}>Event Description</Text>
                      <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                        {eventData.description}
                      </Text>
                    </Stack>

                    <Divider />

                    <Grid gutter="md">
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconCalendar size={16} style={{ color: '#667eea' }} />
                            <Text size="sm" fw={500}>Date & Time</Text>
                          </Group>
                          <Text size="sm">{eventData.date}</Text>
                          <Text size="sm" c="dimmed">{eventData.time}</Text>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconMapPin size={16} style={{ color: '#667eea' }} />
                            <Text size="sm" fw={500}>Location</Text>
                          </Group>
                          <Text size="sm">{eventData.location}</Text>
                          <Text size="sm" c="dimmed">{eventData.address}</Text>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconUsers size={16} style={{ color: '#667eea' }} />
                            <Text size="sm" fw={500}>Organizer</Text>
                          </Group>
                          <Text size="sm">{eventData.organizer}</Text>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconPhone size={16} style={{ color: '#667eea' }} />
                            <Text size="sm" fw={500}>Contact</Text>
                          </Group>
                          <Text size="sm">{eventData.contact}</Text>
                          <Text size="sm" c="dimmed">{eventData.email}</Text>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconWorld size={16} style={{ color: '#667eea' }} />
                            <Text size="sm" fw={500}>Website</Text>
                          </Group>
                          <Text size="sm" style={{ color: '#667eea', textDecoration: 'underline', cursor: 'pointer' }}>
                            {eventData.website}
                          </Text>
                        </Stack>
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 4 }}>
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
                          <IconActivity size={24} style={{ color: 'white' }} />
                        </div>
                        <Stack gap="xs">
                          <Title order={3} style={{ fontWeight: 600 }}>
                            Event Schedule
                          </Title>
                          <Text size="sm" c="dimmed">
                            Manage event timeline and sessions
                          </Text>
                        </Stack>
                      </Group>
                      <Button
                        size="sm"
                        leftSection={<IconPlus size={14} />}
                        onClick={() => setScheduleModalOpened(true)}
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
                        Add Item
                      </Button>
                    </Group>

                    <Stack gap="md">
                      {schedule.map((item) => (
                        <Paper
                          key={item.id}
                          p="md"
                          radius="md"
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid #e9ecef',
                            position: 'relative'
                          }}
                        >
                          <Stack gap="xs">
                            <Group justify="space-between" align="center">
                              <Stack gap="xs" style={{ flex: 1 }}>
                                <Text size="sm" fw={600} lineClamp={1}>
                                  {item.title}
                                </Text>
                                <Text size="xs" c="dimmed">{item.time}</Text>
                              </Stack>
                              <ActionIcon
                                size="sm"
                                variant="light"
                                color="red"
                                onClick={() => handleDeleteScheduleItem(item.id)}
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
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>

          {/* Edit Event Modal */}
          <Modal 
            opened={editModalOpened} 
            onClose={() => setEditModalOpened(false)} 
            title={
              <Text fw={600}>Edit Event Details</Text>
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
              <TextInput
                label="Event Name"
                placeholder="Enter event name"
                size="md"
                radius="md"
                value={editForm.name}
                onChange={(event) => setEditForm({...editForm, name: event.target.value})}
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

              <Grid gutter="md">
                <Grid.Col span={6}>
                  <TextInput
                    label="Date"
                    placeholder="Enter event date"
                    size="md"
                    radius="md"
                    value={editForm.date}
                    onChange={(event) => setEditForm({...editForm, date: event.target.value})}
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
                    label="Time"
                    placeholder="Enter event time"
                    size="md"
                    radius="md"
                    value={editForm.time}
                    onChange={(event) => setEditForm({...editForm, time: event.target.value})}
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
                label="Location"
                placeholder="Enter event location"
                size="md"
                radius="md"
                value={editForm.location}
                onChange={(event) => setEditForm({...editForm, location: event.target.value})}
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

              <TextInput
                label="Address"
                placeholder="Enter full address"
                size="md"
                radius="md"
                value={editForm.address}
                onChange={(event) => setEditForm({...editForm, address: event.target.value})}
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
                label="Capacity"
                placeholder="Enter event capacity"
                size="md"
                radius="md"
                value={editForm.capacity}
                onChange={(value) => setEditForm({...editForm, capacity: value})}
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

              <Textarea
                label="Description"
                placeholder="Enter event description"
                size="md"
                radius="md"
                minRows={3}
                value={editForm.description}
                onChange={(event) => setEditForm({...editForm, description: event.target.value})}
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

              <Grid gutter="md">
                <Grid.Col span={6}>
                  <TextInput
                    label="Organizer"
                    placeholder="Enter organizer name"
                    size="md"
                    radius="md"
                    value={editForm.organizer}
                    onChange={(event) => setEditForm({...editForm, organizer: event.target.value})}
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
                    label="Contact"
                    placeholder="Enter contact number"
                    size="md"
                    radius="md"
                    value={editForm.contact}
                    onChange={(event) => setEditForm({...editForm, contact: event.target.value})}
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
                    label="Email"
                    placeholder="Enter email address"
                    size="md"
                    radius="md"
                    value={editForm.email}
                    onChange={(event) => setEditForm({...editForm, email: event.target.value})}
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
                    label="Website"
                    placeholder="Enter website URL"
                    size="md"
                    radius="md"
                    value={editForm.website}
                    onChange={(event) => setEditForm({...editForm, website: event.target.value})}
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
                  <Select
                    label="Event Type"
                    placeholder="Select event type"
                    size="md"
                    radius="md"
                    value={editForm.type}
                    onChange={(value) => setEditForm({...editForm, type: value})}
                    data={[
                      { value: 'Conference', label: 'Conference' },
                      { value: 'Workshop', label: 'Workshop' },
                      { value: 'Seminar', label: 'Seminar' },
                      { value: 'Meetup', label: 'Meetup' },
                      { value: 'Exhibition', label: 'Exhibition' },
                      { value: 'Concert', label: 'Concert' },
                      { value: 'Sports Event', label: 'Sports Event' }
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
                  <Select
                    label="Category"
                    placeholder="Select category"
                    size="md"
                    radius="md"
                    value={editForm.category}
                    onChange={(value) => setEditForm({...editForm, category: value})}
                    data={[
                      { value: 'Technology', label: 'Technology' },
                      { value: 'Business', label: 'Business' },
                      { value: 'Education', label: 'Education' },
                      { value: 'Entertainment', label: 'Entertainment' },
                      { value: 'Sports', label: 'Sports' },
                      { value: 'Health', label: 'Health' },
                      { value: 'Arts', label: 'Arts' }
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
              </Grid>

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
                  onClick={handleSaveEvent}
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Modal>

          {/* Add Schedule Item Modal */}
          <Modal 
            opened={scheduleModalOpened} 
            onClose={() => setScheduleModalOpened(false)} 
            title={
              <Text fw={600}>Add Schedule Item</Text>
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
                label="Time"
                placeholder="e.g., 9:00 AM - 10:00 AM"
                size="md"
                radius="md"
                value={newScheduleItem.time}
                onChange={(event) => setNewScheduleItem({...newScheduleItem, time: event.target.value})}
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

              <TextInput
                label="Title"
                placeholder="Enter session title"
                size="md"
                radius="md"
                value={newScheduleItem.title}
                onChange={(event) => setNewScheduleItem({...newScheduleItem, title: event.target.value})}
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

              <TextInput
                label="Speaker"
                placeholder="Enter speaker name"
                size="md"
                radius="md"
                value={newScheduleItem.speaker}
                onChange={(event) => setNewScheduleItem({...newScheduleItem, speaker: event.target.value})}
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

              <TextInput
                label="Location"
                placeholder="Enter session location"
                size="md"
                radius="md"
                value={newScheduleItem.location}
                onChange={(event) => setNewScheduleItem({...newScheduleItem, location: event.target.value})}
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
                label="Type"
                placeholder="Select session type"
                size="md"
                radius="md"
                value={newScheduleItem.type}
                onChange={(value) => setNewScheduleItem({...newScheduleItem, type: value})}
                data={[
                  { value: 'Keynote', label: 'Keynote' },
                  { value: 'Workshop', label: 'Workshop' },
                  { value: 'Panel', label: 'Panel' },
                  { value: 'Break', label: 'Break' },
                  { value: 'Registration', label: 'Registration' },
                  { value: 'Closing', label: 'Closing' }
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

              <Group justify="flex-end" gap="md">
                <Button 
                  variant="outline" 
                  onClick={() => setScheduleModalOpened(false)}
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
                  onClick={handleAddScheduleItem}
                >
                  Add Item
                </Button>
              </Group>
            </Stack>
          </Modal>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default EventDetails 