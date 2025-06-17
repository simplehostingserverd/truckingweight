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
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  PaperAirplaneIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
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

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  loadId?: number;
  loadNumber?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms: number;
  notes?: string;
  ediSent: boolean;
  ediSentAt?: string;
}

interface InvoiceStats {
  totalInvoices: number;
  totalOutstanding: number;
  overdueAmount: number;
  paidThisMonth: number;
  averagePaymentTime: number;
  collectionRate: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    paidThisMonth: 0,
    averagePaymentTime: 0,
    collectionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter, customerFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockInvoices: Invoice[] = [
        {
          id: 1,
          invoiceNumber: 'INV-2025-001',
          customerId: 1,
          customerName: 'ABC Logistics',
          loadId: 1,
          loadNumber: 'LD-2025-001',
          invoiceDate: '2025-01-15',
          dueDate: '2025-02-14',
          subtotal: 2500.0,
          taxAmount: 200.0,
          totalAmount: 2700.0,
          paidAmount: 0,
          balanceDue: 2700.0,
          status: 'sent',
          paymentTerms: 30,
          ediSent: true,
          ediSentAt: '2025-01-15',
        },
        {
          id: 2,
          invoiceNumber: 'INV-2025-002',
          customerId: 2,
          customerName: 'XYZ Shipping',
          loadId: 2,
          loadNumber: 'LD-2025-002',
          invoiceDate: '2025-01-10',
          dueDate: '2025-01-25',
          subtotal: 1800.0,
          taxAmount: 144.0,
          totalAmount: 1944.0,
          paidAmount: 0,
          balanceDue: 1944.0,
          status: 'overdue',
          paymentTerms: 15,
          ediSent: true,
          ediSentAt: '2025-01-10',
        },
        {
          id: 3,
          invoiceNumber: 'INV-2025-003',
          customerId: 3,
          customerName: 'Global Transport',
          loadId: 3,
          loadNumber: 'LD-2025-003',
          invoiceDate: '2025-01-12',
          dueDate: '2025-02-11',
          subtotal: 3200.0,
          taxAmount: 256.0,
          totalAmount: 3456.0,
          paidAmount: 3456.0,
          balanceDue: 0,
          status: 'paid',
          paymentTerms: 30,
          ediSent: true,
          ediSentAt: '2025-01-12',
        },
        {
          id: 4,
          invoiceNumber: 'INV-2025-004',
          customerId: 1,
          customerName: 'ABC Logistics',
          loadId: 4,
          loadNumber: 'LD-2025-004',
          invoiceDate: '2025-01-18',
          dueDate: '2025-02-17',
          subtotal: 2100.0,
          taxAmount: 168.0,
          totalAmount: 2268.0,
          paidAmount: 0,
          balanceDue: 2268.0,
          status: 'draft',
          paymentTerms: 30,
          ediSent: false,
        },
        {
          id: 5,
          invoiceNumber: 'INV-2025-005',
          customerId: 4,
          customerName: 'Freight Solutions',
          loadId: 5,
          loadNumber: 'LD-2025-005',
          invoiceDate: '2025-01-08',
          dueDate: '2025-01-23',
          subtotal: 2800.0,
          taxAmount: 224.0,
          totalAmount: 3024.0,
          paidAmount: 0,
          balanceDue: 3024.0,
          status: 'overdue',
          paymentTerms: 15,
          ediSent: true,
          ediSentAt: '2025-01-08',
        },
      ];

      const mockStats: InvoiceStats = {
        totalInvoices: mockInvoices.length,
        totalOutstanding: mockInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0),
        overdueAmount: mockInvoices
          .filter(inv => inv.status === 'overdue')
          .reduce((sum, inv) => sum + inv.balanceDue, 0),
        paidThisMonth: mockInvoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.totalAmount, 0),
        averagePaymentTime: 18.5,
        collectionRate: 85.2,
      };

      setInvoices(mockInvoices);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(
        invoice =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (invoice.loadNumber &&
            invoice.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (customerFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.customerName === customerFilter);
    }

    setFilteredInvoices(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <PaperAirplaneIcon className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage customer invoices and track payments
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/invoices/batch">
            <Button variant="outline">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Batch Invoice
            </Button>
          </Link>
          <Link href="/invoices/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              New Invoice
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
                  Overdue Amount
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">
                  ${stats.overdueAmount.toLocaleString()}
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
                  Paid This Month
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">
                  ${stats.paidThisMonth.toLocaleString()}
                </h3>
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
                  Collection Rate
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.collectionRate}%</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                placeholder="Search invoices..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="ABC Logistics">ABC Logistics</SelectItem>
                <SelectItem value="XYZ Shipping">XYZ Shipping</SelectItem>
                <SelectItem value="Global Transport">Global Transport</SelectItem>
                <SelectItem value="Freight Solutions">Freight Solutions</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCustomerFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Load</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </div>
                        {invoice.ediSent && <div className="text-xs text-green-600">EDI Sent</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">{invoice.paymentTerms} day terms</div>
                    </TableCell>
                    <TableCell>
                      {invoice.loadNumber ? (
                        <Link
                          href={`/loads/${invoice.loadId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {invoice.loadNumber}
                        </Link>
                      ) : (
                        <span className="text-gray-400">No load</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${invoice.totalAmount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">
                          Subtotal: ${invoice.subtotal.toLocaleString()}
                        </div>
                        {invoice.taxAmount > 0 && (
                          <div className="text-xs text-gray-500">
                            Tax: ${invoice.taxAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                      {invoice.status === 'overdue' && (
                        <div className="text-xs text-red-600">
                          {getDaysOverdue(invoice.dueDate)} days overdue
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${invoice.balanceDue.toLocaleString()}</div>
                      {invoice.paidAmount > 0 && (
                        <div className="text-sm text-green-600">
                          Paid: ${invoice.paidAmount.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        {invoice.status === 'draft' && (
                          <Link href={`/invoices/${invoice.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {(invoice.status === 'draft' || invoice.status === 'sent') && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <PaperAirplaneIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No invoices found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || customerFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first invoice.'}
              </p>
              {!searchTerm && statusFilter === 'all' && customerFilter === 'all' && (
                <Link href="/invoices/new">
                  <Button className="mt-4">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Invoice
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
