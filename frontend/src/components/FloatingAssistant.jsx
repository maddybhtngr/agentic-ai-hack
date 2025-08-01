import { Affix, Button, Paper, Stack, TextInput, Group, Text, ScrollArea, ActionIcon, Avatar, Badge, Loader } from '@mantine/core'
import { IconMessageCircle, IconSend, IconX, IconRobot, IconUser } from '@tabler/icons-react'
import { useState } from 'react'
import { apiService } from '../services/api'

function FloatingAssistant({ onClick }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with event details, incidents, zones, staff information, and emergency contacts. How can I help you today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAssistantClick = () => {
    setIsChatOpen(!isChatOpen);
    if (onClick) {
      onClick();
    }
  };

  const callAssistantAPI = async (query) => {
    try {
      const data = await apiService.queryAssistant(query);
      return data.response;
    } catch (error) {
      console.error('Error calling assistant API:', error);
      return 'Sorry, I\'m having trouble connecting to the server right now. Please try again later.';
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isLoading) {
      // Add user message
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentMessage = newMessage;
      setNewMessage('');
      setIsLoading(true);

      try {
        // Call the Assistant API
        const aiResponse = await callAssistantAPI(currentMessage);
        
        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: aiResponse,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        // Add error message
        const errorMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Affix position={{ bottom: 20, right: 20 }}>
        <Button
          size="lg"
          radius="xl"
          leftSection={<IconMessageCircle size={20} />}
          onClick={handleAssistantClick}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          Assistant
        </Button>
      </Affix>

      {/* Chat Window */}
      {isChatOpen && (
        <Affix position={{ bottom: 100, right: 20 }}>
          <Paper
            shadow="xl"
            radius="lg"
            p="md"
            style={{
              width: 350,
              height: 500,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Chat Header */}
            <Group justify="space-between" mb="md" p="xs">
              <Group gap="sm">
                <Avatar 
                  size="sm" 
                  radius="xl"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <IconRobot size={16} style={{ color: 'white' }} />
                </Avatar>
                <Stack gap={0}>
                  <Text size="sm" fw={600}>AI Assistant</Text>
                  <Badge 
                    size="xs" 
                    color="green" 
                    variant="light"
                    leftSection={
                      <span style={{ 
                        display: 'inline-block', 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        background: '#22c55e',
                        animation: 'pulse 2s infinite'
                      }} />
                    }
                  >
                    Online
                  </Badge>
                </Stack>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                style={{ color: '#667eea' }}
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>

            {/* Messages Area */}
            <ScrollArea 
              flex={1} 
              mb="md"
              style={{ minHeight: 350 }}
            >
              <Stack gap="md">
                {messages.map((message) => (
                  <Group
                    key={message.id}
                    gap="sm"
                    align="flex-start"
                    style={{
                      flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <Avatar 
                      size="sm" 
                      radius="xl"
                      style={{
                        background: message.type === 'user' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#f1f3f4'
                      }}
                    >
                      {message.type === 'user' ? (
                        <IconUser size={14} style={{ color: 'white' }} />
                      ) : (
                        <IconRobot size={14} style={{ color: '#667eea' }} />
                      )}
                    </Avatar>
                    
                    <Paper
                      p="sm"
                      radius="md"
                      style={{
                        maxWidth: '80%',
                        background: message.type === 'user' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#f8f9fa',
                        color: message.type === 'user' ? 'white' : 'inherit'
                      }}
                    >
                      <Text size="sm" style={{ wordBreak: 'break-word' }}>
                        {message.content}
                      </Text>
                      <Text 
                        size="xs" 
                        c={message.type === 'user' ? 'white' : 'dimmed'}
                        mt={4}
                      >
                        {message.timestamp}
                      </Text>
                    </Paper>
                  </Group>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <Group gap="sm" align="flex-start">
                    <Avatar 
                      size="sm" 
                      radius="xl"
                      style={{ background: '#f1f3f4' }}
                    >
                      <IconRobot size={14} style={{ color: '#667eea' }} />
                    </Avatar>
                    <Paper
                      p="sm"
                      radius="md"
                      style={{
                        background: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Loader size="xs" color="#667eea" />
                      <Text size="sm" c="dimmed">AI is thinking...</Text>
                    </Paper>
                  </Group>
                )}
              </Stack>
            </ScrollArea>

            {/* Message Input */}
            <Group gap="sm">
              <TextInput
                placeholder="Ask about events, incidents, zones, staff, or emergency contacts..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ flex: 1 }}
                size="sm"
                radius="md"
                disabled={isLoading}
                styles={{
                  input: {
                    borderColor: '#e9ecef',
                    '&:focus': {
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 1px #667eea'
                    },
                    '&:disabled': {
                      background: '#f8f9fa',
                      color: '#adb5bd'
                    }
                  }
                }}
              />
              <ActionIcon
                size="md"
                radius="md"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:disabled': {
                    background: '#e9ecef',
                    color: '#adb5bd'
                  }
                }}
              >
                {isLoading ? (
                  <Loader size="xs" color="white" />
                ) : (
                  <IconSend size={16} />
                )}
              </ActionIcon>
            </Group>
          </Paper>
        </Affix>
      )}
    </>
  );
}

export default FloatingAssistant; 