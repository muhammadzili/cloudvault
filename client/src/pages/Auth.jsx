import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';

export default function Auth() {
  const [email, setEmail] = useState('admin@cloudvault.local');
  const [password, setPassword] = useState('SecurePass123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
      <Paper sx={{ p: 5, width: '100%', maxWidth: 400, border: '1px solid #e0e0e0' }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>CloudVault</Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>Sign in to access your files</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3 }} required />
          <Button fullWidth variant="contained" type="submit" size="large" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
        </form>
        
        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>Default: admin@cloudvault.local / SecurePass123!</Typography>
      </Paper>
    </Box>
  );
}