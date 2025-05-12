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
  ClockIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {cityData.name} Municipal Weighing System
          </h1>
          <p className="text-gray-500">
            Monitoring and managing commercial vehicle weights across {cityData.name}, {cityData.state}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsLoading(true)}
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button
            onClick={() => setShowPermitDialog(true)}
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Issue Permit
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="permits">Permit Management</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Weighings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <ScaleIcon className="h-8 w-8 text-primary mr-3" />
                      <div>
                        <div className="text-2xl font-bold">{cityData.totalWeighings.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Last 30 days</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Revenue Collected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold">${cityData.revenueCollected.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Last 30 days</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Compliance Rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-amber-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold">{cityData.complianceRate}%</div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${cityData.complianceRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Active Permits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DocumentDuplicateIcon className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-2xl font-bold">{cityData.activePermits}</div>
                        <div className="text-xs text-gray-500">{cityData.pendingPermits} pending approval</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Weighings</CardTitle>
                    <CardDescription>Latest vehicle weighings across city stations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Time</th>
                          <th className="text-left py-2">Vehicle ID</th>
                          <th className="text-left py-2">Weight</th>
                          <th className="text-left py-2">Location</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentWeighings.map(weighing => (
                          <tr key={weighing.id} className="border-b">
                            <td className="py-2">
                              {new Date(weighing.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2">{weighing.vehicleId}</td>
                            <td className="py-2">{weighing.weight.toLocaleString()} lbs</td>
                            <td className="py-2">{weighing.location}</td>
                            <td className="py-2">
                              <Badge variant={weighing.status === 'compliant' ? 'success' : 'destructive'}>
                                {weighing.status === 'compliant' ? 'Compliant' : 'Violation'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Permit Dialog */}
      <Dialog open={showPermitDialog} onOpenChange={setShowPermitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue New Permit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="permitNumber">Permit Number</Label>
                <Input
                  id="permitNumber"
                  value={permitDetails.permitNumber}
                  onChange={e => setPermitDetails({ ...permitDetails, permitNumber: e.target.value })}
                  placeholder="Auto-generated"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permitType">Permit Type</Label>
                <Select
                  value={permitDetails.permitType}
                  onValueChange={(value) => setPermitDetails({
                    ...permitDetails,
                    permitType: value
                  })}
                >
                  <SelectTrigger id="permitType">
                    <SelectValue placeholder="Select Permit Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overweight">Overweight</SelectItem>
                    <SelectItem value="oversize">Oversize</SelectItem>
                    <SelectItem value="both">Overweight & Oversize</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
