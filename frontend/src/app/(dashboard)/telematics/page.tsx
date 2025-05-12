'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Add as PlusIcon,
  Refresh as ArrowPathIcon,
  LocationOn as MapPinIcon,
  LocalShipping as TruckIcon,
  SignalCellular4Bar as SignalIcon
} from '@mui/icons-material';
import { CssVarsProvider } from '@mui/joy/styles';
import {
  Button,
  Card,
  CardContent,
  CardOverflow,
  Typography,
  Chip,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Input,
  Select,
  Option,
  Table,
  Sheet,
  Divider,
  Modal,
  ModalDialog,
  ModalClose,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Alert,
  IconButton
} from '@mui/joy';
import type { Database } from '@/types/supabase';

type Connection = {
  id: string;
  name: string;
  provider: string;
  status: string;
  created_at: string;
  last_sync: string | null;
  company_id: string;
};

type VehicleData = {
  id: string;
  name: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  lastUpdate: string;
  speed?: number;
  fuelLevel?: number;
  engineStatus?: string;
};

export default function TelematicsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('vehicles');
  const [showNewConnectionDialog, setShowNewConnectionDialog] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '',
    provider: 'geotab',
    config: {
      apiKey: '',
      username: '',
      password: '',
      database: '',
      server: '',
    },
  });
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchConnections();
    fetchVehicleData();
  }, []);

  const fetchConnections = async () => {
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

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id, is_admin')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        throw userError;
      }

      let query = supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_type', 'telematics');

      // If not admin, filter by company
      if (!userData.is_admin) {
        query = query.eq('company_id', userData.company_id);
      }

      const { data, error: connectionsError } = await query.order('created_at', { ascending: false });

      if (connectionsError) {
        throw connectionsError;
      }

      setConnections(data || []);
    } catch (err: any) {
      console.error('Error fetching telematics connections:', err);
      setError(err.message || 'Failed to load telematics connections');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicleData = async () => {
    try {
      // This would normally fetch from your backend API
      // For now, we'll use mock data
      const mockData: VehicleData[] = [
        {
          id: '1',
          name: 'Truck 101',
          status: 'active',
          location: {
            latitude: 32.7767,
            longitude: -96.7970,
            address: 'Dallas, TX'
          },
          lastUpdate: new Date().toISOString(),
          speed: 65,
          fuelLevel: 75,
          engineStatus: 'running'
        },
        {
          id: '2',
          name: 'Truck 102',
          status: 'inactive',
          location: {
            latitude: 29.7604,
            longitude: -95.3698,
            address: 'Houston, TX'
          },
          lastUpdate: new Date(Date.now() - 3600000).toISOString(),
          speed: 0,
          fuelLevel: 45,
          engineStatus: 'off'
        },
        {
          id: '3',
          name: 'Truck 103',
          status: 'active',
          location: {
            latitude: 30.2672,
            longitude: -97.7431,
            address: 'Austin, TX'
          },
          lastUpdate: new Date().toISOString(),
          speed: 55,
          fuelLevel: 60,
          engineStatus: 'running'
        }
      ];

      setVehicleData(mockData);
    } catch (err: any) {
      console.error('Error fetching vehicle data:', err);
    }
  };

  const handleCreateConnection = async () => {
    try {
      setIsLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', sessionData.session.user.id)
        .single();

      const { data, error } = await supabase
        .from('integration_connections')
        .insert({
          name: newConnection.name,
          provider: newConnection.provider,
          integration_type: 'telematics',
          company_id: userData.company_id,
          config: newConnection.config,
          is_active: true,
        })
        .select();

      if (error) {
        throw error;
      }

      setConnections([...(data || []), ...connections]);
      setShowNewConnectionDialog(false);
      setNewConnection({
        name: '',
        provider: 'geotab',
        config: {
          apiKey: '',
          username: '',
          password: '',
          database: '',
          server: '',
        },
      });
    } catch (err: any) {
      console.error('Error creating telematics connection:', err);
      setError(err.message || 'Failed to create telematics connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      // This would call your backend API to refresh data
      // For now, we'll just refresh the mock data
      fetchVehicleData();
    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to refresh data');
    }
  };

  return (
    <CssVarsProvider>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography level="h2">Telematics Integration</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleRefreshData}
              startDecorator={<ArrowPathIcon />}
            >
              Refresh Data
            </Button>
            <Button
              onClick={() => setShowNewConnectionDialog(true)}
              startDecorator={<PlusIcon />}
            >
              New Connection
            </Button>
          </Box>
        </Box>

      {error && (
        <Alert
          color="danger"
          variant="soft"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value as string)}
        sx={{ width: '100%' }}
      >
        <TabList variant="outlined" sx={{ mb: 2 }}>
          <Tab value="vehicles">Vehicles</Tab>
          <Tab value="connections">Connections</Tab>
          <Tab value="events">Events</Tab>
        </TabList>

        <TabPanel value="vehicles">
          <Card variant="outlined">
            <Box sx={{ p: 2 }}>
              <Typography level="title-lg">Vehicle Telematics Data</Typography>
              <Typography level="body-sm" color="neutral">Real-time data from your connected vehicles</Typography>
            </Box>
            <CardContent>
              {vehicleData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TruckIcon sx={{ fontSize: 48, color: 'neutral.400', mb: 2 }} />
                  <Typography color="neutral">No vehicle data available</Typography>
                </Box>
              ) : (
                <Table
                  borderAxis="bothBetween"
                  stripe="odd"
                  hoverRow
                  sx={{
                    '& thead th:nth-child(1)': { width: '20%' },
                    '& thead th:nth-child(3)': { width: '25%' },
                  }}
                >
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Speed</th>
                      <th>Fuel</th>
                      <th>Last Update</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleData.map(vehicle => (
                      <tr key={vehicle.id}>
                        <td>
                          <Typography fontWeight="md">{vehicle.name}</Typography>
                        </td>
                        <td>
                          <Chip
                            color={vehicle.status === 'active' ? 'success' : 'danger'}
                            variant="soft"
                            size="sm"
                          >
                            {vehicle.engineStatus === 'running' ? 'Running' : 'Stopped'}
                          </Chip>
                        </td>
                        <td>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MapPinIcon fontSize="small" />
                            <Typography level="body-sm">{vehicle.location.address}</Typography>
                          </Box>
                        </td>
                        <td>{vehicle.speed} mph</td>
                        <td>{vehicle.fuelLevel}%</td>
                        <td>
                          {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                        </td>
                        <td>
                          <Button variant="plain" size="sm">
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value="connections">
          {isLoading ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
              {[1, 2, 3].map(i => (
                <Card key={i} variant="outlined">
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ height: 24, width: '75%', mb: 1, bgcolor: 'neutral.200', borderRadius: 1 }} />
                    <Box sx={{ height: 16, width: '50%', bgcolor: 'neutral.200', borderRadius: 1 }} />
                  </Box>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ height: 16, width: '100%', bgcolor: 'neutral.200', borderRadius: 1 }} />
                      <Box sx={{ height: 16, width: '100%', bgcolor: 'neutral.200', borderRadius: 1 }} />
                      <Box sx={{ height: 16, width: '75%', bgcolor: 'neutral.200', borderRadius: 1 }} />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : connections.length === 0 ? (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <SignalIcon sx={{ fontSize: 48, color: 'neutral.400' }} />
                <Typography level="title-lg">No Telematics Connections</Typography>
                <Typography level="body-sm" color="neutral" sx={{ maxWidth: 400, mx: 'auto' }}>
                  Get started by creating a new connection to your telematics provider.
                </Typography>
                <Button
                  onClick={() => setShowNewConnectionDialog(true)}
                  startDecorator={<PlusIcon />}
                  sx={{ mt: 2 }}
                >
                  New Connection
                </Button>
              </Box>
            </Card>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
              {connections.map(connection => (
                <Card key={connection.id} variant="outlined">
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography level="title-md">{connection.name}</Typography>
                      <Typography level="body-sm" color="neutral">
                        {connection.provider === 'geotab' ? 'Geotab' :
                         connection.provider === 'samsara' ? 'Samsara' :
                         connection.provider === 'fleetcomplete' ? 'Fleet Complete' :
                         connection.provider}
                      </Typography>
                    </Box>
                    <Chip
                      color={connection.status === 'active' ? 'success' : 'danger'}
                      variant="soft"
                      size="sm"
                    >
                      {connection.status === 'active' ? 'Active' : 'Inactive'}
                    </Chip>
                  </Box>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography level="body-sm" color="neutral">Last Sync:</Typography>
                        <Typography level="body-sm">
                          {connection.last_sync ? new Date(connection.last_sync).toLocaleString() : 'Never'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography level="body-sm" color="neutral">Created:</Typography>
                        <Typography level="body-sm">
                          {new Date(connection.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardOverflow sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button variant="outlined" size="sm">
                      Configure
                    </Button>
                    <Button size="sm" startDecorator={<ArrowPathIcon />}>
                      Sync Now
                    </Button>
                  </CardOverflow>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        <TabPanel value="events">
          <Card variant="outlined">
            <Box sx={{ p: 2 }}>
              <Typography level="title-lg">Telematics Events</Typography>
              <Typography level="body-sm" color="neutral">Recent events from your connected vehicles</Typography>
            </Box>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="neutral">No recent events</Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>

      {/* New Connection Dialog */}
      <Modal
        open={showNewConnectionDialog}
        onClose={() => setShowNewConnectionDialog(false)}
      >
        <ModalDialog
          variant="outlined"
          sx={{ maxWidth: 500 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography level="title-lg">Create Telematics Connection</Typography>
            <ModalClose />
          </Box>
          <Typography level="body-sm" color="neutral" sx={{ mb: 3 }}>
            Connect your telematics provider to enable real-time vehicle data.
          </Typography>

          <Stack spacing={3}>
            <FormControl>
              <FormLabel>Connection Name</FormLabel>
              <Input
                value={newConnection.name}
                onChange={e => setNewConnection({ ...newConnection, name: e.target.value })}
                placeholder="e.g., Fleet Geotab"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Telematics Provider</FormLabel>
              <Select
                value={newConnection.provider}
                onChange={(_, value) => setNewConnection({
                  ...newConnection,
                  provider: value as string
                })}
                placeholder="Select Telematics Provider"
              >
                <Option value="geotab">Geotab</Option>
                <Option value="samsara">Samsara</Option>
                <Option value="fleetcomplete">Fleet Complete</Option>
                <Option value="omnitracs">Omnitracs</Option>
              </Select>
            </FormControl>

            <Divider />

            {newConnection.provider === 'geotab' && (
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>API Key</FormLabel>
                  <Input
                    value={newConnection.config.apiKey}
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, apiKey: e.target.value }
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Input
                    value={newConnection.config.username}
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, username: e.target.value }
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={newConnection.config.password}
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, password: e.target.value }
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Database</FormLabel>
                  <Input
                    value={newConnection.config.database}
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, database: e.target.value }
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Server</FormLabel>
                  <Input
                    value={newConnection.config.server}
                    onChange={e => setNewConnection({
                      ...newConnection,
                      config: { ...newConnection.config, server: e.target.value }
                    })}
                    placeholder="my.geotabserver.com"
                  />
                </FormControl>
              </Stack>
            )}

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => setShowNewConnectionDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateConnection}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Connection'}
              </Button>
            </Box>
          </Stack>
        </ModalDialog>
      </Modal>
    </CssVarsProvider>
  );
}
