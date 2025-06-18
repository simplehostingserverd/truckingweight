/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Refresh as ArrowPathIcon,
  Search as MagnifyingGlassIcon,
  Add as PlusIcon,
  Scale as ScaleIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Scale } from '@/types/fleet';

export default function ScalesPage() {
  const [scales, setScales] = useState<Scale[]>([]);
  const [filteredScales, setFilteredScales] = useState<Scale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [view, setView] = useState('table');
  const [selectedScale, setSelectedScale] = useState<Scale | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [_connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>(
    'disconnected'
  );
  const [showConnectionSnackbar, setShowConnectionSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [_snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('info');
  const [activeScales, setActiveScales] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    fetchScales();
  }, []);

  useEffect(() => {
    filterScales();
  }, [scales, searchTerm, statusFilter, typeFilter]);

  const fetchScales = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      // Try to get user data, but don't fail if not found
      const { data: userData, error: _userError } = await supabase
        .from('users')
        .select('company_id, is_admin')
        .eq('id', sessionData.session.user.id);

      // Use first user or create a default admin user object
      const user =
        userData && userData.length > 0 ? userData[0] : { company_id: 1, is_admin: true };

      // Use type-safe query with the updated Database type
      let query = supabase.from('scales').select('*, companies(id, name)');

      // If not admin, filter by company
      if (!user.is_admin) {
        query = query.eq('company_id', user.company_id);
      }

      const { _data, error: scalesError } = await query.order('name');

      if (scalesError) {
        throw scalesError;
      }

      // Count active scales
      const activeScalesCount = data ? data.filter(scale => scale.status === 'Active').length : 0;
      setActiveScales(activeScalesCount);

      // Check if any scales are connected to the weight capture system
      const connectedScales = await checkConnectedScales(data || []);

      setScales(data || []);
      setFilteredScales(data || []);
    } catch (err: unknown) {
      console.error('Error fetching scales:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scales');
    } finally {
      setIsLoading(false);
    }
  };

  // Check which scales are connected to the weight capture system
  const checkConnectedScales = async (scalesData: Scale[]) => {
    try {
      // In a real implementation, this would check with the backend
      // For now, we'll just simulate it
      return scalesData.filter(
        scale => scale.status === 'Active' && Math.random() > 0.7 // Randomly mark some scales as connected
      );
    } catch (error) {
      console.error('Error checking connected scales:', error);
      return [];
    }
  };

  // Connect to a scale for weight capture
  const connectToScale = async (scale: Scale) => {
    if (!scale || scale.status !== 'Active') {
      setSnackbarMessage('Cannot connect to inactive scale');
      setSnackbarSeverity('error');
      setShowConnectionSnackbar(true);
      return;
    }

    setSelectedScale(scale);
    setIsConnecting(true);
    setConnectionStatus('disconnected');

    try {
      // In a real implementation, this would connect to the scale's API
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success or failure
      const success = Math.random() > 0.2;

      if (success) {
        setConnectionStatus('connected');
        setSnackbarMessage(`Connected to ${scale.name} successfully`);
        setSnackbarSeverity('success');
      } else {
        setConnectionStatus('error');
        setSnackbarMessage(`Failed to connect to ${scale.name}`);
        setSnackbarSeverity('error');
      }

      setShowConnectionSnackbar(true);
    } catch (error) {
      console.error('Error connecting to scale:', error);
      setConnectionStatus('error');
      setSnackbarMessage('Error connecting to scale');
      setSnackbarSeverity('error');
      setShowConnectionSnackbar(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const filterScales = () => {
    let filtered = [...scales];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        scale =>
          scale.name.toLowerCase().includes(term) ||
          scale.location?.toLowerCase().includes(term) ||
          scale.manufacturer?.toLowerCase().includes(term) ||
          scale.model?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(scale => scale.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(scale => scale.scale_type === typeFilter);
    }

    setFilteredScales(filtered);
  };

  // Get unique scale types for filter
  const scaleTypes = ['all', ...new Set(scales.map(scale => scale.scale_type))];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Scales
        </Typography>
        <Link href="/scales/new" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<PlusIcon />}>
            Add Scale
          </Button>
        </Link>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search scales..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <MagnifyingGlassIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="type-filter-label">Type</InputLabel>
            <Select
              labelId="type-filter-label"
              value={typeFilter}
              label="Type"
              onChange={e => setTypeFilter(e.target.value)}
            >
              {scaleTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={fetchScales}>
            <ArrowPathIcon />
          </Button>
        </Box>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Tabs value={view} onChange={(_, newValue) => setView(newValue)} sx={{ mb: 3 }} centered>
          <Tab label="Table View" value="table" />
          <Tab label="Grid View" value="grid" />
        </Tabs>

        {view === 'table' && (
          <>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : filteredScales.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary">No scales found</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Manufacturer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Calibration</TableCell>
                      <TableCell>Weight Capture</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredScales.map(scale => (
                      <TableRow key={scale.id}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{scale.name}</TableCell>
                        <TableCell>{scale.scale_type}</TableCell>
                        <TableCell>{scale.location || 'N/A'}</TableCell>
                        <TableCell>{scale.manufacturer || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={scale.status}
                            color={
                              scale.status === 'Active'
                                ? 'success'
                                : scale.status === 'Maintenance'
                                  ? 'warning'
                                  : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {scale.calibration_date
                            ? new Date(scale.calibration_date).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            color={scale.status === 'Active' ? 'primary' : 'inherit'}
                            disabled={scale.status !== 'Active' || isConnecting}
                            onClick={e => {
                              e.preventDefault(); // Prevent navigation to detail page
                              connectToScale(scale);
                            }}
                            startIcon={<SyncIcon />}
                            sx={{ mr: 1 }}
                          >
                            {isConnecting && selectedScale?.id === scale.id ? (
                              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                            ) : null}
                            Connect
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Link href={`/scales/${scale.id}`} style={{ textDecoration: 'none' }}>
                            <Button variant="outlined" size="small">
                              View
                            </Button>
                          </Link>
                          <Link
                            href={`/weights/capture?scale=${scale.id}`}
                            style={{ textDecoration: 'none', marginLeft: '8px' }}
                          >
                            <Button variant="outlined" size="small" color="secondary">
                              Weigh
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {view === 'grid' && (
          <>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : filteredScales.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary">No scales found</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredScales.map(scale => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={scale.id}>
                    <Link href={`/scales/${scale.id}`} style={{ textDecoration: 'none' }}>
                      <Card
                        sx={{
                          height: '100%',
                          transition: 'box-shadow 0.3s',
                          '&:hover': { boxShadow: 6 },
                          cursor: 'pointer',
                        }}
                      >
                        <CardHeader
                          title={scale.name}
                          subheader={scale.scale_type}
                          action={
                            <Chip
                              label={scale.status}
                              color={
                                scale.status === 'Active'
                                  ? 'success'
                                  : scale.status === 'Maintenance'
                                    ? 'warning'
                                    : 'error'
                              }
                              size="small"
                            />
                          }
                        />
                        <CardContent>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Location:
                              </Typography>
                              <Typography variant="body2">{scale.location || 'N/A'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Manufacturer:
                              </Typography>
                              <Typography variant="body2">{scale.manufacturer || 'N/A'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Model:
                              </Typography>
                              <Typography variant="body2">{scale.model || 'N/A'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Last Calibration:
                              </Typography>
                              <Typography variant="body2">
                                {scale.calibration_date
                                  ? new Date(scale.calibration_date).toLocaleDateString()
                                  : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                              variant="contained"
                              size="small"
                              color={scale.status === 'Active' ? 'primary' : 'inherit'}
                              disabled={scale.status !== 'Active' || isConnecting}
                              onClick={e => {
                                e.preventDefault(); // Prevent navigation to detail page
                                e.stopPropagation();
                                connectToScale(scale);
                              }}
                              startIcon={<SyncIcon />}
                            >
                              {isConnecting && selectedScale?.id === scale.id ? (
                                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                              ) : null}
                              Connect
                            </Button>
                            <Link
                              href={`/weights/capture?scale=${scale.id}`}
                              style={{ textDecoration: 'none' }}
                              onClick={e => e.stopPropagation()}
                            >
                              <Button variant="outlined" size="small" color="secondary">
                                Weigh
                              </Button>
                            </Link>
                          </Box>
                        </CardContent>
                      </Card>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>

      {/* Stats Card */}
      <Card sx={{ mt: 4, mb: 2, bgcolor: 'primary.dark' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" color="white">
                Scale System Status
              </Typography>
              <Typography variant="body2" color="primary.light">
                {activeScales} of {scales.length} scales are active and ready for weight capture
              </Typography>
            </Grid>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
            >
              <Link href="/weights/capture" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="secondary" startIcon={<ScaleIcon />}>
                  Go to Weight Capture
                </Button>
              </Link>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Connection Status Snackbar */}
      <Snackbar
        open={showConnectionSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowConnectionSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
