/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { createClient } from '@/utils/supabase/client';
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  KeyIcon,
  MapPinIcon,
  PlusIcon,
  TruckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

type LoadBoard = {
  id: string;
  name: string;
  provider: 'dat' | 'proprietary';
  status: 'active' | 'inactive';
  api_key?: string;
  created_at: string;
  last_sync?: string;
  loads_count: number;
};

type Load = {
  id: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  pickup_date: string;
  delivery_date: string;
  rate: number;
  miles: number;
  weight: number;
  equipment_type: string;
  company_name: string;
  contact_phone?: string;
  source: 'dat' | 'proprietary';
  status: 'available' | 'booked' | 'expired';
  // DAT Enhanced Features
  company_rating?: number; // 1-5 stars
  credit_score?: 'A' | 'B' | 'C' | 'D' | 'F';
  has_credit_check?: boolean;
  is_preferred?: boolean;
  is_blocked?: boolean;
  broker_credit_data?: {
    days_to_pay: number;
    payment_history: 'excellent' | 'good' | 'fair' | 'poor';
  };
  trihaul_eligible?: boolean;
  dat_assurance?: boolean;
  book_now_available?: boolean;
  canadian_load?: boolean;
  contract_lane?: boolean;
  group_posting?: boolean;
  mci_data?: {
    rate_trend: 'up' | 'down' | 'stable';
    market_demand: 'high' | 'medium' | 'low';
  };
};

