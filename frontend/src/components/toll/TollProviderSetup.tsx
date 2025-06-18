/**
 * Toll Provider Setup Component
 * Dialog for setting up and configuring toll provider accounts
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useToll } from '../../hooks/useToll';

interface TollProvider {
  id: number;
  name: string;
  provider_type: string;
  authentication_type: string;
  supported_regions: string[];
  features: unknown;
}

interface TollAccount {
  id?: number;
  toll_provider_id: number;
  account_number: string;
  account_name: string;
  credentials: unknown;
  account_settings: unknown;
}

interface TollProviderSetupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAccount?: TollAccount | null;
}

const steps = ['Select Provider', 'Configure Account', 'Test Connection'];

const TollProviderSetup: React.FC<TollProviderSetupProps> = ({
  open,
  onClose,
  onSuccess,
  editAccount,
}) => {
  const {
    providers,
    loading,
    error,
    fetchProviders,
    createAccount,
    updateAccount,
    testConnection,
  } = useToll();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<TollProvider | null>(null);
  const [formData, setFormData] = useState<Partial<TollAccount>>({
    account_number: '',
    account_name: '',
    credentials: {},
    account_settings: {},
  });
  const [connectionTest, setConnectionTest] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProviders();
      if (editAccount) {
        // Pre-populate form for editing
        const provider = providers.find(p => p.id === editAccount.toll_provider_id);
        setSelectedProvider(provider || null);
        setFormData(editAccount);
        setActiveStep(1); // Skip provider selection
      }
    }
  }, [open, editAccount, providers]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleProviderSelect = (provider: TollProvider) => {
    setSelectedProvider(provider);
    setFormData({
      ...formData,
      toll_provider_id: provider.id,
      credentials: getDefaultCredentials(provider),
    });
    handleNext();
  };

  const getDefaultCredentials = (provider: TollProvider) => {
    switch (provider.name.toLowerCase()) {
      case 'pc miler':
        return { apiKey: '', region: 'NA', units: 'Miles' };
      case 'i-pass':
        return { apiKey: '', environment: 'production' };
      case 'bestpass':
        return { clientId: '', clientSecret: '', environment: 'production' };
      case 'prepass':
        return { apiKey: '', customerId: '', environment: 'production' };
      default:
        return {};
    }
  };

  const handleFormChange = (field: string, value: unknown) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleCredentialChange = (field: string, value: unknown) => {
    setFormData({
      ...formData,
      credentials: {
        ...formData.credentials,
        [field]: value,
      },
    });
  };

  const handleTestConnection = async () => {
    if (!selectedProvider || !formData.credentials) return;

    setConnectionTest({ status: 'testing', message: 'Testing connection...' });

    try {
      const result = await testConnection(selectedProvider.id, formData.credentials);
      if (result.success) {
        setConnectionTest({
          status: 'success',
          message: 'Connection successful! Your credentials are valid.',
        });
        handleNext();
      } else {
        setConnectionTest({
          status: 'error',
          message: result.message || 'Connection failed. Please check your credentials.',
        });
      }
    } catch (error) {
      setConnectionTest({
        status: 'error',
        message: 'Failed to test connection. Please try again.',
      });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editAccount) {
        await updateAccount(editAccount.id!, formData);
      } else {
        await createAccount(formData as TollAccount);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderProviderSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Toll Provider
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the toll management provider you want to integrate with.
      </Typography>
      
      <Grid container spacing={2}>
        {providers.map((provider) => (
          <Grid item xs={12} sm={6} key={provider.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedProvider?.id === provider.id ? 2 : 1,
                borderColor: selectedProvider?.id === provider.id ? 'primary.main' : 'divider',
              }}
              onClick={() => handleProviderSelect(provider)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">{provider.name}</Typography>
                  <Chip
                    label={provider.provider_type?.replace('_', ' ').toUpperCase()}
                    size="small"
                    color="primary"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Regions: {provider.supported_regions?.join(', ') || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Auth: {provider.authentication_type?.replace('_', ' ').toUpperCase()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderAccountConfiguration = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure {selectedProvider?.name} Account
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter your account details and API credentials.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Account Number"
            value={formData.account_number || ''}
            onChange={(e) => handleFormChange('account_number', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Account Name"
            value={formData.account_name || ''}
            onChange={(e) => handleFormChange('account_name', e.target.value)}
            helperText="Optional display name for this account"
          />
        </Grid>

        {/* Provider-specific credential fields */}
        {selectedProvider?.name.toLowerCase() === 'pc miler' && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key"
                type="password"
                value={formData.credentials?.apiKey || ''}
                onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={formData.credentials?.region || 'NA'}
                  onChange={(e) => handleCredentialChange('region', e.target.value)}
                >
                  <MenuItem value="NA">North America</MenuItem>
                  <MenuItem value="EU">Europe</MenuItem>
                  <MenuItem value="AF">Africa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Units</InputLabel>
                <Select
                  value={formData.credentials?.units || 'Miles'}
                  onChange={(e) => handleCredentialChange('units', e.target.value)}
                >
                  <MenuItem value="Miles">Miles</MenuItem>
                  <MenuItem value="Kilometers">Kilometers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {selectedProvider?.name.toLowerCase() === 'i-pass' && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key"
                type="password"
                value={formData.credentials?.apiKey || ''}
                onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={formData.credentials?.environment || 'production'}
                  onChange={(e) => handleCredentialChange('environment', e.target.value)}
                >
                  <MenuItem value="production">Production</MenuItem>
                  <MenuItem value="sandbox">Sandbox</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {selectedProvider?.name.toLowerCase() === 'bestpass' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client ID"
                value={formData.credentials?.clientId || ''}
                onChange={(e) => handleCredentialChange('clientId', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Secret"
                type="password"
                value={formData.credentials?.clientSecret || ''}
                onChange={(e) => handleCredentialChange('clientSecret', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={formData.credentials?.environment || 'production'}
                  onChange={(e) => handleCredentialChange('environment', e.target.value)}
                >
                  <MenuItem value="production">Production</MenuItem>
                  <MenuItem value="sandbox">Sandbox</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {selectedProvider?.name.toLowerCase() === 'prepass' && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key"
                type="password"
                value={formData.credentials?.apiKey || ''}
                onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer ID"
                value={formData.credentials?.customerId || ''}
                onChange={(e) => handleCredentialChange('customerId', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={formData.credentials?.environment || 'production'}
                  onChange={(e) => handleCredentialChange('environment', e.target.value)}
                >
                  <MenuItem value="production">Production</MenuItem>
                  <MenuItem value="sandbox">Sandbox</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );

  const renderConnectionTest = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Test Connection
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Verify that your credentials are correct and the connection is working.
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="outlined"
          onClick={handleTestConnection}
          disabled={connectionTest.status === 'testing'}
          startIcon={
            connectionTest.status === 'testing' ? (
              <CircularProgress size={20} />
            ) : connectionTest.status === 'success' ? (
              <CheckIcon />
            ) : connectionTest.status === 'error' ? (
              <ErrorIcon />
            ) : (
              <InfoIcon />
            )
          }
        >
          {connectionTest.status === 'testing' ? 'Testing...' : 'Test Connection'}
        </Button>
      </Box>

      {connectionTest.message && (
        <Alert
          severity={
            connectionTest.status === 'success'
              ? 'success'
              : connectionTest.status === 'error'
              ? 'error'
              : 'info'
          }
          sx={{ mb: 2 }}
        >
          {connectionTest.message}
        </Alert>
      )}

      {connectionTest.status === 'success' && (
        <Typography variant="body2" color="text.secondary">
          Your account is ready to use. Click "Finish" to save the configuration.
        </Typography>
      )}
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderProviderSelection();
      case 1:
        return renderAccountConfiguration();
      case 2:
        return renderConnectionTest();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editAccount ? 'Edit Toll Account' : 'Add Toll Provider Account'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!editAccount && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          getStepContent(activeStep)
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {activeStep > 0 && !editAccount && (
          <Button onClick={handleBack}>Back</Button>
        )}
        {activeStep < steps.length - 1 && !editAccount ? (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={
              (activeStep === 0 && !selectedProvider) ||
              (activeStep === 1 && (!formData.account_number || !formData.credentials))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              submitting ||
              (!editAccount && connectionTest.status !== 'success') ||
              !formData.account_number
            }
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : editAccount ? 'Update' : 'Finish'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TollProviderSetup;
