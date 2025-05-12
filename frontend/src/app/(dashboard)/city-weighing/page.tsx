'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Refresh as ArrowPathIcon,
  Description as DocumentTextIcon,
  Scale as ScaleIcon,
  LocalShipping as TruckIcon,
  AttachMoney as CurrencyDollarIcon,
  Warning as ExclamationTriangleIcon,
  FileCopy as DocumentDuplicateIcon,
  LocationOn as MapPinIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
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
  IconButton,
  Grid,
  LinearProgress,
  CircularProgress
} from '@mui/joy';
import type { Database } from '@/types/supabase';

export default function CityWeighingPage() {
  const [cityData, setCityData] = useState({
    name: 'Austin',
    state: 'TX',
    totalScales: 12,
    activeScales: 10,
    totalWeighings: 1458,
    revenueCollected: 87450,
    complianceRate: 92,
    pendingPermits: 8,
    activePermits: 124,
    recentViolations: 17
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPermitDialog, setShowPermitDialog] = useState(false);
  const [permitDetails, setPermitDetails] = useState({
    permitNumber: '',
    companyName: '',
    vehicleInfo: '',
    permitType: 'overweight',
    startDate: '',
    endDate: '',
    fee: ''
  });

  const [recentWeighings, setRecentWeighings] = useState([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      vehicleId: 'TX-12345',
      weight: 78500,
      location: 'North Austin Station',
      status: 'compliant'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      vehicleId: 'TX-67890',
      weight: 92000,
      location: 'South Austin Station',
      status: 'violation'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      vehicleId: 'TX-54321',
      weight: 80200,
      location: 'East Austin Station',
      status: 'compliant'
    }
  ]);

  const [activePermits, setActivePermits] = useState([
    {
      id: 'P-1001',
      company: 'Texas Hauling Co.',
      vehicleId: 'TX-12345',
      type: 'Overweight',
      issued: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
      status: 'active'
    },
    {
      id: 'P-1002',
      company: 'Austin Logistics',
      vehicleId: 'TX-67890',
      type: 'Oversize',
      issued: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
      status: 'active'
    },
    {
      id: 'P-1003',
      company: 'Central Texas Transport',
      vehicleId: 'TX-54321',
      type: 'Overweight & Oversize',
      issued: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
      status: 'expiring'
    }
  ]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleIssuePermit = () => {
    // This would normally call your backend API
    alert('Permit issued successfully!');
    setShowPermitDialog(false);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography level="h2">
            {cityData.name} Municipal Weighing System
          </Typography>
          <Typography level="body-sm" color="neutral">
            Monitoring and managing commercial vehicle weights across {cityData.name}, {cityData.state}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setIsLoading(true)}
            startDecorator={<ArrowPathIcon />}
          >
            Refresh Data
          </Button>
          <Button
            onClick={() => setShowPermitDialog(true)}
            startDecorator={<DocumentTextIcon />}
          >
            Issue Permit
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
          <Tab value="dashboard">Dashboard</Tab>
          <Tab value="permits">Permit Management</Tab>
          <Tab value="monitoring">Real-time Monitoring</Tab>
          <Tab value="reports">Reports</Tab>
        </TabList>

        <TabPanel value="dashboard">
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid xs={12} md={6} lg={3}>
                  <Card variant="outlined">
                    <Box sx={{ p: 2 }}>
                      <Typography level="body-xs" color="neutral">
                        Total Weighings
                      </Typography>
                    </Box>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ScaleIcon sx={{ fontSize: 32, color: 'primary.500', mr: 1.5 }} />
                        <Box>
                          <Typography level="h3">{cityData.totalWeighings.toLocaleString()}</Typography>
                          <Typography level="body-xs" color="neutral">Last 30 days</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} md={6} lg={3}>
                  <Card variant="outlined">
                    <Box sx={{ p: 2 }}>
                      <Typography level="body-xs" color="neutral">
                        Revenue Collected
                      </Typography>
                    </Box>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CurrencyDollarIcon sx={{ fontSize: 32, color: 'success.500', mr: 1.5 }} />
                        <Box>
                          <Typography level="h3">${cityData.revenueCollected.toLocaleString()}</Typography>
                          <Typography level="body-xs" color="neutral">Last 30 days</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} md={6} lg={3}>
                  <Card variant="outlined">
                    <Box sx={{ p: 2 }}>
                      <Typography level="body-xs" color="neutral">
                        Compliance Rate
                      </Typography>
                    </Box>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ExclamationTriangleIcon sx={{ fontSize: 32, color: 'warning.500', mr: 1.5 }} />
                        <Box>
                          <Typography level="h3">{cityData.complianceRate}%</Typography>
                          <LinearProgress
                            determinate
                            value={cityData.complianceRate}
                            sx={{ height: 8, width: 100, mt: 1, borderRadius: 4 }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} md={6} lg={3}>
                  <Card variant="outlined">
                    <Box sx={{ p: 2 }}>
                      <Typography level="body-xs" color="neutral">
                        Active Permits
                      </Typography>
                    </Box>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DocumentDuplicateIcon sx={{ fontSize: 32, color: 'primary.500', mr: 1.5 }} />
                        <Box>
                          <Typography level="h3">{cityData.activePermits}</Typography>
                          <Typography level="body-xs" color="neutral">{cityData.pendingPermits} pending approval</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid xs={12} lg={6}>
                  <Card variant="outlined">
                    <Box sx={{ p: 2 }}>
                      <Typography level="title-lg">Recent Weighings</Typography>
                      <Typography level="body-sm" color="neutral">Latest vehicle weighings across city stations</Typography>
                    </Box>
                    <CardContent>
                      <Table
                        borderAxis="bothBetween"
                        stripe="odd"
                        hoverRow
                      >
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Vehicle ID</th>
                            <th>Weight</th>
                            <th>Location</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentWeighings.map(weighing => (
                            <tr key={weighing.id}>
                              <td>
                                {new Date(weighing.timestamp).toLocaleTimeString()}
                              </td>
                              <td>{weighing.vehicleId}</td>
                              <td>{weighing.weight.toLocaleString()} lbs</td>
                              <td>{weighing.location}</td>
                              <td>
                                <Chip
                                  color={weighing.status === 'compliant' ? 'success' : 'danger'}
                                  variant="soft"
                                  size="sm"
                                >
                                  {weighing.status === 'compliant' ? 'Compliant' : 'Violation'}
                                </Chip>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </CardContent>
                    <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="sm">
                        View All
                      </Button>
                    </CardOverflow>
                  </Card>
                </Grid>

                <Grid xs={12} lg={6}>
                  <Card variant="outlined">
                    <Box sx={{ p: 2 }}>
                      <Typography level="title-lg">Scale Status</Typography>
                      <Typography level="body-sm" color="neutral">Current status of city weighing stations</Typography>
                    </Box>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.500', mr: 1 }} />
                            <Typography>Active Scales</Typography>
                          </Box>
                          <Typography fontWeight="md">{cityData.activeScales}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'danger.500', mr: 1 }} />
                            <Typography>Inactive Scales</Typography>
                          </Box>
                          <Typography fontWeight="md">{cityData.totalScales - cityData.activeScales}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ pt: 1 }}>
                          <Typography level="body-sm" fontWeight="md" sx={{ mb: 1 }}>Scale Utilization</Typography>
                          <LinearProgress
                            determinate
                            value={83}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography level="body-xs" color="neutral">0%</Typography>
                            <Typography level="body-xs" color="neutral">83%</Typography>
                            <Typography level="body-xs" color="neutral">100%</Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                    <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="sm">
                        View Details
                      </Button>
                    </CardOverflow>
                  </Card>
                </Grid>
              </Grid>
            </div>
          )}
        </TabsContent>

        <TabsContent value="permits">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Permit Management</CardTitle>
                  <CardDescription>Manage and track commercial vehicle permits</CardDescription>
                </div>
                <Button onClick={() => setShowPermitDialog(true)}>
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Issue New Permit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active Permits</TabsTrigger>
                  <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                  <TabsTrigger value="expired">Expired</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permit ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Vehicle ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Issued</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePermits.map(permit => (
                        <TableRow key={permit.id}>
                          <TableCell className="font-medium">{permit.id}</TableCell>
                          <TableCell>{permit.company}</TableCell>
                          <TableCell>{permit.vehicleId}</TableCell>
                          <TableCell>{permit.type}</TableCell>
                          <TableCell>{new Date(permit.issued).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(permit.expires).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                permit.status === 'active'
                                  ? 'success'
                                  : permit.status === 'expiring'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {permit.status === 'active' ? 'Active' :
                               permit.status === 'expiring' ? 'Expiring Soon' : permit.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="pending">
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No pending permits</p>
                  </div>
                </TabsContent>

                <TabsContent value="expired">
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No expired permits in the last 30 days</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Scale Monitoring</CardTitle>
              <CardDescription>Live data from city weighing stations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">North Austin Station</CardTitle>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Current Vehicle</span>
                        </div>
                        <span className="font-medium">TX-12345</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <ScaleIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Current Weight</span>
                        </div>
                        <span className="font-medium">78,500 lbs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Last Activity</span>
                        </div>
                        <span className="font-medium">2 mins ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">South Austin Station</CardTitle>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Current Vehicle</span>
                        </div>
                        <span className="font-medium">None</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <ScaleIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Current Weight</span>
                        </div>
                        <span className="font-medium">0 lbs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Last Activity</span>
                        </div>
                        <span className="font-medium">15 mins ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">East Austin Station</CardTitle>
                      <Badge variant="destructive">Inactive</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Current Vehicle</span>
                        </div>
                        <span className="font-medium">None</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <ScaleIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Current Weight</span>
                        </div>
                        <span className="font-medium">0 lbs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Last Activity</span>
                        </div>
                        <span className="font-medium">2 hours ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view reports for municipal weighing operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">Monthly Compliance Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Summary of compliance rates, violations, and enforcement actions
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Generate Report
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">Revenue Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Detailed breakdown of permit fees, fines, and other revenue sources
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Generate Report
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">Scale Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Analysis of scale usage, peak times, and operational efficiency
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Generate Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permit Dialog */}
      <Modal
        open={showPermitDialog}
        onClose={() => setShowPermitDialog(false)}
      >
        <ModalDialog
          variant="outlined"
          sx={{ maxWidth: 600 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography level="title-lg">Issue New Permit</Typography>
            <ModalClose />
          </Box>
          <Typography level="body-sm" color="neutral" sx={{ mb: 3 }}>
            Create a new overweight or oversize permit for a commercial vehicle.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Permit Number</FormLabel>
                <Input
                  value={permitDetails.permitNumber}
                  onChange={e => setPermitDetails({ ...permitDetails, permitNumber: e.target.value })}
                  placeholder="Auto-generated"
                  disabled
                />
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Permit Type</FormLabel>
                <Select
                  value={permitDetails.permitType}
                  onChange={(_, value) => setPermitDetails({
                    ...permitDetails,
                    permitType: value as string
                  })}
                  placeholder="Select Permit Type"
                >
                  <Option value="overweight">Overweight</Option>
                  <Option value="oversize">Oversize</Option>
                  <Option value="both">Overweight & Oversize</Option>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl>
                <FormLabel>Company Name</FormLabel>
                <Input
                  value={permitDetails.companyName}
                  onChange={e => setPermitDetails({ ...permitDetails, companyName: e.target.value })}
                  placeholder="Enter company name"
                />
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl>
                <FormLabel>Vehicle Information</FormLabel>
                <Input
                  value={permitDetails.vehicleInfo}
                  onChange={e => setPermitDetails({ ...permitDetails, vehicleInfo: e.target.value })}
                  placeholder="License plate, VIN, or vehicle ID"
                />
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={permitDetails.startDate}
                  onChange={e => setPermitDetails({ ...permitDetails, startDate: e.target.value })}
                />
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={permitDetails.endDate}
                  onChange={e => setPermitDetails({ ...permitDetails, endDate: e.target.value })}
                />
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Permit Fee ($)</FormLabel>
                <Input
                  type="number"
                  value={permitDetails.fee}
                  onChange={e => setPermitDetails({ ...permitDetails, fee: e.target.value })}
                  placeholder="0.00"
                />
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setShowPermitDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleIssuePermit}>
              Issue Permit
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </div>
  );
}
