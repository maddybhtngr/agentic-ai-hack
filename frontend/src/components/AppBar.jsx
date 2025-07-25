import { AppShell, Group, Text, ActionIcon, useMantineTheme, Burger, Menu, Avatar, rem } from '@mantine/core';
import { IconUser, IconLogout, IconSettings, IconShieldLock, IconBell } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '../services/api';

const AppBar = ({ userName = "User", onMenuClick, opened = false }) => {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    authUtils.clearSession();
    navigate('/login');
  };

  return (
    <AppShell.Header
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Group justify="space-between" align="center" h="100%" px="xl">
        {/* Left: Brand and Menu */}
        <Group gap="lg">
          <Burger 
            opened={opened} 
            onClick={onMenuClick} 
            aria-label="Toggle navigation"
            color="white"
            size="sm"
            style={{
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: rem(8)
              }
            }}
          />
          
          <Group gap="xs">
            <IconShieldLock size={24} style={{ color: 'white' }} />
            <Text
              size="lg"
              fw={700}
              style={{ 
                color: 'white',
                letterSpacing: '0.5px'
              }}
            >
              Drishti
            </Text>
          </Group>
        </Group>

        {/* Right: User Actions */}
        <Group gap="md">
          {/* Notifications */}
          <ActionIcon
            variant="subtle"
            size="lg"
            style={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: rem(8),
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <IconBell size={18} />
          </ActionIcon>

          {/* User Menu */}
          <Menu
            shadow="xl"
            width={200}
            position="bottom-end"
            offset={8}
            withArrow
          >
            <Menu.Target>
              <Group 
                gap="xs" 
                style={{ 
                  cursor: 'pointer',
                  padding: rem(8),
                  borderRadius: rem(8),
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Avatar 
                  size="sm" 
                  radius="xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <IconUser size={16} style={{ color: 'white' }} />
                </Avatar>
                <Text
                  size="sm"
                  fw={600}
                  style={{ color: 'white' }}
                >
                  {userName}
                </Text>
              </Group>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: rem(12)
              }}
            >
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                color="red"
                onClick={handleLogout}
                style={{
                  '&:hover': {
                    background: 'rgba(255, 0, 0, 0.1)'
                  }
                }}
              >
                Sign Out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
};

export default AppBar; 