'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ArrowPathIcon, 
  DocumentTextIcon, 
  ScaleIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {cityData.name} Municipal Weighing System
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitoring and managing commercial vehicle weights across {cityData.name}, {cityData.state}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsLoading(true)}>
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={() => setShowPermitDialog(true)}>
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Issue Permit
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="permits">Permit Management</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Weighings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <ScaleIcon className="h-8 w-8 text-primary-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold">{cityData.totalWeighings.toLocaleString()}</div>
                        <p className="text-xs text-gray-500">Last 30 days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Revenue Collected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold">${cityData.revenueCollected.toLocaleString()}</div>
                        <p className="text-xs text-gray-500">Last 30 days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Compliance Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-amber-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold">{cityData.complianceRate}%</div>
                        <Progress value={cityData.complianceRate} className="h-2 mt-2 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Active Permits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DocumentDuplicateIcon className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold">{cityData.activePermits}</div>
                        <p className="text-xs text-gray-500">{cityData.pendingPermits} pending approval</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Weighings</CardTitle>
                    <CardDescription>Latest vehicle weighings across city stations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Vehicle ID</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentWeighings.map(weighing => (
                          <TableRow key={weighing.id}>
                            <TableCell>
                              {new Date(weighing.timestamp).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>{weighing.vehicleId}</TableCell>
                            <TableCell>{weighing.weight.toLocaleString()} lbs</TableCell>
                            <TableCell>{weighing.location}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  weighing.status === 'compliant'
                                    ? 'success'
                                    : 'destructive'
                                }
                              >
                                {weighing.status === 'compliant' ? 'Compliant' : 'Violation'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="ml-auto">
                      View All
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Scale Status</CardTitle>
                    <CardDescription>Current status of city weighing stations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span>Active Scales</span>
                        </div>
                        <span className="font-medium">{cityData.activeScales}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <span>Inactive Scales</span>
                        </div>
                        <span className="font-medium">{cityData.totalScales - cityData.activeScales}</span>
                      </div>
                      <Separator />
                      <div className="pt-2">
                        <div className="text-sm font-medium mb-2">Scale Utilization</div>
                        <Progress value={83} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>83%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="ml-auto">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              </div>
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
      <Dialog open={showPermitDialog} onOpenChange={setShowPermitDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Issue New Permit</DialogTitle>
            <DialogDescription>
              Create a new overweight or oversize permit for a commercial vehicle.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Permit Number</label>
              <Input
                value={permitDetails.permitNumber}
                onChange={e => setPermitDetails({ ...permitDetails, permitNumber: e.target.value })}
                placeholder="Auto-generated"
                disabled
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Permit Type</label>
              <Select
                value={permitDetails.permitType}
                onValueChange={value => setPermitDetails({ ...permitDetails, permitType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Permit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overweight">Overweight</SelectItem>
                  <SelectItem value="oversize">Oversize</SelectItem>
                  <SelectItem value="both">Overweight & Oversize</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={permitDetails.companyName}
                onChange={e => setPermitDetails({ ...permitDetails, companyName: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Vehicle Information</label>
              <Input
                value={permitDetails.vehicleInfo}
                onChange={e => setPermitDetails({ ...permitDetails, vehicleInfo: e.target.value })}
                placeholder="License plate, VIN, or vehicle ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={permitDetails.startDate}
                onChange={e => setPermitDetails({ ...permitDetails, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={permitDetails.endDate}
                onChange={e => setPermitDetails({ ...permitDetails, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Permit Fee ($)</label>
              <Input
                type="number"
                value={permitDetails.fee}
                onChange={e => setPermitDetails({ ...permitDetails, fee: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssuePermit}>
              Issue Permit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
