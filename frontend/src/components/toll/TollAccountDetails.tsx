/**
 * Toll Account Details Component
 * Detailed view of a toll account with sync history and settings
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  AccountBalance as AccountIcon,
  Sync as SyncIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface TollAccount {
  id: number;
  account_number: string;
  account_name: string;
  account_status: string;
  balance_amount: number;
  balance_currency: string;
  last_sync_at: string;
  sync_status: string;
  sync_error_message?: string;
  created_at: string;
  updated_at: string;
  toll_providers: {
    id: number;
    name: string;
    provider_type: string;
    supported_regions: string[];
    features: unknown;
  };
  vehicle_toll_transponders?: Array<{
    id: number;
    transponder_id: string;
    transponder_type: string;
    status: string;
    assigned_date: string;
    vehicles: {
      id: number;
      make: string;
      model: string;
      license_plate: string;
    };
  }>;
}

interface TollAccountDetailsProps {
  open: boolean;
  onClose: () => void;
  account: TollAccount;
}

const TollAccountDetails: React.FC<TollAccountDetailsProps> = ({ open, onClose, account }) => {
  const [syncHistory, setSyncHistory] = useState<unknown[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (open && account) {
      loadSyncHistory();
    }
  }, [open, account]);

  const loadSyncHistory = async () => {
    setLoadingHistory(true);
    try {
      // This would be an API call to get sync history
      // For now, we'll use mock data
      const mockHistory = [
        {
          id: 1,
          sync_type: 'full_sync',
          sync_status: 'completed',
          records_processed: 45,
          records_created: 12,
          records_updated: 33,
          sync_duration_seconds: 15,
          started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15000).toISOString(),
        },
        {
          id: 2,
          sync_type: 'transactions',
          sync_status: 'failed',
          error_message: 'API rate limit exceeded',
          started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5000).toISOString(),
        },
      ];
      setSyncHistory(mockHistory);
    } catch (error) {
      console.error('Error loading sync history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'success':
        return 'success';
      case 'suspended':
      case 'error':
      case 'failed':
        return 'error';
      case 'pending':
      case 'syncing':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <SuccessIcon color="success" />;
      case 'failed':
      case 'error':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <AccountIcon />
          <Box>
            <Typography variant="h6">{account.account_name || account.account_number}</Typography>
            <Typography variant="body2" color="text.secondary">
              {account.toll_providers.name} Account
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Account Information
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemText primary="Account Number" secondary={account.account_number} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Account Name"
                      secondary={account.account_name || 'Not set'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={account.account_status}
                          color={getStatusColor(account.account_status) as unknown}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Balance"
                      secondary={
                        account.balance_amount
                          ? formatCurrency(account.balance_amount, account.balance_currency)
                          : 'Not available'
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Created" secondary={formatDate(account.created_at)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Last Updated"
                      secondary={formatDate(account.updated_at)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Provider Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Provider Details
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemText primary="Provider" secondary={account.toll_providers.name} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Type"
                      secondary={account.toll_providers.provider_type
                        ?.replace('_', ' ')
                        .toUpperCase()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Supported Regions"
                      secondary={account.toll_providers.supported_regions?.join(', ') || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Features"
                      secondary={
                        account.toll_providers.features
                          ? Object.keys(account.toll_providers.features)
                              .filter(key => account.toll_providers.features[key])
                              .join(', ')
                          : 'N/A'
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Sync Status */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SyncIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Sync Status
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Chip
                        label={account.sync_status}
                        color={getStatusColor(account.sync_status) as unknown}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Current Status
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Typography variant="body1">
                        {account.last_sync_at ? formatDate(account.last_sync_at) : 'Never'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Sync
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Typography variant="body1">{syncHistory.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Syncs
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {account.sync_error_message && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {account.sync_error_message}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Assigned Transponders */}
          {account.vehicle_toll_transponders && account.vehicle_toll_transponders.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Assigned Transponders ({account.vehicle_toll_transponders.length})
                  </Typography>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Transponder ID</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Vehicle</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Assigned Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {account.vehicle_toll_transponders.map(transponder => (
                          <TableRow key={transponder.id}>
                            <TableCell>{transponder.transponder_id}</TableCell>
                            <TableCell>{transponder.transponder_type}</TableCell>
                            <TableCell>
                              {transponder.vehicles.make} {transponder.vehicles.model}
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                {transponder.vehicles.license_plate}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transponder.status}
                                color={getStatusColor(transponder.status) as unknown}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(transponder.assigned_date).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Sync History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Sync History
                </Typography>

                {loadingHistory ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                  </Box>
                ) : syncHistory.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Records</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Started</TableCell>
                          <TableCell>Completed</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {syncHistory.map(sync => (
                          <TableRow key={sync.id}>
                            <TableCell>{sync.sync_type}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                {getStatusIcon(sync.sync_status)}
                                <Chip
                                  label={sync.sync_status}
                                  color={getStatusColor(sync.sync_status) as unknown}
                                  size="small"
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              {sync.records_processed ? (
                                <Typography variant="body2">
                                  {sync.records_processed} processed
                                  {sync.records_created && (
                                    <>
                                      <br />
                                      {sync.records_created} created
                                    </>
                                  )}
                                  {sync.records_updated && (
                                    <>
                                      <br />
                                      {sync.records_updated} updated
                                    </>
                                  )}
                                </Typography>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              {sync.sync_duration_seconds
                                ? `${sync.sync_duration_seconds}s`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{formatDate(sync.started_at)}</TableCell>
                            <TableCell>
                              {sync.completed_at ? formatDate(sync.completed_at) : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No sync history available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TollAccountDetails;
