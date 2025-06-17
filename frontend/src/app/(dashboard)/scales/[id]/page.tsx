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
import HardwareSelector from '@/components/scales/HardwareSelector';
import { toSearchParamString } from '@/utils/searchParams';
import { createClient } from '@/utils/supabase/client';
import {
  ArrowBack as ArrowLeftIcon,
  Edit as PencilIcon,
  QrCode as QrCodeIcon,
  Delete as TrashIcon,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ScaleDetail({ params }: { params: Promise<{ id: string }> }) {
  const [scale, setScale] = useState<unknown>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [id, setId] = useState<string>('');
  const router = useRouter();
  const supabase = createClient();

  // Handle async params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const scaleId = toSearchParamString(resolvedParams.id, '');
      setId(scaleId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchScale = async () => {
      try {
        // Get session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push({ pathname: '/login' });
          return;
        }

        // Get scale data
        const { data, error } = await supabase
          .from('scales')
          .select(
            `
            *,
            companies(
              id,
              name
            ),
            scale_calibrations(
              id,
              calibration_date,
              next_calibration_date,
              calibrated_by,
              notes
            )
          `
          )
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setScale(data);

        // Fetch QR code
        const response = await fetch(`/api/scales/${id}/qrcode`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const qrData = await response.json();
          if (qrData.qrCode) {
            setQrCode(qrData.qrCode);
          }
        }
      } catch (err: unknown) {
        console.error('Error fetching scale:', err);
        setError('Failed to load scale data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScale();
  }, [id, router, supabase]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.from('scales').delete().eq('id', id);

      if (error) {
        throw error;
      }

      router.push('/scales');
    } catch (err: unknown) {
      console.error('Error deleting scale:', err);
      setError('Failed to delete scale');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Link href="/scales" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" startIcon={<ArrowLeftIcon />} sx={{ mt: 2 }}>
              Back to Scales
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  if (!scale) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
        <Alert severity="info">
          <AlertTitle>Not Found</AlertTitle>
          The requested scale could not be found.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Link href="/scales" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" startIcon={<ArrowLeftIcon />} sx={{ mt: 2 }}>
              Back to Scales
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {scale.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Link href={`/scales/${id}/edit`} style={{ textDecoration: 'none' }}>
              <Button variant="outlined" size="small" startIcon={<PencilIcon />}>
                Edit
              </Button>
            </Link>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<TrashIcon />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Box sx={{ width: '100%', mb: 4 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} centered>
            <Tab label="Details" value="details" />
            <Tab label="Hardware" value="hardware" />
            <Tab label="QR Code" value="qrcode" />
          </Tabs>
        </Box>

        {activeTab === 'details' && (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Scale Information" subheader="Details about this scale" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body2">{scale.scale_type}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={scale.status}
                    color={scale.status === 'Active' ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body2">{scale.location || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Company
                  </Typography>
                  <Typography variant="body2">{scale.companies?.name || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Manufacturer
                  </Typography>
                  <Typography variant="body2">{scale.manufacturer || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Model
                  </Typography>
                  <Typography variant="body2">{scale.model || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Serial Number
                  </Typography>
                  <Typography variant="body2">{scale.serial_number || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Capacity
                  </Typography>
                  <Typography variant="body2">
                    {scale.max_capacity ? `${scale.max_capacity.toLocaleString()} lbs` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Precision
                  </Typography>
                  <Typography variant="body2">
                    {scale.precision ? `${scale.precision} lbs` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Calibration
                  </Typography>
                  <Typography variant="body2">
                    {scale.calibration_date
                      ? new Date(scale.calibration_date).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Next Calibration
                  </Typography>
                  <Typography variant="body2">
                    {scale.next_calibration_date
                      ? new Date(scale.next_calibration_date).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeTab === 'hardware' && (
          <Box sx={{ mb: 3 }}>
            <HardwareSelector scaleId={parseInt(id)} />
          </Box>
        )}

        {activeTab === 'qrcode' && (
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Scale QR Code"
              subheader="Scan this QR code to quickly select this scale for weighing"
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {qrCode ? (
                <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 1 }}>
                  <img src={qrCode} alt="Scale QR Code" style={{ width: 256, height: 256 }} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                  <QrCodeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">QR code not available</Typography>
                </Box>
              )}
            </CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Button variant="outlined" onClick={() => window.print()}>
                Print QR Code
              </Button>
            </Box>
          </Card>
        )}

        <Box sx={{ mt: 3 }}>
          <Link href="/scales" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" startIcon={<ArrowLeftIcon />}>
              Back to Scales
            </Button>
          </Link>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this scale? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
