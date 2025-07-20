import { AppShell, Group, Text, ActionIcon, useMantineTheme, Burger } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

const AppBar = ({ userName = "User", onMenuClick, opened = false }) => {
  const theme = useMantineTheme();

  return (
    <AppShell.Header
      style={{
        backgroundColor: theme.colors.blue[6],
        borderBottom: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Group justify="space-between" align="center" h="100%" px="md">
        {/* Left: Burger Menu */}
        <Burger 
          opened={opened} 
          onClick={onMenuClick} 
          aria-label="Toggle navigation"
          color="white"
          size="sm"
        />

        {/* Right: User Name */}
        <Group gap="xs">
          <IconUser size={20} style={{ color: 'white' }} />
          <Text
            size="sm"
            fw={500}
            style={{ color: 'white' }}
          >
            {userName}
          </Text>
        </Group>
      </Group>
    </AppShell.Header>
  );
};

export default AppBar; 