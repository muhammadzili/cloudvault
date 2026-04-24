import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Button, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Menu, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Breadcrumbs, Link, Chip, LinearProgress
} from '@mui/material';
import {
  Home, Folder, Description, Upload, Add, Settings as SettingsIcon, Logout, MoreVert,
  ArrowBack, ContentCopy, DriveFileMove, Edit, Delete, Download, Tag, Share
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const drawerWidth = 240;

export default function Dashboard() {
  const { user, logout, api } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuType, setMenuType] = useState(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [targetFolder, setTargetFolder] = useState(null);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  
  const [brandName, setBrandName] = useState('CloudVault');
  
  const [storageInfo, setStorageInfo] = useState({ used: 0, max_storage: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState('');
  const abortControllerRef = useRef(null);

  const loadData = async (folderId = null) => {
    const folderParams = folderId ? `?folder_id=${folderId}` : '';
    const [foldersRes, filesRes, settingsRes, storageRes] = await Promise.all([
      api.get(`/folders${folderParams}`),
      api.get(`/files${folderParams}`),
      api.get('/settings'),
      api.get('/storage-info')
    ]);
    setFolders(foldersRes.data);
    setFiles(filesRes.data);
    setStorageInfo(storageRes.data);
    
    if (settingsRes.data && settingsRes.data.brand_name) {
      setBrandName(settingsRes.data.brand_name);
    }

    setCurrentFolder(folderId);

    if (folderId) {
      const path = await buildBreadcrumb(folderId);
      setBreadcrumbs(path);
    } else {
      setBreadcrumbs([]);
    }
  };

  const buildBreadcrumb = async (folderId) => {
    const path = [];
    let current = folderId;
    while (current) {
      const { data } = await api.get('/folders');
      const folder = data.find(f => f.id === current);
      if (folder) {
        path.unshift(folder);
        current = folder.parent_id;
      } else break;
    }
    return path;
  };

  const loadAllFolders = async () => {
    const { data } = await api.get('/folders');
    setAllFolders(data);
  };

  useEffect(() => { loadData(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(file.name);
    const formData = new FormData();
    formData.append('file', file);
    if (currentFolder) formData.append('folder_id', currentFolder);

    setIsUploading(true);
    setUploadProgress(0);
    
    abortControllerRef.current = new AbortController();

    try {
      await api.post('/files/upload', formData, {
        signal: abortControllerRef.current.signal,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      await loadData(currentFolder);
      setSnackMsg('Upload successful!');
      setSnackOpen(true);
    } catch (err) {
      if (axios.isCancel(err)) {
        setSnackMsg('Upload cancelled');
        setSnackOpen(true);
      } else {
        console.error(err);
        alert(err.response?.data?.error || 'Upload failed');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFile('');
      abortControllerRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    await api.post('/folders', { name: folderName, parent_id: currentFolder });
    setFolderOpen(false);
    setFolderName('');
    loadData(currentFolder);
  };

  const handleOpenFolder = (id) => loadData(id);
  const handleGoUp = () => {
    if (breadcrumbs.length > 0) {
      loadData(breadcrumbs[breadcrumbs.length - 1].parent_id);
    }
  };

  const handleMenuOpen = (e, item, type) => {
    setAnchorEl(e.currentTarget);
    setSelectedItem(item);
    setMenuType(type);
  };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedItem(null); setMenuType(null); };

  const handleRename = async () => {
    if (!newName.trim()) return;
    const endpoint = menuType === 'folder' ? `/folders/${selectedItem.id}` : `/files/${selectedItem.id}`;
    await api.put(endpoint, { name: newName });
    setRenameOpen(false);
    setNewName('');
    handleMenuClose();
    loadData(currentFolder);
  };

  const handleDelete = async () => {
    const endpoint = menuType === 'folder' ? `/folders/${selectedItem.id}` : `/files/${selectedItem.id}`;
    await api.delete(endpoint);
    setDeleteOpen(false);
    handleMenuClose();
    loadData(currentFolder);
  };

  const handleMove = async () => {
    await api.post('/files/move', { file_id: selectedItem.id, folder_id: targetFolder });
    setMoveOpen(false);
    setTargetFolder(null);
    handleMenuClose();
    loadData(currentFolder);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(String(id));
    setSnackMsg(`ID ${id} copied!`);
    setSnackOpen(true);
  };

  const handleDownload = async (file) => {
    const { data } = await api.get(`/files/${file.id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.original_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleShare = async () => {
    handleMenuClose();
    try {
      const { data } = await api.post(`/files/${selectedItem.id}/share`);
      if (data.is_shared) {
        setSnackMsg('File added to Shared Page!');
      } else {
        setSnackMsg('File removed from Shared Page!');
      }
      setSnackOpen(true);
      loadData(currentFolder); // refresh is_shared flag
    } catch (err) {
      alert('Failed to toggle share status');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID');

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
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brandName}</Typography>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => { loadData(null); setBreadcrumbs([]); }}>
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="My Files" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/settings')}>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="API Tokens" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={logout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Box sx={{ mt: 'auto', p: 2, mx: 1 }}>
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Storage Usage</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatSize(storageInfo.used)} / {storageInfo.max_storage > 0 ? formatSize(storageInfo.max_storage) : 'Unlimited'}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={storageInfo.max_storage > 0 ? Math.min(100, (storageInfo.used / storageInfo.max_storage) * 100) : 0} 
              sx={{ height: 6, borderRadius: 3, bgcolor: '#eee' }} 
            />
            {storageInfo.max_storage > 0 && (
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'right', fontSize: '0.7rem', color: (storageInfo.used / storageInfo.max_storage) > 0.9 ? 'error.main' : 'text.secondary' }}>
                {Math.round((storageInfo.used / storageInfo.max_storage) * 100)}% used
              </Typography>
            )}
          </Box>
          
          <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Logged in as</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{user?.email}</Typography>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>My Files</Typography>
            <Button variant="outlined" startIcon={<Add />} onClick={() => setFolderOpen(true)} sx={{ mr: 1 }}>Folder</Button>
            <Button variant="contained" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()}>Upload</Button>
            <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {currentFolder && <IconButton onClick={handleGoUp} sx={{ mr: 1 }}><ArrowBack /></IconButton>}
            <Breadcrumbs>
              <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => { loadData(null); setBreadcrumbs([]); }}>Home</Link>
              {breadcrumbs.map((folder) => (
                <Link key={folder.id} underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => loadData(folder.id)}>{folder.name}</Link>
              ))}
            </Breadcrumbs>
          </Box>

          {folders.length === 0 && files.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Folder sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
              <Typography color="text.secondary">This folder is empty</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600, width: 70 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Modified</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {folders.map((folder) => (
                    <TableRow key={folder.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleOpenFolder(folder.id)}>
                      <TableCell sx={{ color: '#9e9e9e', fontFamily: 'monospace', fontSize: '0.8rem' }}>—</TableCell>
                      <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Folder sx={{ color: '#F59E0B' }} />{folder.name}</Box></TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{formatDate(folder.created_at)}</TableCell>
                      <TableCell align="right"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, folder, 'folder'); }}><MoreVert /></IconButton></TableCell>
                    </TableRow>
                  ))}
                  {files.map((file) => (
                    <TableRow key={file.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip label={file.id} size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); handleCopyId(file.id); }} icon={<Tag sx={{ fontSize: 14 }} />} sx={{ fontFamily: 'monospace', fontSize: '0.75rem', cursor: 'pointer', '&:hover': { bgcolor: '#e3f2fd' } }} />
                        </Box>
                      </TableCell>
                      <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Description sx={{ color: '#1976D2' }} />{file.original_name}</Box></TableCell>
                      <TableCell>{formatSize(file.size)}</TableCell>
                      <TableCell>{formatDate(file.updated_at || file.created_at)}</TableCell>
                      <TableCell align="right"><IconButton size="small" onClick={(e) => handleMenuOpen(e, file, 'file')}><MoreVert /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {menuType === 'file' && <MenuItem onClick={() => { handleCopyId(selectedItem.id); handleMenuClose(); }}><ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>Copy ID</MenuItem>}
        {menuType === 'file' && <MenuItem onClick={() => { handleMenuClose(); handleDownload(selectedItem); }}><ListItemIcon><Download fontSize="small" /></ListItemIcon>Download</MenuItem>}
        {menuType === 'file' && <MenuItem onClick={handleShare}><ListItemIcon><Share fontSize="small" /></ListItemIcon>{selectedItem?.is_shared ? 'Remove from Shared Page' : 'Add to Shared Page'}</MenuItem>}
        {menuType === 'file' && <MenuItem onClick={() => { setNewName(selectedItem.original_name); setRenameOpen(true); }}><ListItemIcon><Edit fontSize="small" /></ListItemIcon>Rename</MenuItem>}
        {menuType === 'file' && <MenuItem onClick={() => { loadAllFolders(); setMoveOpen(true); }}><ListItemIcon><DriveFileMove fontSize="small" /></ListItemIcon>Move</MenuItem>}
        {menuType === 'folder' && <MenuItem onClick={() => { setNewName(selectedItem.name); setRenameOpen(true); }}><ListItemIcon><Edit fontSize="small" /></ListItemIcon>Rename</MenuItem>}
        <MenuItem onClick={() => setDeleteOpen(true)} sx={{ color: 'error.main' }}><ListItemIcon><Delete fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>Delete</MenuItem>
      </Menu>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
        <DialogTitle>Rename {menuType === 'folder' ? 'Folder' : 'File'}</DialogTitle>
        <DialogContent><TextField fullWidth value={newName} onChange={(e) => setNewName(e.target.value)} sx={{ mt: 1 }} /></DialogContent>
        <DialogActions><Button onClick={() => setRenameOpen(false)}>Cancel</Button><Button onClick={handleRename} variant="contained">Save</Button></DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Delete "{selectedItem?.original_name || selectedItem?.name}"?</Typography></DialogContent>
        <DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancel</Button><Button onClick={handleDelete} color="error" variant="contained">Delete</Button></DialogActions>
      </Dialog>

      <Dialog open={moveOpen} onClose={() => setMoveOpen(false)}>
        <DialogTitle>Move File</DialogTitle>
        <DialogContent>
          <Box onClick={() => setTargetFolder(null)} sx={{ p: 1.5, border: targetFolder === null ? '2px solid #1976D2' : '1px solid #e0e0e0', borderRadius: 1, mb: 1, cursor: 'pointer' }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Home sx={{ fontSize: 18 }} />Root</Box></Box>
          {allFolders.filter(f => f.id !== selectedItem?.id).map(folder => (
            <Box key={folder.id} onClick={() => setTargetFolder(folder.id)} sx={{ p: 1.5, border: targetFolder === folder.id ? '2px solid #1976D2' : '1px solid #e0e0e0', borderRadius: 1, mb: 1, cursor: 'pointer' }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Folder sx={{ fontSize: 18, color: '#F59E0B' }} />{folder.name}</Box></Box>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setMoveOpen(false)}>Cancel</Button><Button onClick={handleMove} variant="contained">Move</Button></DialogActions>
      </Dialog>

      <Dialog open={folderOpen} onClose={() => setFolderOpen(false)}>
        <DialogTitle>Create Folder</DialogTitle>
        <DialogContent><TextField fullWidth value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Folder name" sx={{ mt: 1 }} /></DialogContent>
        <DialogActions><Button onClick={() => setFolderOpen(false)}>Cancel</Button><Button onClick={handleCreateFolder} variant="contained">Create</Button></DialogActions>
      </Dialog>

      <Dialog open={isUploading} disableEscapeKeyDown>
        <DialogTitle sx={{ pb: 1 }}>Uploading File</DialogTitle>
        <DialogContent sx={{ minWidth: 350, pt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: 'text.primary', wordBreak: 'break-all' }}>{uploadingFile}</Typography>
          <Box sx={{ width: '100%', mb: 1 }}>
            <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">{uploadProgress}% complete</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelUpload} color="error" variant="outlined" size="small">Cancel Upload</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
}