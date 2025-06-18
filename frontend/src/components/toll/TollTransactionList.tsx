/**
 * Toll Transaction List Component
 * Displays toll transactions with filtering and search capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sync as SyncIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
// Removed MUI date picker imports for now
import { useToll } from '../../hooks/useToll';
import { useVehicles } from '../../hooks/useVehicles';
import { useDrivers } from '../../hooks/useDrivers';

const TollTransactionList: React.FC = () => {
  const { transactions, accounts, loading, error, fetchTransactions, syncAllAccounts } = useToll();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();

  const [filters, setFilters] = useState({
    account_id: '',
    vehicle_id: '',
    driver_id: '',
    start_date: null as Date | null,
    end_date: null as Date | null,
    search: '',
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [page, filters]);

  const loadTransactions = async () => {
    const params: any = {
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    };

    if (filters.account_id) params.account_id = filters.account_id;
    if (filters.vehicle_id) params.vehicle_id = filters.vehicle_id;
    if (filters.driver_id) params.driver_id = filters.driver_id;
    if (filters.start_date) params.start_date = filters.start_date.toISOString().split('T')[0];
    if (filters.end_date) params.end_date = filters.end_date.toISOString().split('T')[0];

    await fetchTransactions(params);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncAllAccounts();
      await loadTransactions();
    } catch (error) {
      console.error('Error syncing transactions:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'disputed':
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Toll Transactions</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={syncing ? <CircularProgress size={20} /> : <SyncIcon />}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync Transactions'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            disabled={transactions.length === 0}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Account</InputLabel>
                <Select
                  value={filters.account_id}
                  onChange={e => handleFilterChange('account_id', e.target.value)}
                >
                  <MenuItem value="">All Accounts</MenuItem>
                  {accounts.map(account => (
                    <MenuItem key={account.id} value={account.id.toString()}>
                      {account.toll_providers.name} (
                      {account.account_name || account.account_number})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={filters.vehicle_id}
                  onChange={e => handleFilterChange('vehicle_id', e.target.value)}
                >
                  <MenuItem value="">All Vehicles</MenuItem>
                  {vehicles.map(vehicle => (
                    <MenuItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={filters.start_date ? filters.start_date.toISOString().split('T')[0] : ''}
                onChange={e =>
                  handleFilterChange('start_date', e.target.value ? new Date(e.target.value) : null)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={filters.end_date ? filters.end_date.toISOString().split('T')[0] : ''}
                onChange={e =>
                  handleFilterChange('end_date', e.target.value ? new Date(e.target.value) : null)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Transaction Table */}
      {loading && transactions.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : transactions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Transactions Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Object.values(filters).some(v => v)
              ? 'Try adjusting your filters or sync your accounts to load recent transactions.'
              : 'Sync your toll accounts to load transaction data.'}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Facility</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.transaction_date)}
                      </Typography>
                      {transaction.transaction_id && (
                        <Typography variant="caption" color="text.secondary">
                          ID: {transaction.transaction_id}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.company_toll_accounts.toll_providers.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{transaction.toll_facility_name}</Typography>
                      {transaction.vehicle_class && (
                        <Typography variant="caption" color="text.secondary">
                          Class: {transaction.vehicle_class}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.vehicles ? (
                        <Typography variant="body2">
                          {transaction.vehicles.make} {transaction.vehicles.model}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {transaction.vehicles.license_plate}
                          </Typography>
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.transaction_status}
                        color={getStatusColor(transaction.transaction_status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.location_address || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={Math.ceil(1000 / limit)} // This should come from API response
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default TollTransactionList;
