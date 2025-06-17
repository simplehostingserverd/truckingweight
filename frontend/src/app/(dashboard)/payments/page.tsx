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
  CreditCardIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
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
} from '@/components/ui';
import Link from 'next/link';

interface Payment {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  customerName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'check' | 'ach' | 'wire' | 'credit_card' | 'cash';
  referenceNumber?: string;
  notes?: string;
  status: 'pending' | 'cleared' | 'failed' | 'cancelled';
  processedBy?: string;
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingAmount: number;
  averagePaymentTime: number;
  paymentsThisMonth: number;
  amountThisMonth: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    pendingAmount: 0,
    averagePaymentTime: 0,
    paymentsThisMonth: 0,
    amountThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockPayments: Payment[] = [
        {
          id: 1,
          invoiceId: 3,
          invoiceNumber: 'INV-2025-003',
          customerName: 'Global Transport',
          paymentDate: '2025-01-14',
          amount: 3456.0,
          paymentMethod: 'ach',
          referenceNumber: 'ACH-20250114-001',
          status: 'cleared',
          processedBy: 'Sarah Wilson',
        },
        {
          id: 2,
          invoiceId: 1,
          invoiceNumber: 'INV-2025-001',
          customerName: 'ABC Logistics',
          paymentDate: '2025-01-16',
          amount: 1350.0,
          paymentMethod: 'check',
          referenceNumber: 'CHK-4567',
          status: 'pending',
          processedBy: 'Mike Johnson',
          notes: 'Partial payment received',
        },
        {
          id: 3,
          invoiceId: 6,
          invoiceNumber: 'INV-2025-006',
          customerName: 'Freight Solutions',
          paymentDate: '2025-01-12',
          amount: 2800.0,
          paymentMethod: 'wire',
          referenceNumber: 'WIRE-20250112-001',
          status: 'cleared',
          processedBy: 'Tom Rodriguez',
        },
        {
          id: 4,
          invoiceId: 7,
          invoiceNumber: 'INV-2025-007',
          customerName: 'XYZ Shipping',
          paymentDate: '2025-01-18',
          amount: 1944.0,
          paymentMethod: 'credit_card',
          referenceNumber: 'CC-20250118-001',
          status: 'failed',
          processedBy: 'Lisa Chen',
          notes: 'Card declined - insufficient funds',
        },
        {
          id: 5,
          invoiceId: 8,
          invoiceNumber: 'INV-2025-008',
          customerName: 'Regional Carriers',
          paymentDate: '2025-01-15',
          amount: 4200.0,
          paymentMethod: 'ach',
          referenceNumber: 'ACH-20250115-002',
          status: 'cleared',
          processedBy: 'David Brown',
        },
        {
          id: 6,
          invoiceId: 9,
          invoiceNumber: 'INV-2025-009',
          customerName: 'Metro Logistics',
          paymentDate: '2025-01-17',
          amount: 2100.0,
          paymentMethod: 'check',
          referenceNumber: 'CHK-7890',
          status: 'pending',
          processedBy: 'Jennifer Davis',
        },
      ];

      const mockStats: PaymentStats = {
        totalPayments: mockPayments.length,
        totalAmount: mockPayments.reduce((sum, payment) => sum + payment.amount, 0),
        pendingAmount: mockPayments
          .filter(p => p.status === 'pending')
          .reduce((sum, payment) => sum + payment.amount, 0),
        averagePaymentTime: 18.5,
        paymentsThisMonth: mockPayments.length,
        amountThisMonth: mockPayments.reduce((sum, payment) => sum + payment.amount, 0),
      };

      setPayments(mockPayments);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(
        payment =>
          payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (payment.referenceNumber &&
            payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cleared':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cleared':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <ClockIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'check':
        return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
      case 'ach':
        return <BanknotesIcon className="h-4 w-4 text-green-500" />;
      case 'wire':
        return <BanknotesIcon className="h-4 w-4 text-purple-500" />;
      case 'credit_card':
        return <CreditCardIcon className="h-4 w-4 text-orange-500" />;
      case 'cash':
        return <BanknotesIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <BanknotesIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'check':
        return 'Check';
      case 'ach':
        return 'ACH';
      case 'wire':
        return 'Wire Transfer';
      case 'credit_card':
        return 'Credit Card';
      case 'cash':
        return 'Cash';
      default:
        return method;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage customer payments
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/payments/batch">
            <Button variant="outline">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Batch Process
            </Button>
          </Link>
          <Link href="/payments/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Record Payment
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
                  Total Received
                </p>
                <h3 className="text-2xl font-bold mt-1">${stats.totalAmount.toLocaleString()}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Amount
                </p>
                <h3 className="text-2xl font-bold mt-1 text-yellow-600">
                  ${stats.pendingAmount.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.amountThisMonth.toLocaleString()}
                </h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg. Payment Time
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.averagePaymentTime} days</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="ach">ACH</SelectItem>
                <SelectItem value="wire">Wire Transfer</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setMethodFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Payments ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">Payment #{payment.id}</div>
                        {payment.referenceNumber && (
                          <div className="text-sm text-gray-500">
                            Ref: {payment.referenceNumber}
                          </div>
                        )}
                        {payment.processedBy && (
                          <div className="text-xs text-gray-400">By: {payment.processedBy}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/invoices/${payment.invoiceId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {payment.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.customerName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-lg">${payment.amount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.paymentMethod)}
                        <span className="font-medium">{getMethodLabel(payment.paymentMethod)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                      </div>
                      {payment.notes && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {payment.notes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/payments/${payment.id}`}>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        {payment.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircleIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {payment.status === 'failed' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Retry
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No payments found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || methodFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by recording your first payment.'}
              </p>
              {!searchTerm && statusFilter === 'all' && methodFilter === 'all' && (
                <Link href="/payments/new">
                  <Button className="mt-4">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Record Payment
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
