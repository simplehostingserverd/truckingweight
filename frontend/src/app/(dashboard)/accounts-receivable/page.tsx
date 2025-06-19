/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved;
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System;
 * Unauthorized copying of this file, via any medium is strictly prohibited;
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission;
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
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
} from '@/components/ui';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface AccountsReceivableItem {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  invoiceDate: string;
  dueDate: string;
  originalAmount: number;
  balanceDue: number;
  daysOverdue: number;
  agingBucket: '0-30' | '31-60' | '61-90' | '90+';
  lastContactDate?: string;
  lastContactMethod?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ARStats {
  totalOutstanding: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90Plus: number;
  averageDaysOutstanding: number;
  collectionEfficiency: number;
}

export default function AccountsReceivablePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [arItems, setArItems] = useState<AccountsReceivableItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<AccountsReceivableItem[]>([]);
  const [stats, setStats] = useState<ARStats>({
    totalOutstanding: 0,
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    days90Plus: 0,
    averageDaysOutstanding: 0,
    collectionEfficiency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [agingFilter, setAgingFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadAccountsReceivable();
  }, []);

  useEffect(() => {
    filterItems();
  }, [arItems, searchTerm, agingFilter, priorityFilter]);

  const loadAccountsReceivable = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockARItems: AccountsReceivableItem[] = [
        {
          id: 1,
          invoiceId: 1,
          invoiceNumber: 'INV-2025-001',
          customerId: 1,
          customerName: 'ABC Logistics',
          customerEmail: 'john@abclogistics.com',
          customerPhone: '(555) 123-4567',
          invoiceDate: '2024-12-15',
          dueDate: '2025-01-14',
          originalAmount: 2700.0,
          balanceDue: 2700.0,
          daysOverdue: 3,
          agingBucket: '0-30',
          lastContactDate: '2025-01-16',
          lastContactMethod: 'email',
          priority: 'medium',
          notes: 'Customer requested payment extension until end of month',
        },
        {
          id: 2,
          invoiceId: 2,
          invoiceNumber: 'INV-2025-002',
          customerId: 2,
          customerName: 'XYZ Shipping',
          customerEmail: 'sarah@xyzshipping.com',
          customerPhone: '(555) 234-5678',
          invoiceDate: '2024-11-20',
          dueDate: '2024-12-05',
          originalAmount: 1944.0,
          balanceDue: 1944.0,
          daysOverdue: 43,
          agingBucket: '31-60',
          lastContactDate: '2025-01-10',
          lastContactMethod: 'phone',
          priority: 'high',
          notes: 'Disputed charges - awaiting documentation',
        },
        {
          id: 3,
          invoiceId: 5,
          invoiceNumber: 'INV-2024-045',
          customerId: 4,
          customerName: 'Freight Solutions',
          customerEmail: 'lisa@freightsolutions.com',
          customerPhone: '(555) 456-7890',
          invoiceDate: '2024-10-15',
          dueDate: '2024-11-14',
          originalAmount: 3024.0,
          balanceDue: 1512.0,
          daysOverdue: 64,
          agingBucket: '61-90',
          lastContactDate: '2025-01-08',
          lastContactMethod: 'email',
          priority: 'high',
          notes: 'Partial payment received. Following up on remaining balance.',
        },
        {
          id: 4,
          invoiceId: 8,
          invoiceNumber: 'INV-2024-032',
          customerId: 5,
          customerName: 'Regional Carriers',
          customerEmail: 'tom@regionalcarriers.com',
          customerPhone: '(555) 567-8901',
          invoiceDate: '2024-09-10',
          dueDate: '2024-10-10',
          originalAmount: 4500.0,
          balanceDue: 4500.0,
          daysOverdue: 99,
          agingBucket: '90+',
          priority: 'critical',
          notes: 'Account sent to collections. Legal action pending.',
        },
        {
          id: 5,
          invoiceId: 12,
          invoiceNumber: 'INV-2024-058',
          customerId: 3,
          customerName: 'Global Transport',
          customerEmail: 'mike@globaltransport.com',
          customerPhone: '(555) 345-6789',
          invoiceDate: '2024-12-01',
          dueDate: '2024-12-31',
          originalAmount: 3456.0,
          balanceDue: 3456.0,
          daysOverdue: 17,
          agingBucket: '0-30',
          lastContactDate: '2025-01-15',
          lastContactMethod: 'phone',
          priority: 'low',
          notes: 'Customer confirmed payment will be processed this week',
        },
      ];

      const mockStats: ARStats = {
        totalOutstanding: mockARItems.reduce((sum, item) => sum + item.balanceDue, 0),
        current: mockARItems
          .filter(item => item.daysOverdue <= 0)
          .reduce((sum, item) => sum + item.balanceDue, 0),
        days30: mockARItems
          .filter(item => item.agingBucket === '0-30')
          .reduce((sum, item) => sum + item.balanceDue, 0),
        days60: mockARItems
          .filter(item => item.agingBucket === '31-60')
          .reduce((sum, item) => sum + item.balanceDue, 0),
        days90: mockARItems
          .filter(item => item.agingBucket === '61-90')
          .reduce((sum, item) => sum + item.balanceDue, 0),
        days90Plus: mockARItems
          .filter(item => item.agingBucket === '90+')
          .reduce((sum, item) => sum + item.balanceDue, 0),
        averageDaysOutstanding:
          mockARItems.reduce((sum, item) => sum + item.daysOverdue, 0) / mockARItems.length,
        collectionEfficiency: 85.2,
      };

      setArItems(mockARItems);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading accounts receivable:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = arItems;

    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (agingFilter !== 'all') {
      filtered = filtered.filter(item => item.agingBucket === agingFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    setFilteredItems(filtered);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getAgingColor = (bucket: string) => {
    switch (bucket) {
      case '0-30':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '31-60':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '61-90':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case '90+':
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Accounts Receivable</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage outstanding invoices and collections
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Aging Report
          </Button>
          <Button>
            <PhoneIcon className="h-5 w-5 mr-2" />
            Collection Call
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Outstanding
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.totalOutstanding.toLocaleString()}
                </h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  90+ Days Overdue
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">
                  ${stats.days90Plus.toLocaleString()}
                </h3>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg. Days Outstanding
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {Math.round(stats.averageDaysOutstanding)}
                </h3>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Collection Rate
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">
                  {stats.collectionEfficiency}%
                </h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Aging Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Aging Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold text-green-600">
                    ${stats.days30.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-500">0-30 Days</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-600">
                    ${stats.days60.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-500">31-60 Days</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-600">
                    ${stats.days90.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-500">61-90 Days</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold text-red-600">
                    ${stats.days90Plus.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-500">90+ Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Items */}
          <Card>
            <CardHeader>
              <CardTitle>High Priority Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {arItems
                  .filter(item => item.priority === 'critical' || item.priority === 'high')
                  .slice(0, 5)
                  .map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.customerName}</span>
                          <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                          <Badge className={getAgingColor(item.agingBucket)}>
                            {item.daysOverdue} days overdue
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{item.invoiceNumber}</p>
                        {item.notes && <p className="text-xs text-gray-400 mt-1">{item.notes}</p>}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-lg">
                          ${item.balanceDue.toLocaleString()}
                        </div>
                        {item.lastContactDate && (
                          <div className="text-xs text-gray-500">
                            Last contact: {new Date(item.lastContactDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={agingFilter} onValueChange={setAgingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Aging Bucket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="0-30">0-30 Days</SelectItem>
                    <SelectItem value="31-60">31-60 Days</SelectItem>
                    <SelectItem value="61-90">61-90 Days</SelectItem>
                    <SelectItem value="90+">90+ Days</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setAgingFilter('all');
                    setPriorityFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AR Table */}
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Receivables ({filteredItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.customerName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <PhoneIcon className="h-3 w-3" />
                              {item.customerPhone}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <EnvelopeIcon className="h-3 w-3" />
                              {item.customerEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Link
                              href={`/invoices/${item.invoiceId}`}
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {item.invoiceNumber}
                            </Link>
                            <div className="text-sm text-gray-500">
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-lg">
                              ${item.balanceDue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              of ${item.originalAmount.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getAgingColor(item.agingBucket)}>
                              {item.daysOverdue} days
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.lastContactDate ? (
                            <div className="text-sm">
                              <div>{new Date(item.lastContactDate).toLocaleDateString()}</div>
                              <div className="text-gray-500 capitalize">
                                {item.lastContactMethod}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No contact</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/accounts-receivable/${item.id}`}>
                              <Button size="sm" variant="outline">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <PhoneIcon className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <EnvelopeIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collection Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PhoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Collection Tools
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Manage collection activities and track customer communications
                </p>
                <div className="flex gap-2 justify-center">
                  <Button>
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    Make Collection Call
                  </Button>
                  <Button variant="outline">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Send Collection Email
                  </Button>
                  <Button variant="outline">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Generate Statement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
