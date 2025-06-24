/**
 * Toll Account List Component
 * Displays and manages company toll accounts
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
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Sync as SyncIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useToll } from '../../hooks/useToll';
import TollProviderSetup from './TollProviderSetup';
import TollAccountDetails from './TollAccountDetails';

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
  toll_providers: {
    id: number;
    name: string;
    provider_type: string;
  };
}

const TollAccountList: React.FC = () => {
  const {
    accounts,
    loading,
    error,
    fetchAccounts,
    syncAccount,
    deleteAccount,
  } = useToll();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAccount, setSelectedAccount] = useState<TollAccount | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [syncingAccountId, setSyncingAccountId] = useState<number | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, account: TollAccount) => {
    setAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAccount(null);
  };

  const handleSync = async (accountId: number) => {
    setSyncingAccountId(accountId);
    try {
      await syncAccount(accountId);
      await fetchAccounts();
    } catch (error) {
      console.error('Error syncing account:', error);
    } finally {
      setSyncingAccountId(null);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    setShowSetup(true);
    handleMenuClose();
  };

  const handleView = () => {
    setShowDetails(true);
    handleMenuClose();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteConfirm = async () => {
    if (selectedAccount) {
      try {
        await deleteAccount(selectedAccount.id);
        await fetchAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
    setDeleteDialogOpen(false);
    setSelectedAccount(null);
  };

  const getStatusColor = (status: string) => {
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

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'syncing':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading && !accounts.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Toll Accounts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowSetup(true)}
        >
          Add Account
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {accounts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Toll Accounts Configured
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Set up your first toll provider account to start managing toll costs and transactions.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowSetup(true)}
          >
            Add First Account
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Provider</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Last Sync</TableCell>
                <TableCell>Sync Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {account.toll_providers.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {account.toll_providers.provider_type?.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {account.account_name || account.account_number}
                      </Typography>
                      {account.account_name && (
                        <Typography variant="caption" color="text.secondary">
                          {account.account_number}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.account_status}
                      color={getStatusColor(account.account_status) as unknown}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {account.balance_amount ? (
                      <Typography variant="body2">
                        {account.balance_currency} {account.balance_amount.toFixed(2)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.last_sync_at ? (
                      <Typography variant="body2">
                        {new Date(account.last_sync_at).toLocaleDateString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Never
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={account.sync_status}
                        color={getSyncStatusColor(account.sync_status) as unknown}
                        size="small"
                      />
                      {account.sync_error_message && (
                        <Tooltip title={account.sync_error_message}>
                          <IconButton size="small" color="error">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Tooltip title="Sync Account">
                        <IconButton
                          size="small"
                          onClick={() => handleSync(account.id)}
                          disabled={syncingAccountId === account.id}
                        >
                          {syncingAccountId === account.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <SyncIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, account)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Account
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Account
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Toll Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the toll account for{' '}
            <strong>{selectedAccount?.toll_providers.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All associated transactions and data will be removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Provider Setup Dialog */}
      {showSetup && (
        <TollProviderSetup
          open={showSetup}
          onClose={() => {
            setShowSetup(false);
            setSelectedAccount(null);
          }}
          onSuccess={() => {
            setShowSetup(false);
            setSelectedAccount(null);
            fetchAccounts();
          }}
          editAccount={selectedAccount}
        />
      )}

      {/* Account Details Dialog */}
      {showDetails && selectedAccount && (
        <TollAccountDetails
          open={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedAccount(null);
          }}
          account={selectedAccount}
        />
      )}
    </Box>
  );
};

export default TollAccountList;
