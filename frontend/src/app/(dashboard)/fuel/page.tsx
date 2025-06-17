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

import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CreditCardIcon,
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import Link from 'next/link';

interface FuelCard {
  id: number;
  cardNumber: string;
  provider: string;
  assignedToDriver?: string;
  assignedToVehicle?: string;
  creditLimit: number;
  currentBalance: number;
  status: 'active' | 'suspended' | 'cancelled';
  lastUsed?: string;
}

interface FuelTransaction {
  id: number;
  fuelCardId: number;
  cardNumber: string;
  driverName: string;
  vehicleName: string;
  transactionDate: string;
  locationName: string;
  locationAddress: string;
  fuelType: string;
  gallons: number;
  pricePerGallon: number;
  totalAmount: number;
  odometerReading?: number;
}

interface FuelStats {
  totalCards: number;
  activeCards: number;
  totalSpentThisMonth: number;
  averagePricePerGallon: number;
  totalGallonsThisMonth: number;
  averageMPG: number;
}

export default function FuelManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [fuelCards, setFuelCards] = useState<FuelCard[]>([]);
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<FuelTransaction[]>([]);
  const [stats, setStats] = useState<FuelStats>({
    totalCards: 0,
    activeCards: 0,
    totalSpentThisMonth: 0,
    averagePricePerGallon: 0,
    totalGallonsThisMonth: 0,
    averageMPG: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [driverFilter, setDriverFilter] = useState('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');

  useEffect(() => {
    loadFuelData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, driverFilter, fuelTypeFilter]);

  const loadFuelData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockFuelCards: FuelCard[] = [
        {
          id: 1,
          cardNumber: '****-****-****-1234',
          provider: 'Comdata',
          assignedToDriver: 'John Smith',
          assignedToVehicle: 'Freightliner #001',
          creditLimit: 5000.0,
          currentBalance: 3250.0,
          status: 'active',
          lastUsed: '2025-01-17',
        },
        {
          id: 2,
          cardNumber: '****-****-****-5678',
          provider: 'WEX',
          assignedToDriver: 'Mike Johnson',
          assignedToVehicle: 'Peterbilt #002',
          creditLimit: 4500.0,
          currentBalance: 2100.0,
          status: 'active',
          lastUsed: '2025-01-16',
        },
        {
          id: 3,
          cardNumber: '****-****-****-9012',
          provider: 'Voyager',
          assignedToDriver: 'Sarah Wilson',
          assignedToVehicle: 'Kenworth #003',
          creditLimit: 5500.0,
          currentBalance: 4200.0,
          status: 'active',
          lastUsed: '2025-01-15',
        },
      ];

      const mockTransactions: FuelTransaction[] = [
        {
          id: 1,
          fuelCardId: 1,
          cardNumber: '****-1234',
          driverName: 'John Smith',
          vehicleName: 'Freightliner #001',
          transactionDate: '2025-01-17',
          locationName: 'Flying J Travel Center',
          locationAddress: '123 Highway 55, Springfield, IL',
          fuelType: 'Diesel',
          gallons: 125.5,
          pricePerGallon: 3.45,
          totalAmount: 432.98,
          odometerReading: 125000,
        },
        {
          id: 2,
          fuelCardId: 2,
          cardNumber: '****-5678',
          driverName: 'Mike Johnson',
          vehicleName: 'Peterbilt #002',
          transactionDate: '2025-01-16',
          locationName: 'Pilot Travel Center',
          locationAddress: '456 Interstate 70, Springfield, IL',
          fuelType: 'Diesel',
          gallons: 110.2,
          pricePerGallon: 3.42,
          totalAmount: 376.88,
          odometerReading: 98500,
        },
        {
          id: 3,
          fuelCardId: 1,
          cardNumber: '****-1234',
          driverName: 'John Smith',
          vehicleName: 'Freightliner #001',
          transactionDate: '2025-01-15',
          locationName: 'TA Travel Center',
          locationAddress: '789 Route 66, Springfield, IL',
          fuelType: 'DEF',
          gallons: 8.5,
          pricePerGallon: 2.95,
          totalAmount: 25.08,
          odometerReading: 124800,
        },
        {
          id: 4,
          fuelCardId: 3,
          cardNumber: '****-9012',
          driverName: 'Sarah Wilson',
          vehicleName: 'Kenworth #003',
          transactionDate: '2025-01-15',
          locationName: "Love's Travel Stop",
          locationAddress: '321 Highway 40, Springfield, IL',
          fuelType: 'Diesel',
          gallons: 135.8,
          pricePerGallon: 3.48,
          totalAmount: 472.58,
          odometerReading: 87200,
        },
        {
          id: 5,
          fuelCardId: 2,
          cardNumber: '****-5678',
          driverName: 'Mike Johnson',
          vehicleName: 'Peterbilt #002',
          transactionDate: '2025-01-14',
          locationName: 'Shell Station',
          locationAddress: '654 Main Street, Springfield, IL',
          fuelType: 'Diesel',
          gallons: 95.3,
          pricePerGallon: 3.5,
          totalAmount: 333.55,
          odometerReading: 98200,
        },
      ];

      const mockStats: FuelStats = {
        totalCards: mockFuelCards.length,
        activeCards: mockFuelCards.filter(card => card.status === 'active').length,
        totalSpentThisMonth: mockTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
        averagePricePerGallon:
          mockTransactions.reduce((sum, t) => sum + t.pricePerGallon, 0) / mockTransactions.length,
        totalGallonsThisMonth: mockTransactions.reduce((sum, t) => sum + t.gallons, 0),
        averageMPG: 6.8,
      };

      setFuelCards(mockFuelCards);
      setTransactions(mockTransactions);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading fuel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        transaction =>
          transaction.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.locationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (driverFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.driverName === driverFilter);
    }

    if (fuelTypeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.fuelType === fuelTypeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const getCardStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getFuelTypeColor = (fuelType: string) => {
    switch (fuelType) {
      case 'Diesel':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DEF':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Gasoline':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Fuel Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage fuel cards and track fuel expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/fuel/cards/new">
            <Button variant="outline">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Add Fuel Card
            </Button>
          </Link>
          <Link href="/fuel/transactions/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Record Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Monthly Fuel Cost
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.totalSpentThisMonth.toLocaleString()}
                </h3>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg. Price/Gallon
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.averagePricePerGallon.toFixed(2)}
                </h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Gallons
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.totalGallonsThisMonth.toLocaleString()}
                </h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <TruckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fleet Avg. MPG
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.averageMPG}</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cards">Fuel Cards</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <TruckIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{transaction.driverName}</span>
                          <Badge className={getFuelTypeColor(transaction.fuelType)}>
                            {transaction.fuelType}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{transaction.vehicleName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {transaction.locationName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${transaction.totalAmount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.gallons.toFixed(1)} gal @ $
                          {transaction.pricePerGallon.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab('transactions')}
                  >
                    View All Transactions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fuel Cards Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Fuel Cards Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fuelCards.map(card => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{card.cardNumber}</span>
                          <Badge className={getCardStatusColor(card.status)}>{card.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{card.provider}</p>
                        <p className="text-xs text-gray-400">
                          {card.assignedToDriver} • {card.assignedToVehicle}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${card.currentBalance.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">
                          of ${card.creditLimit.toLocaleString()}
                        </div>
                        {card.lastUsed && (
                          <div className="text-xs text-gray-400">
                            Last: {new Date(card.lastUsed).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab('cards')}
                  >
                    Manage Fuel Cards
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fuel Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Fuel Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blue-600">
                    ${stats.averagePricePerGallon.toFixed(2)}
                  </h3>
                  <p className="text-sm text-gray-500">Avg. Price per Gallon</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-600">{stats.averageMPG}</h3>
                  <p className="text-sm text-gray-500">Fleet Average MPG</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-purple-600">
                    {stats.totalGallonsThisMonth.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-500">Gallons This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fuelCards.map(card => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CreditCardIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium">{card.cardNumber}</h4>
                          <p className="text-sm text-gray-500">{card.provider}</p>
                        </div>
                        <Badge className={getCardStatusColor(card.status)}>{card.status}</Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Driver:</span>
                          <p className="font-medium">{card.assignedToDriver || 'Unassigned'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Vehicle:</span>
                          <p className="font-medium">{card.assignedToVehicle || 'Unassigned'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Credit Limit:</span>
                          <p className="font-medium">${card.creditLimit.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Available:</span>
                          <p className="font-medium">${card.currentBalance.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="outline">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={driverFilter} onValueChange={setDriverFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drivers</SelectItem>
                    <SelectItem value="John Smith">John Smith</SelectItem>
                    <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                    <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fuel Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="DEF">DEF</SelectItem>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setDriverFilter('all');
                    setFuelTypeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Fuel Transactions ({filteredTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Driver/Vehicle</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Fuel Type</TableHead>
                      <TableHead>Gallons</TableHead>
                      <TableHead>Price/Gal</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.driverName}</div>
                            <div className="text-sm text-gray-500">{transaction.vehicleName}</div>
                            <div className="text-xs text-gray-400">
                              Card: {transaction.cardNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.locationName}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {transaction.locationAddress}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getFuelTypeColor(transaction.fuelType)}>
                            {transaction.fuelType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.gallons.toFixed(1)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${transaction.pricePerGallon.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-lg">
                            ${transaction.totalAmount.toFixed(2)}
                          </div>
                          {transaction.odometerReading && (
                            <div className="text-xs text-gray-500">
                              Odometer: {transaction.odometerReading.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/fuel/transactions/${transaction.id}`}>
                            <Button size="sm" variant="outline">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No transactions found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || driverFilter !== 'all' || fuelTypeFilter !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'Get started by recording your first fuel transaction.'}
                  </p>
                  {!searchTerm && driverFilter === 'all' && fuelTypeFilter === 'all' && (
                    <Link href="/fuel/transactions/new">
                      <Button className="mt-4">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Record Transaction
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