export default function LoadBoardsPage() {
  const [loadBoards, setLoadBoards] = useState<LoadBoard[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('loads');
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false);
  const [showDATSetupDialog, setShowDATSetupDialog] = useState(false);
  const [newBoard, setNewBoard] = useState({
    name: '',
    provider: 'dat' as 'dat' | 'proprietary',
    api_key: '',
  });
  const [datConfig, setDatConfig] = useState({
    api_key: '',
    username: '',
    password: '',
  });
  const [filters, setFilters] = useState({
    origin_state: 'all',
    destination_state: 'all',
    equipment_type: 'all',
    min_rate: '',
    max_miles: '',
    company_rating: 'all',
    has_credit_check: false,
    preferred_only: false,
    exclude_blocked: true,
  });
  const [searchAlarms, setSearchAlarms] = useState<
    Array<{ id: string; name: string; criteria: unknown }>
  >([]);
  const [postAlarms, setPostAlarms] = useState<
    Array<{ id: string; name: string; criteria: unknown }>
  >([]);
  const [showAlarmsDialog, setShowAlarmsDialog] = useState(false);
  const [showMCIDialog, setShowMCIDialog] = useState(false);
  const [showCarrierWatchDialog, setShowCarrierWatchDialog] = useState(false);
  const [datPlan, setDatPlan] = useState<'basic' | 'combo' | 'premium'>('combo');
  const supabase = createClient();

  useEffect(() => {
    fetchLoadBoards();
    fetchLoads();
  }, []);

  const fetchLoadBoards = async () => {
    try {
      setIsLoading(true);
      setError('');

      // For demo purposes, we'll use dummy data
      // In production, this would fetch from your database
      const dummyBoards: LoadBoard[] = [
        {
          id: 'dat-1',
          name: 'DAT Load Board',
          provider: 'dat',
          status: 'active',
          api_key: 'dat_api_key_***',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          loads_count: 1247,
        },
        {
          id: 'prop-1',
          name: 'FreightWeightPros Load Board',
          provider: 'proprietary',
          status: 'active',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          last_sync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          loads_count: 89,
        },
      ];
      setLoadBoards(dummyBoards);
    } catch (err: Error) {
      console.error('Error fetching load boards:', err);
      setError(err.message || 'Failed to load load boards');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoads = async () => {
    try {
      // For demo purposes, we'll use dummy data
      // In production, this would fetch from DAT API and your proprietary system
      const dummyLoads: Load[] = [
        {
          id: 'load-1',
          origin_city: 'Los Angeles',
          origin_state: 'CA',
          destination_city: 'Phoenix',
          destination_state: 'AZ',
          pickup_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          delivery_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          rate: 2850,
          miles: 372,
          weight: 45000,
          equipment_type: 'Dry Van',
          company_name: 'ABC Logistics',
          contact_phone: '(555) 123-4567',
          source: 'dat',
          status: 'available',
          company_rating: 4.5,
          credit_score: 'A',
          has_credit_check: true,
          is_preferred: true,
          is_blocked: false,
          broker_credit_data: {
            days_to_pay: 15,
            payment_history: 'excellent',
          },
          trihaul_eligible: true,
          dat_assurance: true,
          book_now_available: true,
          canadian_load: false,
          contract_lane: true,
          group_posting: false,
          mci_data: {
            rate_trend: 'up',
            market_demand: 'high',
          },
        },
        {
          id: 'load-2',
          origin_city: 'Dallas',
          origin_state: 'TX',
          destination_city: 'Atlanta',
          destination_state: 'GA',
          pickup_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          delivery_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          rate: 3200,
          miles: 781,
          weight: 38000,
          equipment_type: 'Reefer',
          company_name: 'XYZ Freight',
          contact_phone: '(555) 987-6543',
          source: 'dat',
          status: 'available',
          company_rating: 3.8,
          credit_score: 'B',
          has_credit_check: true,
          is_preferred: false,
          is_blocked: false,
          broker_credit_data: {
            days_to_pay: 25,
            payment_history: 'good',
          },
          trihaul_eligible: false,
          dat_assurance: false,
          book_now_available: true,
          canadian_load: false,
          contract_lane: false,
          group_posting: true,
          mci_data: {
            rate_trend: 'stable',
            market_demand: 'medium',
          },
        },
        {
          id: 'load-3',
          origin_city: 'Chicago',
          origin_state: 'IL',
          destination_city: 'Denver',
          destination_state: 'CO',
          pickup_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          rate: 2950,
          miles: 920,
          weight: 42000,
          equipment_type: 'Flatbed',
          company_name: 'FreightWeightPros',
          source: 'proprietary',
          status: 'available',
        },
        {
          id: 'load-4',
          origin_city: 'Miami',
          origin_state: 'FL',
          destination_city: 'New York',
          destination_state: 'NY',
          pickup_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          rate: 4100,
          miles: 1280,
          weight: 35000,
          equipment_type: 'Dry Van',
          company_name: 'Coastal Shipping',
          contact_phone: '(555) 456-7890',
          source: 'proprietary',
          status: 'available',
        },
      ];
      setLoads(dummyLoads);
    } catch (err: Error) {
      console.error('Error fetching loads:', err);
      setError(err.message || 'Failed to load available loads');
    }
  };

  const handleSetupDAT = async () => {
    try {
      setIsLoading(true);

      // In production, this would validate the DAT API credentials
      // and store them securely in your database

      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newDATBoard: LoadBoard = {
        id: `dat-${Date.now()}`,
        name: 'DAT Load Board',
        provider: 'dat',
        status: 'active',
        api_key: datConfig.api_key,
        created_at: new Date().toISOString(),
        loads_count: 0,
      };

      setLoadBoards([...loadBoards, newDATBoard]);
      setShowDATSetupDialog(false);
      setDatConfig({ api_key: '', username: '', password: '' });

      // Refresh loads after adding DAT integration
      fetchLoads();
    } catch (err: Error) {
      console.error('Error setting up DAT integration:', err);
      setError(err.message || 'Failed to setup DAT integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProprietaryBoard = async () => {
    try {
      setIsLoading(true);

      const newProprietaryBoard: LoadBoard = {
        id: `prop-${Date.now()}`,
        name: newBoard.name || 'FreightWeightPros Load Board',
        provider: 'proprietary',
        status: 'active',
        created_at: new Date().toISOString(),
        loads_count: 0,
      };

      setLoadBoards([...loadBoards, newProprietaryBoard]);
      setShowNewBoardDialog(false);
      setNewBoard({ name: '', provider: 'proprietary', api_key: '' });
    } catch (err: Error) {
      console.error('Error creating proprietary load board:', err);
      setError(err.message || 'Failed to create load board');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookLoad = async (loadId: string) => {
    try {
      // In production, this would book the load through the appropriate API
      setLoads(
        loads.map(load => (load.id === loadId ? { ...load, status: 'booked' as const } : load))
      );

      // Show success message or redirect to booking confirmation
      alert('Load booked successfully!');
    } catch (err: Error) {
      console.error('Error booking load:', err);
      setError(err.message || 'Failed to book load');
    }
  };

  const filteredLoads = loads.filter(load => {
    if (
      filters.origin_state &&
      filters.origin_state !== 'all' &&
      load.origin_state !== filters.origin_state
    )
      return false;
    if (
      filters.destination_state &&
      filters.destination_state !== 'all' &&
      load.destination_state !== filters.destination_state
    )
      return false;
    if (
      filters.equipment_type &&
      filters.equipment_type !== 'all' &&
      load.equipment_type !== filters.equipment_type
    )
      return false;
    if (filters.min_rate && load.rate < parseInt(filters.min_rate)) return false;
    if (filters.max_miles && load.miles > parseInt(filters.max_miles)) return false;

    // DAT Enhanced Filters
    if (filters.company_rating !== 'all' && load.company_rating) {
      const minRating = parseInt(filters.company_rating);
      if (load.company_rating < minRating) return false;
    }
    if (filters.has_credit_check && !load.has_credit_check) return false;
    if (filters.preferred_only && !load.is_preferred) return false;
    if (filters.exclude_blocked && load.is_blocked) return false;

    return true;
  });

  const equipmentTypes = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Lowboy', 'Tanker'];
  const states = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Load Boards</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Find and book loads from DAT and proprietary load boards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAlarmsDialog(true)}>
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Search Alarms
          </Button>
          <Button variant="outline" onClick={() => setShowMCIDialog(true)}>
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Market Index
          </Button>
          <Button variant="outline" onClick={() => setShowCarrierWatchDialog(true)}>
            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
            CarrierWatch
          </Button>
          <Button variant="outline" onClick={() => setShowDATSetupDialog(true)}>
            <KeyIcon className="h-5 w-5 mr-2" />
            Setup DAT
          </Button>
          <Button onClick={() => setShowNewBoardDialog(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Load Board
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Load Board Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Boards
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {loadBoards.filter(board => board.status === 'active').length}
                </h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <GlobeAltIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available Loads
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {loads.filter(load => load.status === 'available').length}
                </h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <TruckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Miles</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loads.reduce((sum, load) => sum + load.miles, 0).toLocaleString()}
                </h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <MapPinIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ${loads.reduce((sum, load) => sum + load.rate, 0).toLocaleString()}
                </h3>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="loads">Available Loads</TabsTrigger>
          <TabsTrigger value="boards">Load Boards</TabsTrigger>
        </TabsList>

        <TabsContent value="loads">
          {/* Load Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Loads</CardTitle>
              <CardDescription>Filter available loads by your criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Origin State</label>
                  <Select
                    value={filters.origin_state}
                    onValueChange={value => setFilters({ ...filters, origin_state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any State</SelectItem>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Destination State</label>
                  <Select
                    value={filters.destination_state}
                    onValueChange={value => setFilters({ ...filters, destination_state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any State</SelectItem>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Equipment Type</label>
                  <Select
                    value={filters.equipment_type}
                    onValueChange={value => setFilters({ ...filters, equipment_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Equipment</SelectItem>
                      {equipmentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Rate ($)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.min_rate}
                    onChange={e => setFilters({ ...filters, min_rate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Miles</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={filters.max_miles}
                    onChange={e => setFilters({ ...filters, max_miles: e.target.value })}
                  />
                </div>
              </div>

              {/* DAT Enhanced Filters */}
              <Separator className="my-4" />
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-3 text-blue-600 dark:text-blue-400">
                  DAT Enhanced Filters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company Rating</label>
                    <Select
                      value={filters.company_rating}
                      onValueChange={value => setFilters({ ...filters, company_rating: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="2">2+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="credit-check"
                      checked={filters.has_credit_check}
                      onChange={e => setFilters({ ...filters, has_credit_check: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="credit-check" className="text-sm font-medium">
                      Credit Check Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="preferred-only"
                      checked={filters.preferred_only}
                      onChange={e => setFilters({ ...filters, preferred_only: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="preferred-only" className="text-sm font-medium">
                      Preferred Companies Only
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="exclude-blocked"
                      checked={filters.exclude_blocked}
                      onChange={e => setFilters({ ...filters, exclude_blocked: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="exclude-blocked" className="text-sm font-medium">
                      Exclude Blocked Companies
                    </label>
                  </div>
                </div>
              </div>

              {/* DAT Features */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Available DAT Features
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Book Now</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>DAT Assurance</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>TriHaul</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Credit Data</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>CarrierWatch</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Contract Lanes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Canadian Loads</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Market Index</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Loads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Available Loads ({filteredLoads.length})</CardTitle>
              <CardDescription>Loads from DAT and proprietary load boards</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLoads.length === 0 ? (
                <div className="text-center py-8">
                  <TruckIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    No Loads Found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your filters or check back later for new loads.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Miles</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>$/Mile</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>DAT Features</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoads.map(load => (
                      <TableRow key={load.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {load.origin_city}, {load.origin_state} → {load.destination_city},{' '}
                              {load.destination_state}
                            </div>
                            {load.mci_data && (
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge
                                  variant={
                                    load.mci_data.rate_trend === 'up'
                                      ? 'success'
                                      : load.mci_data.rate_trend === 'down'
                                        ? 'destructive'
                                        : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {load.mci_data.rate_trend === 'up'
                                    ? '↗'
                                    : load.mci_data.rate_trend === 'down'
                                      ? '↘'
                                      : '→'}{' '}
                                  MCI
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {load.mci_data.market_demand} demand
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(load.pickup_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            <div>{load.equipment_type}</div>
                            {load.canadian_load && (
                              <Badge variant="outline" className="text-xs mt-1">
                                🇨🇦 Canadian
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{load.weight.toLocaleString()} lbs</TableCell>
                        <TableCell>{load.miles.toLocaleString()}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${load.rate.toLocaleString()}</div>
                            {load.contract_lane && (
                              <Badge variant="outline" className="text-xs">
                                Contract
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>${(load.rate / load.miles).toFixed(2)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{load.company_name}</div>
                            <div className="flex items-center space-x-1 mt-1">
                              {load.company_rating && (
                                <div className="flex items-center">
                                  <span className="text-yellow-500">★</span>
                                  <span className="text-xs ml-1">{load.company_rating}</span>
                                </div>
                              )}
                              {load.credit_score && (
                                <Badge
                                  variant={
                                    load.credit_score === 'A'
                                      ? 'success'
                                      : load.credit_score === 'B'
                                        ? 'secondary'
                                        : 'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {load.credit_score}
                                </Badge>
                              )}
                              {load.is_preferred && (
                                <Badge variant="success" className="text-xs">
                                  Preferred
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {load.book_now_available && (
                              <Badge variant="success" className="text-xs">
                                Book Now
                              </Badge>
                            )}
                            {load.dat_assurance && (
                              <Badge variant="primary" className="text-xs">
                                Assurance
                              </Badge>
                            )}
                            {load.trihaul_eligible && (
                              <Badge variant="secondary" className="text-xs">
                                TriHaul
                              </Badge>
                            )}
                            {load.has_credit_check && (
                              <Badge variant="outline" className="text-xs">
                                Credit ✓
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={load.source === 'dat' ? 'primary' : 'secondary'}>
                            {load.source === 'dat' ? 'DAT' : 'Proprietary'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleBookLoad(load.id)}
                            disabled={load.status !== 'available'}
                          >
                            {load.status === 'available' ? 'Book Load' : 'Booked'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadBoards.map(board => (
              <Card key={board.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{board.name}</CardTitle>
                      <CardDescription>
                        {board.provider === 'dat' ? 'DAT Load Board' : 'Proprietary Load Board'}
                      </CardDescription>
                    </div>
                    <Badge variant={board.status === 'active' ? 'success' : 'destructive'}>
                      {board.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Loads Available:
                      </span>
                      <span className="text-sm font-medium">{board.loads_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Last Sync:</span>
                      <span className="text-sm">
                        {board.last_sync ? new Date(board.last_sync).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="text-sm">
                        {new Date(board.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {board.provider === 'dat' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">API Key:</span>
                        <span className="text-sm font-mono">
                          {board.api_key ? '••••••••••••' : 'Not configured'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* DAT Setup Dialog */}
      <Dialog open={showDATSetupDialog} onOpenChange={setShowDATSetupDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Setup DAT Load Board Integration</DialogTitle>
            <DialogDescription>
              Connect to DAT's load board API to access thousands of available loads. You'll need a
              DAT account and API credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">DAT API Key</label>
              <Input
                type="password"
                value={datConfig.api_key}
                onChange={e => setDatConfig({ ...datConfig, api_key: e.target.value })}
                placeholder="Enter your DAT API key"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get your API key from your DAT account dashboard
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">DAT Username</label>
              <Input
                value={datConfig.username}
                onChange={e => setDatConfig({ ...datConfig, username: e.target.value })}
                placeholder="Your DAT username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">DAT Password</label>
              <Input
                type="password"
                value={datConfig.password}
                onChange={e => setDatConfig({ ...datConfig, password: e.target.value })}
                placeholder="Your DAT password"
              />
            </div>
            <Separator />
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                DAT Combo Load Board Plan Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                  <li>✓ Unlimited Search & Post</li>
                  <li>✓ Post & Search Alarms</li>
                  <li>✓ Mileage & Routing</li>
                  <li>✓ DAT Directory with Reviews</li>
                  <li>✓ Mobile App Access</li>
                  <li>✓ Broker Credit Data</li>
                </ul>
                <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                  <li>✓ TriHaul Integration</li>
                  <li>✓ DAT Assurance</li>
                  <li>✓ Book Now Feature</li>
                  <li>✓ Market Conditions Index (MCI)</li>
                  <li>✓ Canadian Loads & Trucks</li>
                  <li>✓ TMS & FTP Integration</li>
                </ul>
              </div>
              <div className="mb-3">
                <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                  <li>✓ Full access to DAT CarrierWatch</li>
                  <li>✓ Preferred & Blocked Companies</li>
                  <li>✓ Contract Lane Rates</li>
                  <li>✓ LaneMakers</li>
                  <li>✓ Group Postings</li>
                </ul>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                Visit{' '}
                <a
                  href="https://www.dat.com/load-boards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  dat.com/load-boards
                </a>{' '}
                to sign up for a DAT account and get API access.
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Or use our proprietary load board system as an alternative.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDATSetupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetupDAT} disabled={isLoading || !datConfig.api_key}>
              {isLoading ? 'Setting up...' : 'Setup DAT Integration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Load Board Dialog */}
      <Dialog open={showNewBoardDialog} onOpenChange={setShowNewBoardDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Load Board</DialogTitle>
            <DialogDescription>
              Create a new proprietary load board or configure additional integrations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Load Board Name</label>
              <Input
                value={newBoard.name}
                onChange={e => setNewBoard({ ...newBoard, name: e.target.value })}
                placeholder="e.g., Regional Load Board"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Board Type</label>
              <Select
                value={newBoard.provider}
                onValueChange={value =>
                  setNewBoard({ ...newBoard, provider: value as 'dat' | 'proprietary' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select board type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proprietary">Proprietary Load Board</SelectItem>
                  <SelectItem value="dat">DAT Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newBoard.provider === 'dat' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <Input
                  type="password"
                  value={newBoard.api_key}
                  onChange={e => setNewBoard({ ...newBoard, api_key: e.target.value })}
                  placeholder="Enter DAT API key"
                />
              </div>
            )}
            <Separator />
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Proprietary Load Board Features:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Post your own loads for drivers to find</li>
                <li>• Manage load assignments and tracking</li>
                <li>• Custom pricing and route optimization</li>
                <li>• Integration with your existing systems</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBoardDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={newBoard.provider === 'dat' ? handleSetupDAT : handleCreateProprietaryBoard}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Load Board'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search & Post Alarms Dialog */}
      <Dialog open={showAlarmsDialog} onOpenChange={setShowAlarmsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search & Post Alarms</DialogTitle>
            <DialogDescription>
              Set up automated alerts for loads matching your criteria and get notified when new
              opportunities arise.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Search Alarms
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                Get notified when loads matching your criteria are posted.
              </p>
              <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                <li>• Email and SMS notifications</li>
                <li>• Custom search criteria</li>
                <li>• Real-time alerts</li>
                <li>• Mobile app notifications</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                Post Alarms
              </h4>
              <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                Get notified when trucks are posted for your lanes.
              </p>
              <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
                <li>• Lane-specific alerts</li>
                <li>• Equipment type matching</li>
                <li>• Capacity notifications</li>
                <li>• Preferred carrier alerts</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlarmsDialog(false)}>
              Close
            </Button>
            <Button onClick={() => setShowAlarmsDialog(false)}>Setup Alarms</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Market Conditions Index Dialog */}
      <Dialog open={showMCIDialog} onOpenChange={setShowMCIDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Market Conditions Index (MCI)</DialogTitle>
            <DialogDescription>
              Real-time market intelligence to help you make informed pricing decisions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">↗ +12%</div>
                    <div className="text-sm text-gray-500">Dry Van Rates</div>
                    <div className="text-xs text-gray-400 mt-1">vs last week</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">→ +2%</div>
                    <div className="text-sm text-gray-500">Reefer Rates</div>
                    <div className="text-xs text-gray-400 mt-1">vs last week</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">↘ -5%</div>
                    <div className="text-sm text-gray-500">Flatbed Rates</div>
                    <div className="text-xs text-gray-400 mt-1">vs last week</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                Market Intelligence Features
              </h4>
              <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-1">
                <li>• Real-time rate trends by equipment type</li>
                <li>• Lane-specific market conditions</li>
                <li>• Seasonal demand patterns</li>
                <li>• Competitive rate analysis</li>
                <li>• Historical data and forecasting</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMCIDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CarrierWatch Dialog */}
      <Dialog open={showCarrierWatchDialog} onOpenChange={setShowCarrierWatchDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>DAT CarrierWatch</DialogTitle>
            <DialogDescription>
              Comprehensive carrier monitoring and risk management tools.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Risk Monitoring
                </h4>
                <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                  <li>• Insurance verification</li>
                  <li>• Safety ratings</li>
                  <li>• Violation history</li>
                  <li>• Out-of-service records</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  Performance Tracking
                </h4>
                <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
                  <li>• On-time delivery rates</li>
                  <li>• Payment history</li>
                  <li>• Customer reviews</li>
                  <li>• Service quality scores</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Preferred & Blocked Companies
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                Manage your preferred carrier network and blocked company lists.
              </p>
              <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                <li>• Custom carrier ratings</li>
                <li>• Automated filtering</li>
                <li>• Performance-based preferences</li>
                <li>• Team collaboration tools</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCarrierWatchDialog(false)}>
              Close
            </Button>
            <Button onClick={() => setShowCarrierWatchDialog(false)}>Access CarrierWatch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
