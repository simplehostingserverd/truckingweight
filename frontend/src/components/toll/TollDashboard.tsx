/**
 * Toll Management Dashboard
 * Main dashboard for toll provider integration and management
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Sync as SyncIcon,
  Assessment as ReportsIcon,
  AccountBalance as AccountIcon,
  Route as RouteIcon,
  Receipt as TransactionIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useToll } from '../../hooks/useToll';
import TollAccountList from './TollAccountList';
import TollTransactionList from './TollTransactionList';
import TollRouteCalculator from './TollRouteCalculator';
import TollReports from './TollReports';
import TollProviderSetup from './TollProviderSetup';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`toll-tabpanel-${index}`}
      aria-labelledby={`toll-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `toll-tab-${index}`,
    'aria-controls': `toll-tabpanel-${index}`,
  };
}

const TollDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    providers,
    accounts,
    summary,
    loading,
    error,
    fetchProviders,
    fetchAccounts,
    fetchSummary,
    syncAllAccounts,
  } = useToll();

  const [activeTab, setActiveTab] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchProviders();
    fetchAccounts();
    fetchSummary();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await syncAllAccounts();
      await fetchAccounts();
      await fetchSummary();
    } catch (error) {
      console.error('Error syncing accounts:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getProviderStatus = (providerId: number) => {
    const account = accounts.find(acc => acc.toll_provider_id === providerId);
    if (!account) return 'not_configured';
    return account.account_status;
  };

  const getProviderStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading && !providers.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Toll Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={syncing ? <CircularProgress size={20} /> : <SyncIcon />}
            onClick={handleSyncAll}
            disabled={syncing || accounts.length === 0}
          >
            {syncing ? 'Syncing...' : 'Sync All'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowSetup(true)}
          >
            Add Provider
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Provider Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {providers.map((provider) => {
          const status = getProviderStatus(provider.id);
          const account = accounts.find(acc => acc.toll_provider_id === provider.id);
          
          return (
            <Grid item xs={12} sm={6} md={3} key={provider.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h2">
                      {provider.name}
                    </Typography>
                    <Chip
                      label={status === 'not_configured' ? 'Not Setup' : status}
                      color={getProviderStatusColor(status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {provider.provider_type?.replace('_', ' ').toUpperCase()}
                  </Typography>
                  {account && (
                    <Box mt={2}>
                      <Typography variant="body2">
                        Account: {account.account_name || account.account_number}
                      </Typography>
                      {account.balance_amount && (
                        <Typography variant="body2" color="primary">
                          Balance: ${account.balance_amount}
                        </Typography>
                      )}
                      {account.last_sync_at && (
                        <Typography variant="caption" color="text.secondary">
                          Last sync: {new Date(account.last_sync_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{accounts.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Accounts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TransactionIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{summary.totalTransactions || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <RouteIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">${summary.totalCost?.toFixed(2) || '0.00'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Toll Costs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ReportsIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{summary.costsByProvider?.length || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Providers
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="toll management tabs">
            <Tab label="Accounts" {...a11yProps(0)} />
            <Tab label="Transactions" {...a11yProps(1)} />
            <Tab label="Route Calculator" {...a11yProps(2)} />
            <Tab label="Reports" {...a11yProps(3)} />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <TollAccountList />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <TollTransactionList />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <TollRouteCalculator />
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <TollReports />
        </TabPanel>
      </Paper>

      {/* Provider Setup Dialog */}
      {showSetup && (
        <TollProviderSetup
          open={showSetup}
          onClose={() => setShowSetup(false)}
          onSuccess={() => {
            setShowSetup(false);
            fetchAccounts();
          }}
        />
      )}
    </Box>
  );
};

export default TollDashboard;
