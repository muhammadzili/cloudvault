import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Button, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Tabs, Tab, Chip, TableSortLabel
} from '@mui/material';
import { Home, Settings as SettingsIcon, Logout, Add, Delete, ContentCopy, Code } from '@mui/icons-material';

const PERMISSIONS = ['read', 'write', 'delete', 'admin'];
const drawerWidth = 240;

export default function Settings() {
  const { user, logout, api } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [tokenExpiry, setTokenExpiry] = useState('');
  const [newToken, setNewToken] = useState(null);

  const [settingsForm, setSettingsForm] = useState({
    brand_name: '',
    logo_url: '',
    description: '',
    meta_keys: '',
    seo_title: '',
    max_file_size: '100',
    max_storage_size: '1024'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const logoInputRef = useRef(null);

  const loadTokens = async () => {
    const { data } = await api.get('/tokens');
    setTokens(data);
  };

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettingsForm(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    loadTokens(); 
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.post('/settings', settingsForm);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Error saving settings');
    }
    setSavingSettings(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const { data } = await api.post('/settings/logo', formData);
      setSettingsForm(prev => ({ ...prev, logo_url: data.logo_url }));
    } catch (err) {
      alert('Logo upload failed');
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleCreateToken = async () => {
    if (!tokenName.trim() || selectedPerms.length === 0) return;
    const { data } = await api.post('/tokens', { name: tokenName, permissions: selectedPerms, expires_at: tokenExpiry || null });
    setNewToken(data.token);
    setTokenName('');
    setSelectedPerms([]);
    setTokenExpiry('');
    loadTokens();
  };

  const handleDeleteToken = async (id) => {
    if (!confirm('Revoke this token?')) return;
    await api.delete(`/tokens/${id}`);
    loadTokens();
  };

  const copyToken = (token) => navigator.clipboard.writeText(token);
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('id-ID') : 'Never';
  const isExpired = (date) => date && new Date(date) < new Date();

  const getChipColor = (perm) => {
    const colors = { admin: 'secondary', write: 'warning', delete: 'error', read: 'primary' };
    return colors[perm] || 'default';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e0e0e0' },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>CV</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settingsForm.brand_name || 'CloudVault'}</Typography>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/')}>
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="My Files" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setTab(0)} sx={{ bgcolor: tab === 0 ? 'primary.main' : 'transparent', color: tab === 0 ? '#fff' : 'inherit' }}>
              <ListItemIcon><SettingsIcon sx={{ color: tab === 0 ? '#fff' : 'inherit' }} /></ListItemIcon>
              <ListItemText primary="API Tokens" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setTab(1)} sx={{ bgcolor: tab === 1 ? 'primary.main' : 'transparent', color: tab === 1 ? '#fff' : 'inherit' }}>
              <ListItemIcon><Code sx={{ color: tab === 1 ? '#fff' : 'inherit' }} /></ListItemIcon>
              <ListItemText primary="Documentation" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setTab(2)} sx={{ bgcolor: tab === 2 ? 'primary.main' : 'transparent', color: tab === 2 ? '#fff' : 'inherit' }}>
              <ListItemIcon><SettingsIcon sx={{ color: tab === 2 ? '#fff' : 'inherit' }} /></ListItemIcon>
              <ListItemText primary="Brand & SEO" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={logout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
        <Box sx={{ mt: 'auto', p: 2, mx: 1, mb: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">Logged in as</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{user?.email}</Typography>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar><Typography variant="h6">Settings</Typography></Toolbar>
        </AppBar>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', px: 3 }}>
          <Tab label="API Tokens" />
          <Tab label="Documentation" />
          <Tab label="Brand & SEO" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>API Tokens</Typography>
                  <Typography variant="body2" color="text.secondary">Manage API tokens for external access</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Create Token</Button>
              </Box>

              {tokens.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">No API tokens yet</Typography></Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#fafafa' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tokens.map(token => (
                        <TableRow key={token.id}>
                          <TableCell sx={{ fontWeight: 500 }}>{token.name}</TableCell>
                          <TableCell>{JSON.parse(token.permissions).map(p => <Chip key={p} label={p} size="small" color={getChipColor(p)} sx={{ mr: 0.5 }} />)}</TableCell>
                          <TableCell>{formatDate(token.created_at)}</TableCell>
                          <TableCell>{formatDate(token.expires_at)}</TableCell>
                          <TableCell>{isExpired(token.expires_at) ? <Chip label="Expired" size="small" color="error" /> : token.expires_at ? <Chip label="Active" size="small" color="success" /> : <Chip label="Never" size="small" />}</TableCell>
                          <TableCell align="right"><IconButton size="small" color="error" onClick={() => handleDeleteToken(token.id)}><Delete /></IconButton></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Paper sx={{ mt: 3, p: 3, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Quick Start</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Use your API token:</Typography>
                <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#fff', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  <pre style={{ margin: 0 }}>{`curl -H "Authorization: Bearer YOUR_TOKEN" \\
  ${window.location.origin}/api/public/files`}</pre>
                </Paper>
              </Paper>
            </>
          )}

          {tab === 1 && (
            <Box>
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Authentication</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Include your API token in the Authorization header:</Typography>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', fontFamily: 'monospace', fontSize: '0.875rem' }}>Authorization: Bearer YOUR_API_TOKEN</Paper>
                <Box sx={{ mt: 2 }}>{PERMISSIONS.map(p => <Chip key={p} label={p} size="small" color={getChipColor(p)} sx={{ mr: 1 }} />)}</Box>
              </Paper>

              <Paper sx={{ p: 3, mb: 2, border: '2px solid #1976D2', bgcolor: '#e3f2fd' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1976D2' }}>⚡ Workflow: Cara Pakai API</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>1. <strong>List files</strong> dulu untuk dapat <strong>ID</strong> setiap file</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>2. Gunakan <strong>ID</strong> tersebut untuk download atau delete</Typography>
                <Typography variant="body2" color="text.secondary">⚠️ Jika ID tidak ditemukan, API akan return <strong>404 Not Found</strong></Typography>
              </Paper>

              <Paper sx={{ p: 3, mb: 2 }}>
                <Chip label="STEP 1" size="small" color="primary" sx={{ mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>List Files — Dapatkan ID</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>GET /api/public/files (requires: read)</Typography>
                <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.8rem', borderRadius: 1 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`curl -H "Authorization: Bearer TOKEN" \\
  ${window.location.origin}/api/public/files

# Response:
# [{"id": 1, "original_name": "file.pdf", "size": 1024, ...}]
#        ↑
#    Gunakan ID ini untuk download/delete`}</pre>
                </Paper>
              </Paper>

              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Upload File</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>POST /api/public/files/upload (requires: write)</Typography>
                <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.8rem', borderRadius: 1 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`curl -X POST -H "Authorization: Bearer TOKEN" \\
  -F "file=@file.pdf" \\
  ${window.location.origin}/api/public/files/upload

# Response: {"id": 2, "original_name": "file.pdf"}`}</pre>
                </Paper>
              </Paper>

              <Paper sx={{ p: 3, mb: 2 }}>
                <Chip label="STEP 2" size="small" color="success" sx={{ mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Download File — Pakai ID</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>GET /api/public/files/<strong>:id</strong>/download (requires: read)</Typography>
                <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.8rem', borderRadius: 1 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`# Download file dengan ID 1
curl -H "Authorization: Bearer TOKEN" \\
  ${window.location.origin}/api/public/files/1/download \\
  -o output.pdf

# ID tidak ada? → 404 Not Found`}</pre>
                </Paper>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Delete File — Pakai ID</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>DELETE /api/public/files/<strong>:id</strong> (requires: delete)</Typography>
                <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.8rem', borderRadius: 1 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`curl -X DELETE -H "Authorization: Bearer TOKEN" \\
  ${window.location.origin}/api/public/files/1

# ID tidak ada? → 404 Not Found`}</pre>
                </Paper>
              </Paper>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Site Brand & Aesthetics</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  These settings affect the visual appearance and title of the login, dashboard, and shared pages.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField 
                    label="Brand Name" 
                    value={settingsForm.brand_name} 
                    onChange={e => setSettingsForm({...settingsForm, brand_name: e.target.value})} 
                    fullWidth 
                    helperText="Displayed in the top navigation and various page headers."
                  />
                  
                  <Box sx={{ border: '1px dashed #ccc', p: 3, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {settingsForm.logo_url ? (
                      <Box component="img" src={settingsForm.logo_url} sx={{ maxHeight: 60, maxWidth: 150, objectFit: 'contain' }} />
                    ) : (
                      <Box sx={{ width: 60, height: 60, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                        No Logo
                      </Box>
                    )}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>Upload Custom Brand Logo</Typography>
                      <Button variant="outlined" component="label">
                        Upload Image
                        <input hidden accept="image/*" type="file" ref={logoInputRef} onChange={handleLogoUpload} />
                      </Button>
                      {settingsForm.logo_url && (
                        <Button color="error" size="small" sx={{ ml: 1 }} onClick={() => setSettingsForm({...settingsForm, logo_url: ''})}>
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <TextField 
                    label="Site Description" 
                    value={settingsForm.description} 
                    onChange={e => setSettingsForm({...settingsForm, description: e.target.value})} 
                    fullWidth 
                    multiline
                    rows={3}
                    helperText="Description of your site, injected into SEO meta tags and Shared Pages."
                  />
                </Box>
              </Paper>

              <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>System Limits</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Configure maximum limits for file uploads and total server storage.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField 
                    label="Max File Size (MB)" 
                    type="number"
                    value={settingsForm.max_file_size} 
                    onChange={e => setSettingsForm({...settingsForm, max_file_size: e.target.value})} 
                    fullWidth 
                    helperText="Maximum allowed size for a single file upload."
                  />
                  
                  <TextField 
                    label="Total Storage Limit (MB)" 
                    type="number"
                    value={settingsForm.max_storage_size} 
                    onChange={e => setSettingsForm({...settingsForm, max_storage_size: e.target.value})} 
                    fullWidth 
                    helperText="Total storage allowed across all files. Set to 0 for unlimited."
                  />
                </Box>
              </Paper>

              <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Search Engine Optimization (SEO)</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Custom tags used by search engine crawlers when they index your shared links.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField 
                    label="Global SEO Title" 
                    value={settingsForm.seo_title} 
                    onChange={e => setSettingsForm({...settingsForm, seo_title: e.target.value})} 
                    fullWidth 
                    helperText="The default title for the browser tab. (e.g., 'CloudVault - Secure File Storage')"
                  />
                  <TextField 
                    label="META Keywords" 
                    value={settingsForm.meta_keys} 
                    onChange={e => setSettingsForm({...settingsForm, meta_keys: e.target.value})} 
                    fullWidth 
                    placeholder="files, cloud, storage, personal"
                    helperText="Comma separated generic keywords for your file hub."
                  />
                </Box>
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={handleSaveSettings} 
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Saving...' : 'Save All Settings'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setNewToken(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Create API Token</DialogTitle>
        <DialogContent>
          {!newToken ? (
            <>
              <TextField fullWidth label="Token Name" value={tokenName} onChange={(e) => setTokenName(e.target.value)} sx={{ mt: 2, mb: 2 }} placeholder="e.g., Development Key" />
              <Typography variant="body2" sx={{ mb: 1 }}>Permissions</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {PERMISSIONS.map(perm => (
                  <Chip key={perm} label={perm} onClick={() => setSelectedPerms(p => p.includes(perm) ? p.filter(x => x !== perm) : [...p, perm])} color={selectedPerms.includes(perm) ? 'primary' : 'default'} />
                ))}
              </Box>
              <TextField fullWidth label="Expiration (Optional)" type="datetime-local" value={tokenExpiry} onChange={(e) => setTokenExpiry(e.target.value)} InputLabelProps={{ shrink: true }} />
            </>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: 'success.main', fontWeight: 600, mb: 1 }}>Token Created!</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>Copy this token now:</Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ flex: 1, fontFamily: 'monospace', wordBreak: 'break-all' }}>{newToken}</Typography>
                <IconButton onClick={() => copyToken(newToken)}><ContentCopy /></IconButton>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!newToken && <Button onClick={() => { setDialogOpen(false); setTokenName(''); setSelectedPerms([]); }}>Cancel</Button>}
          {!newToken && <Button onClick={handleCreateToken} variant="contained" disabled={!tokenName.trim() || selectedPerms.length === 0}>Create</Button>}
          {newToken && <Button onClick={() => { setDialogOpen(false); setNewToken(null); }} variant="contained">Done</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
}