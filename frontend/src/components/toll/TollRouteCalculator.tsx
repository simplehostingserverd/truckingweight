/**
 * Toll Route Calculator Component
 * Calculate toll costs for routes using integrated toll providers
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Save as SaveIcon,
  LocationOn as LocationIcon,
  Route as RouteIcon,
  AttachMoney as MoneyIcon,
  ExpandMore as ExpandMoreIcon,
  DirectionsCar as VehicleIcon,
  Schedule as TimeIcon,
  Straighten as DistanceIcon,
} from '@mui/icons-material';
import { useToll } from '../../hooks/useToll';
import { useVehicles } from '../../hooks/useVehicles';
import { useLoads } from '../../hooks/useLoads';

interface RouteCalculation {
  totalCost: number;
  currency: string;
  tollPoints: Array<{
    facilityName: string;
    cost: number;
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  }>;
  route: {
    distance: number;
    duration: number;
    coordinates?: Array<[number, number]>;
  };
  alternatives?: RouteCalculation[];
}

const TollRouteCalculator: React.FC = () => {
  const { providers, accounts, calculateTolls, saveRouteEstimate } = useToll();
  const { vehicles } = useVehicles();
  const { loads } = useLoads();

  const [formData, setFormData] = useState({
    origin: {
      address: '',
      latitude: null as number | null,
      longitude: null as number | null,
    },
    destination: {
      address: '',
      latitude: null as number | null,
      longitude: null as number | null,
    },
    vehicleClass: 'truck',
    vehicleType: 'truck',
    vehicleId: '',
    loadId: '',
    providerId: '',
    avoidTolls: false,
    routeOptions: {
      fastest: true,
      shortest: false,
      truckRoute: true,
    },
  });

  const [calculation, setCalculation] = useState<RouteCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set default provider if only one is available
    if (accounts.length === 1) {
      setFormData(prev => ({ ...prev, providerId: accounts[0].toll_provider_id.toString() }));
    }
  }, [accounts]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (type: 'origin' | 'destination', field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const _handleRouteOptionChange = (option: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      routeOptions: {
        ...prev.routeOptions,
        [option]: value,
      },
    }));
  };

  const handleCalculate = async () => {
    if (!formData.origin.address || !formData.destination.address) {
      setError('Please enter both origin and destination addresses');
      return;
    }

    if (!formData.providerId) {
      setError('Please select a toll provider');
      return;
    }

    setCalculating(true);
    setError(null);

    try {
      const result = await calculateTolls({
        origin: formData.origin,
        destination: formData.destination,
        vehicleClass: formData.vehicleClass,
        vehicleType: formData.vehicleType,
        avoidTolls: formData.avoidTolls,
        providerId: parseInt(formData.providerId),
        routeOptions: formData.routeOptions,
      });

      setCalculation(result.calculation);
    } catch (error) {
      setError('Failed to calculate toll costs. Please try again.');
      console.error('Error calculating tolls:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleSaveEstimate = async () => {
    if (!calculation) return;

    setSaving(true);
    try {
      await saveRouteEstimate({
        route_name: `${formData.origin.address} to ${formData.destination.address}`,
        origin_address: formData.origin.address,
        destination_address: formData.destination.address,
        estimated_toll_cost: calculation.totalCost,
        estimated_distance_miles: calculation.route.distance,
        estimated_duration_minutes: Math.round(calculation.route.duration),
        vehicle_class: formData.vehicleClass,
        toll_breakdown: calculation.tollPoints,
        route_alternatives: calculation.alternatives,
        toll_provider_id: parseInt(formData.providerId),
        load_id: formData.loadId ? parseInt(formData.loadId) : null,
        vehicle_id: formData.vehicleId ? parseInt(formData.vehicleId) : null,
      });

      // Show success message or notification
      alert('Route estimate saved successfully!');
    } catch (error) {
      setError('Failed to save route estimate. Please try again.');
      console.error('Error saving estimate:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedProvider = providers.find(p => p.id === parseInt(formData.providerId));
  const activeAccounts = accounts.filter(acc => acc.account_status === 'active');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Toll Route Calculator
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Calculate toll costs for your routes using integrated toll providers.
      </Typography>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Route Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Origin Address"
                    value={formData.origin.address}
                    onChange={(e) => handleLocationChange('origin', 'address', e.target.value)}
                    placeholder="Enter starting location"
                    InputProps={{
                      startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Destination Address"
                    value={formData.destination.address}
                    onChange={(e) => handleLocationChange('destination', 'address', e.target.value)}
                    placeholder="Enter destination"
                    InputProps={{
                      startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Class</InputLabel>
                    <Select
                      value={formData.vehicleClass}
                      onChange={(e) => handleInputChange('vehicleClass', e.target.value)}
                    >
                      <MenuItem value="car">Car</MenuItem>
                      <MenuItem value="truck">Truck</MenuItem>
                      <MenuItem value="semi">Semi-Truck</MenuItem>
                      <MenuItem value="bus">Bus</MenuItem>
                      <MenuItem value="rv">RV</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Toll Provider</InputLabel>
                    <Select
                      value={formData.providerId}
                      onChange={(e) => handleInputChange('providerId', e.target.value)}
                    >
                      {activeAccounts.map((account) => {
                        const provider = providers.find(p => p.id === account.toll_provider_id);
                        return (
                          <MenuItem key={account.id} value={account.toll_provider_id.toString()}>
                            {provider?.name} ({account.account_name || account.account_number})
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle (Optional)</InputLabel>
                    <Select
                      value={formData.vehicleId}
                      onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                    >
                      <MenuItem value="">None</MenuItem>
                      {vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Load (Optional)</InputLabel>
                    <Select
                      value={formData.loadId}
                      onChange={(e) => handleInputChange('loadId', e.target.value)}
                    >
                      <MenuItem value="">None</MenuItem>
                      {loads.map((load) => (
                        <MenuItem key={load.id} value={load.id.toString()}>
                          {load.load_number} - {load.pickup_location} to {load.delivery_location}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={calculating ? <CircularProgress size={20} /> : <CalculateIcon />}
                  onClick={handleCalculate}
                  disabled={calculating || !formData.origin.address || !formData.destination.address || !formData.providerId}
                >
                  {calculating ? 'Calculating...' : 'Calculate Toll Costs'}
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          {calculation ? (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Toll Calculation Results</Typography>
                  <Button
                    variant="outlined"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSaveEstimate}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Estimate'}
                  </Button>
                </Box>

                {selectedProvider && (
                  <Chip
                    label={selectedProvider.name}
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <MoneyIcon color="primary" sx={{ fontSize: 32 }} />
                      <Typography variant="h5" color="primary">
                        ${calculation.totalCost.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Toll Cost
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <DistanceIcon color="primary" sx={{ fontSize: 32 }} />
                      <Typography variant="h5">
                        {calculation.route.distance.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Miles
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <TimeIcon color="primary" sx={{ fontSize: 32 }} />
                      <Typography variant="h5">
                        {Math.round(calculation.route.duration)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Minutes
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Toll Points */}
                <Typography variant="subtitle1" gutterBottom>
                  Toll Points ({calculation.tollPoints.length})
                </Typography>
                <List dense>
                  {calculation.tollPoints.map((point, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <RouteIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={point.facilityName}
                        secondary={point.location.address}
                      />
                      <Typography variant="body2" color="primary" fontWeight="medium">
                        ${point.cost.toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>

                {/* Alternative Routes */}
                {calculation.alternatives && calculation.alternatives.length > 0 && (
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">
                        Alternative Routes ({calculation.alternatives.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {calculation.alternatives.map((alt, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">
                              Route {index + 1}: {alt.route.distance.toFixed(1)} miles, {Math.round(alt.route.duration)} min
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="medium">
                              ${alt.totalCost.toFixed(2)}
                            </Typography>
                          </Box>
                        </Paper>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <CalculateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Calculation Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter route details and click "Calculate Toll Costs" to see results.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TollRouteCalculator;
