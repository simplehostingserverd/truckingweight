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

import { createClient } from '@/utils/supabase/client';
import { ArrowBack as ArrowLeftIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function NewScale() {
  const [formData, setFormData] = useState({
    name: '',
    scale_type: '',
    location: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    max_capacity: '',
    precision: '',
    calibration_date: '',
    next_calibration_date: '',
    api_endpoint: '',
    api_key: '',
    status: 'Active',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.scale_type) {
        throw new Error('Name and scale type are required');
      }

      // Create the scale via API
      const response = await fetch('/api/scales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create scale');
      }

      const newScale = await response.json();

      // Redirect to the scales list page
      router.push('/scales');
    } catch (error: any) {
      console.error('Error creating scale:', error);
      setError(error.message || 'Failed to create scale');
    } finally {
      setIsLoading(false);
    }
  };

  const scaleTypes = [
    'fixed',
    'portable',
    'truck_scale',
    'rail_scale',
    'livestock_scale',
    'floor_scale',
    'bench_scale',
    'crane_scale',
    'other',
  ];

  const statusOptions = ['Active', 'Inactive', 'Maintenance', 'Calibration'];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Link href="/scales" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" startIcon={<ArrowLeftIcon />} sx={{ mr: 2 }}>
            Back to Scales
          </Button>
        </Link>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Add New Scale
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <Typography variant="h6">Scale Information</Typography>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scale Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Scale Type</InputLabel>
                  <Select
                    value={formData.scale_type}
                    label="Scale Type"
                    onChange={e => handleSelectChange('scale_type', e.target.value)}
                    disabled={isLoading}
                  >
                    {scaleTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </Grid>

              {/* Manufacturer Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Serial Number"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={e => handleSelectChange('status', e.target.value)}
                    disabled={isLoading}
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Technical Specifications */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Capacity (lbs)"
                  name="max_capacity"
                  type="number"
                  value={formData.max_capacity}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Precision (lbs)"
                  name="precision"
                  type="number"
                  value={formData.precision}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </Grid>

              {/* Calibration Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Calibration Date"
                  name="calibration_date"
                  type="date"
                  value={formData.calibration_date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={isLoading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Next Calibration Date"
                  name="next_calibration_date"
                  type="date"
                  value={formData.next_calibration_date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={isLoading}
                />
              </Grid>

              {/* API Configuration */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Endpoint (Optional)"
                  name="api_endpoint"
                  value={formData.api_endpoint}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  helperText="URL endpoint for scale integration"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Key (Optional)"
                  name="api_key"
                  type="password"
                  value={formData.api_key}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  helperText="API key for scale authentication"
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Link href="/scales" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined" disabled={isLoading}>
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Scale'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
