'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  AlertCircle, 
  Truck, 
  Scale, 
  FileText, 
  Settings, 
  Users, 
  BarChart2,
  MapPin
} from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Mock data for demonstration
const mockWeighData = [
  { id: 1, date: '2023-06-01', vehicleCount: 120, totalWeight: 1250000, revenue: 6000 },
  { id: 2, date: '2023-06-02', vehicleCount: 135, totalWeight: 1420000, revenue: 6750 },
  { id: 3, date: '2023-06-03', vehicleCount: 95, totalWeight: 980000, revenue: 4750 },
  { id: 4, date: '2023-06-04', vehicleCount: 110, totalWeight: 1150000, revenue: 5500 },
  { id: 5, date: '2023-06-05', vehicleCount: 142, totalWeight: 1480000, revenue: 7100 },
  { id: 6, date: '2023-06-06', vehicleCount: 128, totalWeight: 1320000, revenue: 6400 },
  { id: 7, date: '2023-06-07', vehicleCount: 118, totalWeight: 1220000, revenue: 5900 },
];

const mockVehicles = [
  { id: 1, plateNumber: 'TX-1234', type: 'Dump Truck', lastWeighed: '2023-06-07 14:32', weight: 28500 },
  { id: 2, plateNumber: 'TX-5678', type: 'Garbage Truck', lastWeighed: '2023-06-07 13:15', weight: 32100 },
  { id: 3, plateNumber: 'TX-9012', type: 'Cement Mixer', lastWeighed: '2023-06-07 11:47', weight: 35600 },
  { id: 4, plateNumber: 'TX-3456', type: 'Water Truck', lastWeighed: '2023-06-07 10:22', weight: 29800 },
  { id: 5, plateNumber: 'TX-7890', type: 'Dump Truck', lastWeighed: '2023-06-07 09:05', weight: 27900 },
];

const mockLocations = [
  { id: 1, name: 'North Station', address: '123 Main St', activeScales: 2, status: 'Online' },
  { id: 2, name: 'South Station', address: '456 Oak Ave', activeScales: 1, status: 'Online' },
  { id: 3, name: 'East Station', address: '789 Pine Rd', activeScales: 2, status: 'Online' },
  { id: 4, name: 'West Station', address: '321 Elm Blvd', activeScales: 0, status: 'Offline' },
];

const CityWeighingDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && user && !user.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">City Weighing Systems Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {mockLocations.map(location => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 gap-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vehicles Today</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">128</div>
                  <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Weight (tons)</CardTitle>
                  <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,320</div>
                  <p className="text-xs text-muted-foreground">+8% from yesterday</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$6,400</div>
                  <p className="text-xs text-muted-foreground">+5% from yesterday</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Scales</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5/6</div>
                  <p className="text-xs text-muted-foreground">1 scale offline</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Daily Vehicle Count</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockWeighData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="vehicleCount" fill="#0D2B4B" name="Vehicles" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Daily Revenue</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockWeighData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#FFC107" name="Revenue ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>System Notice</AlertTitle>
              <AlertDescription>
                West Station scale is currently offline. Maintenance has been scheduled.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>List of recently weighed vehicles</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Last Weighed</TableHead>
                      <TableHead>Weight (lbs)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                        <TableCell>{vehicle.type}</TableCell>
                        <TableCell>{vehicle.lastWeighed}</TableCell>
                        <TableCell>{vehicle.weight.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockLocations.map((location) => (
                <Card key={location.id} className={location.status === 'Offline' ? 'border-red-300' : ''}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>{location.name}</CardTitle>
                    <MapPin className={`h-4 w-4 ${location.status === 'Offline' ? 'text-red-500' : 'text-green-500'}`} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    <p className="text-sm mt-2">Active Scales: {location.activeScales}</p>
                    <p className="text-sm">Status: {location.status}</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="report-type">
                        <SelectValue placeholder="Select Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Summary</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                        <SelectItem value="monthly">Monthly Summary</SelectItem>
                        <SelectItem value="vehicle">Vehicle Report</SelectItem>
                        <SelectItem value="revenue">Revenue Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                  </div>
                </div>
                <Button className="mt-4">Generate Report</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Scale Calibration</h3>
                      <p className="text-sm text-muted-foreground">All scales are properly calibrated</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Compliant</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Weight Limits</h3>
                      <p className="text-sm text-muted-foreground">All vehicles within legal weight limits</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Compliant</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Data Retention</h3>
                      <p className="text-sm text-muted-foreground">All records properly maintained</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Compliant</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Reporting</h3>
                      <p className="text-sm text-muted-foreground">Monthly reports submitted on time</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Compliant</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CityWeighingDashboard;
