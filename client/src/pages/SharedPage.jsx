import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';
import { Download as DownloadIcon, InsertDriveFile as InsertDriveFileIcon } from '@mui/icons-material';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatDate = (date) => new Date(date).toLocaleDateString('id-ID');

function SharedPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/shared`);
        setData(response.data);
        
        // Update SEO Meta Tags
        if (response.data.settings) {
          const { brand_name, seo_title, description, meta_keys } = response.data.settings;
          document.title = seo_title || brand_name || 'Shared Files';
          
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = description || '';

          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = "keywords";
            document.head.appendChild(metaKeywords);
          }
          metaKeywords.content = meta_keys || '';
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load shared files.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = (id) => {
    window.location.href = `http://localhost:3001/api/shared/download/${id}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8f9fa' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8f9fa' }}>
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', p: 5, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Error
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {error}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  const { files, settings } = data;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header Bar Area */}
      <Box sx={{ width: '100%', bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', py: 2 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {settings.logo_url ? (
            <Box
              component="img"
              src={settings.logo_url}
              alt={settings.brand_name}
              sx={{ maxHeight: 40 }}
            />
          ) : (
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 'bold' }}>
              {(settings.brand_name || 'CV').substring(0, 2).toUpperCase()}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#212121', lineHeight: 1.2 }}>
              {settings.brand_name || 'CloudVault'}
            </Typography>
            {settings.description && (
              <Typography variant="caption" sx={{ color: '#757575' }}>
                {settings.description}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="600" color="#212121">
              Public Files
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {files.length} file(s) available
            </Typography>
          </Box>

          {files.length === 0 ? (
            <Paper elevation={0} sx={{ textAlign: 'center', py: 8, border: '1px solid #e0e0e0', bgcolor: '#ffffff' }}>
              <InsertDriveFileIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
              <Typography color="text.secondary">No public files are currently available.</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', bgcolor: '#ffffff' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <InsertDriveFileIcon sx={{ color: '#1976D2' }} />
                          <Typography variant="body2" fontWeight="500" sx={{ color: '#212121' }}>
                            {file.original_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#757575' }}>{formatBytes(file.size)}</TableCell>
                      <TableCell align="right">
                        <Button 
                          variant="contained" 
                          size="small" 
                          disableElevation
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(file.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default SharedPage;
