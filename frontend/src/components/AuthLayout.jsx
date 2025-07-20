import { Container, Box, Title, Text, rem } from '@mantine/core'

function AuthLayout({ children, title, subtitle }) {
  return (
    <Container fluid p={0} style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Section - Auth Form */}
      <Box 
        w={{ base: '100%', md: '40%' }} 
        p={{ base: 'md', md: 'xl' }}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white'
        }}
      >
        <Box style={{ 
          maxWidth: rem(400), 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: rem(8), marginBottom: rem(32) }}>
            <Box 
              w={rem(32)} 
              h={rem(32)} 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: rem(8),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text size="sm" fw={700} c="white">D</Text>
            </Box>
            <Text size="lg" fw={700} c="dark.8">Drishti</Text>
          </Box>

          {/* Title */}
          <Title order={1} size="h2" fw={700} ta="center" mb="xs">
            {title}
          </Title>
          
          {subtitle && (
            <Text c="dimmed" size="md" ta="center" mb="xl">
              {subtitle}
            </Text>
          )}

          {/* Form Content */}
          {children}
        </Box>
      </Box>

      {/* Right Section - Abstract Graphic */}
      <Box 
        w={{ base: 0, md: '60%' }} 
        style={{ 
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Abstract Shapes */}
        <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Large curved shapes */}
          <Box 
            style={{
              position: 'absolute',
              top: rem(-100),
              right: rem(-50),
              width: rem(300),
              height: rem(300),
              background: 'rgba(102, 126, 234, 0.3)',
              borderRadius: '50%',
              transform: 'rotate(45deg)'
            }}
          />
          
          <Box 
            style={{
              position: 'absolute',
              bottom: rem(-100),
              left: rem(-50),
              width: rem(250),
              height: rem(250),
              background: 'rgba(118, 75, 162, 0.4)',
              borderRadius: '50%',
              transform: 'rotate(-30deg)'
            }}
          />

          {/* Geometric shapes */}
          <Box 
            style={{
              position: 'absolute',
              top: '20%',
              right: '15%',
              width: 0,
              height: 0,
              borderLeft: `${rem(20)} solid transparent`,
              borderRight: `${rem(20)} solid transparent`,
              borderBottom: `${rem(35)} solid rgba(255, 255, 0, 0.6)`
            }}
          />

          <Box 
            style={{
              position: 'absolute',
              bottom: '30%',
              right: '25%',
              width: rem(40),
              height: rem(40),
              background: 'rgba(255, 165, 0, 0.5)',
              transform: 'rotate(45deg)'
            }}
          />

          {/* Grid pattern */}
          <Box 
            style={{
              position: 'absolute',
              top: '50%',
              left: '20%',
              width: rem(100),
              height: rem(100),
              background: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${rem(20)} ${rem(20)}`
            }}
          />

          {/* Concentric circles */}
          <Box 
            style={{
              position: 'absolute',
              top: '15%',
              left: '10%',
              width: rem(80),
              height: rem(80),
              border: `${rem(2)} solid rgba(255, 255, 255, 0.2)`,
              borderRadius: '50%'
            }}
          />
          <Box 
            style={{
              position: 'absolute',
              top: '15%',
              left: '10%',
              width: rem(60),
              height: rem(60),
              border: `${rem(2)} solid rgba(255, 255, 255, 0.3)`,
              borderRadius: '50%'
            }}
          />

          {/* Small decorative elements */}
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              style={{
                position: 'absolute',
                top: `${20 + i * 8}%`,
                left: `${70 + i * 3}%`,
                width: rem(8),
                height: rem(8),
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%'
              }}
            />
          ))}
        </Box>
      </Box>
    </Container>
  )
}

export default AuthLayout 