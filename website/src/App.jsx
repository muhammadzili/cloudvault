import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  Grid, 
  Paper, 
  Stack,
  Divider,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Cloud as CloudIcon, 
  GitHub as GitHubIcon, 
  Shield as ShieldIcon, 
  Share as ShareIcon, 
  VpnKey as KeyIcon, 
  Terminal as TerminalIcon,
  GetApp as DownloadIcon,
  Code as CodeIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#4791db'
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: '3.5rem' },
    h2: { fontWeight: 700 },
    h5: { fontWeight: 400, lineHeight: 1.6 },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: '#fff', color: '#212121' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: -0.5 }}>
              CloudVault
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mr: 3 }}>
                <Button color="inherit" size="small" href="https://github.com/muhammadzili/cloudvault/blob/main/docs/getting-started.md" target="_blank">Docs</Button>
                <Button color="inherit" size="small" href="https://github.com/muhammadzili/cloudvault/blob/main/docs/api-guide.md" target="_blank">API</Button>
                <Button color="inherit" size="small" href="https://github.com/muhammadzili/cloudvault/blob/main/docs/security.md" target="_blank">Security</Button>
            </Box>
            <Button 
              variant="contained"
              disableElevation
              startIcon={<GitHubIcon />}
              href="https://github.com/muhammadzili/cloudvault"
              target="_blank"
              sx={{ borderRadius: 2 }}
            >
              Star on GitHub
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Modern Split Hero Section */}
      <Box sx={{ bgcolor: '#fff', pt: { xs: 8, md: 15 }, pb: { xs: 8, md: 12 }, borderBottom: '1px solid #f0f0f0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Chip 
                label="v1.0.0 Now Stabilized" 
                color="primary" 
                variant="outlined" 
                size="small" 
                sx={{ mb: 2, fontWeight: 600, border: '2px solid' }} 
              />
              <Typography variant="h1" gutterBottom sx={{ lineHeight: 1.1 }}>
                Storage for <br/>
                <span style={{ color: '#1976d2' }}>Independence.</span>
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: { xs: 'auto', md: 0 } }}>
                Self-host your personal cloud in minutes. Private, lightning-fast, and 100% under your control.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  disableElevation
                  href="https://github.com/muhammadzili/cloudvault/blob/main/docs/getting-started.md"
                  target="_blank"
                  startIcon={<TerminalIcon />}
                  sx={{ px: 4, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
                >
                  Documentation
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  href="https://github.com/muhammadzili/cloudvault"
                  target="_blank"
                  sx={{ px: 4, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
                >
                  Browse Source
                </Button>
              </Stack>
              <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1 }}>
                 <Stack direction="row" spacing={-1}>
                    {[1,2,3].map(i => <Avatar key={i} sx={{ width: 32, height: 32, border: '2px solid #fff', bgcolor: 'primary.light', fontSize: 12 }}>{i}</Avatar>)}
                 </Stack>
                 <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
                    Trusted by developers for personal VPS hosting
                 </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={24} 
                sx={{ 
                  borderRadius: 4, 
                  overflow: 'hidden', 
                  border: '8px solid #f0f0f0',
                  transform: { md: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)' },
                  transition: 'transform 0.5s ease',
                  '&:hover': { transform: 'none' }
                }}
              >
                <Box 
                    component="img" 
                    src="/cloudvault/panel.png" 
                    alt="CloudVault Dashboard"
                    sx={{ width: '100%', display: 'block' }} 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=1000" }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Area (Ramai) */}
      <Box sx={{ py: 6, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
         <Container maxWidth="lg">
            <Grid container spacing={4} justifyContent="center">
                {[
                    { label: 'Uptime', val: '99.9%' },
                    { label: 'Security', val: 'AES-256' },
                    { label: 'Latency', val: '< 20ms' },
                    { label: 'License', val: 'MIT' }
                ].map((s, i) => (
                    <Grid item xs={6} md={3} key={i} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="800" color="primary">{s.val}</Typography>
                        <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                    </Grid>
                ))}
            </Grid>
         </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 2 }}>CAPABILITIES</Typography>
            <Typography variant="h3" gutterBottom fontWeight="800">Designed for Power Users.</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                All-in-one suite to manage your files, documents, and assets without third-party surveillance.
            </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {[
            { icon: <ShieldIcon />, title: 'Secure Vault', color: '#4caf50', desc: 'Secure login system with JWT tokens and bcrypt password hashing.' },
            { icon: <ShareIcon />, title: 'Public Pages', color: '#ff9800', desc: 'Easily toggle files to be visible on a public-facing shared catalog.' },
            { icon: <KeyIcon />, title: 'Programmable API', color: '#2196f3', desc: 'Generate custom API tokens with specific permissions for integration.' },
            { icon: <StorageIcon />, title: 'VPS Ready', color: '#9c27b0', desc: 'Optimized for fast uploads and downloads on VPS environments.' },
            { icon: <SpeedIcon />, title: 'Fast Rendering', color: '#f44336', desc: 'Lightweight React frontend ensures a fluid user experience.' },
            { icon: <TerminalIcon />, title: 'CLI Integrated', color: '#607d8b', desc: 'Ready for server-side management and automated deployments.' },
          ].map((f, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper variant="outlined" sx={{ p: 4, height: '100%', borderRadius: 3, '&:hover': { borderColor: 'primary.main', bgcolor: '#fff' } }}>
                <Box sx={{ color: f.color, mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" gutterBottom fontWeight="700">{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ py: 10, bgcolor: '#0d47a1', color: '#fff', textAlign: 'center' }}>
         <Container maxWidth="md">
            <StarIcon sx={{ fontSize: 60, mb: 2, color: '#ffca28' }} />
            <Typography variant="h3" fontWeight="800" sx={{ mb: 2 }}>Ready to Host Your Own?</Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>Join developers worldwide who have switched to CloudVault for their private data storage.</Typography>
            <Button variant="contained" size="large" sx={{ bgcolor: '#fff', color: '#0d47a1', fontWeight: 700, px: 6, '&:hover': { bgcolor: '#f0f0f0' } }}>
                Go to Repository
            </Button>
         </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 8, bgcolor: '#fff', borderTop: '1px solid #eee' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CloudIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">CloudVault</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    The ultimate self-hosted file server for personal and professional use. Private, fast, and secure.
                </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2 }}>Product</Typography>
                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">Features</Typography>
                    <Typography variant="body2" color="text.secondary">Security</Typography>
                    <Typography variant="body2" color="text.secondary">API</Typography>
                </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2 }}>Resources</Typography>
                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">Docs</Typography>
                    <Typography variant="body2" color="text.secondary">Guides</Typography>
                    <Typography variant="body2" color="text.secondary">Releases</Typography>
                </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center' }}>
            © 2026 CloudVault Open Source Project. Developed by <a href="https://github.com/muhammadzili" style={{ color: 'inherit' }}>muhammadzili</a>.
          </Typography>
        </Container>
      </Box>

    </ThemeProvider>
  );
}

export default App;
