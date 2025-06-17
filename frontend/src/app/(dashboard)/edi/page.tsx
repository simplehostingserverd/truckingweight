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
  ArrowsRightLeftIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  SignalIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Progress,
} from '@/components/ui';
import Link from 'next/link';

interface TradingPartner {
  id: string;
  name: string;
  type: 'customer' | 'carrier' | 'broker' | 'vendor';
  status: 'active' | 'inactive' | 'pending' | 'error';
  ediId: string;
  qualifierId: string;
  connectionType: 'direct' | 'van' | 'as2' | 'sftp';
  supportedTransactions: string[];
  lastActivity: string;
  monthlyVolume: number;
  successRate: number;
  testMode: boolean;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  technicalContact: {
    name: string;
    email: string;
    phone: string;
  };
  configuration: {
    inboundPath?: string;
    outboundPath?: string;
    acknowledgmentRequired: boolean;
    encryptionRequired: boolean;
    compressionEnabled: boolean;
  };
}

interface EDITransaction {
  id: string;
  transactionType: string;
  direction: 'inbound' | 'outbound';
  tradingPartner: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'acknowledged';
  documentNumber: string;
  controlNumber: string;
  timestamp: string;
  fileSize: number;
  errorCount: number;
  warningCount: number;
  relatedDocuments: string[];
  businessData: {
    loadNumber?: string;
    invoiceNumber?: string;
    poNumber?: string;
    amount?: number;
    shipmentDate?: string;
    deliveryDate?: string;
  };
}

interface EDIMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  averageProcessingTime: number;
  monthlyVolume: number;
  errorRate: number;
  uptimePercentage: number;
  tradingPartnerCount: number;
  activeConnections: number;
}

export default function EDIIntegrationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tradingPartners, setTradingPartners] = useState<TradingPartner[]>([]);
  const [transactions, setTransactions] = useState<EDITransaction[]>([]);
  const [metrics, setMetrics] = useState<EDIMetrics>({
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
    averageProcessingTime: 0,
    monthlyVolume: 0,
    errorRate: 0,
    uptimePercentage: 0,
    tradingPartnerCount: 0,
    activeConnections: 0,
  });
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEDIData();
  }, []);

  const loadEDIData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockTradingPartners: TradingPartner[] = [
        {
          id: 'tp-001',
          name: 'Walmart Transportation',
          type: 'customer',
          status: 'active',
          ediId: '008466000000',
          qualifierId: '01',
          connectionType: 'as2',
          supportedTransactions: ['EDI 204', 'EDI 210', 'EDI 214', 'EDI 990'],
          lastActivity: '2025-01-20T14:30:00Z',
          monthlyVolume: 1250,
          successRate: 98.5,
          testMode: false,
          contactInfo: {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@walmart.com',
            phone: '(555) 123-4567',
          },
          technicalContact: {
            name: 'Mike Chen',
            email: 'mike.chen@walmart.com',
            phone: '(555) 123-4568',
          },
          configuration: {
            inboundPath: '/walmart/inbound',
            outboundPath: '/walmart/outbound',
            acknowledgmentRequired: true,
            encryptionRequired: true,
            compressionEnabled: false,
          },
        },
        {
          id: 'tp-002',
          name: 'Amazon Logistics',
          type: 'customer',
          status: 'active',
          ediId: '008466000001',
          qualifierId: '01',
          connectionType: 'van',
          supportedTransactions: ['EDI 204', 'EDI 214', 'EDI 990'],
          lastActivity: '2025-01-20T13:45:00Z',
          monthlyVolume: 2100,
          successRate: 99.2,
          testMode: false,
          contactInfo: {
            name: 'David Rodriguez',
            email: 'david.rodriguez@amazon.com',
            phone: '(555) 234-5678',
          },
          technicalContact: {
            name: 'Lisa Wang',
            email: 'lisa.wang@amazon.com',
            phone: '(555) 234-5679',
          },
          configuration: {
            acknowledgmentRequired: true,
            encryptionRequired: true,
            compressionEnabled: true,
          },
        },
        {
          id: 'tp-003',
          name: 'C.H. Robinson',
          type: 'broker',
          status: 'pending',
          ediId: '008466000002',
          qualifierId: '01',
          connectionType: 'sftp',
          supportedTransactions: ['EDI 204', 'EDI 210', 'EDI 214'],
          lastActivity: '2025-01-19T16:20:00Z',
          monthlyVolume: 850,
          successRate: 97.8,
          testMode: true,
          contactInfo: {
            name: 'Jennifer Smith',
            email: 'jennifer.smith@chrobinson.com',
            phone: '(555) 345-6789',
          },
          technicalContact: {
            name: 'Robert Kim',
            email: 'robert.kim@chrobinson.com',
            phone: '(555) 345-6790',
          },
          configuration: {
            inboundPath: '/chr/inbound',
            outboundPath: '/chr/outbound',
            acknowledgmentRequired: false,
            encryptionRequired: false,
            compressionEnabled: true,
          },
        },
        {
          id: 'tp-004',
          name: 'J.B. Hunt Transport',
          type: 'carrier',
          status: 'error',
          ediId: '008466000003',
          qualifierId: '01',
          connectionType: 'direct',
          supportedTransactions: ['EDI 214', 'EDI 990'],
          lastActivity: '2025-01-18T10:15:00Z',
          monthlyVolume: 450,
          successRate: 89.3,
          testMode: false,
          contactInfo: {
            name: 'Mark Thompson',
            email: 'mark.thompson@jbhunt.com',
            phone: '(555) 456-7890',
          },
          technicalContact: {
            name: 'Amy Davis',
            email: 'amy.davis@jbhunt.com',
            phone: '(555) 456-7891',
          },
          configuration: {
            acknowledgmentRequired: true,
            encryptionRequired: false,
            compressionEnabled: false,
          },
        },
      ];

      const mockTransactions: EDITransaction[] = [
        {
          id: 'txn-001',
          transactionType: 'EDI 204',
          direction: 'inbound',
          tradingPartner: 'Walmart Transportation',
          status: 'completed',
          documentNumber: 'LD-2025-001234',
          controlNumber: '000001234',
          timestamp: '2025-01-20T14:30:00Z',
          fileSize: 2048,
          errorCount: 0,
          warningCount: 1,
          relatedDocuments: ['EDI 990'],
          businessData: {
            loadNumber: 'WMT-LD-001234',
            poNumber: 'PO-789456123',
            shipmentDate: '2025-01-22',
            deliveryDate: '2025-01-24',
          },
        },
        {
          id: 'txn-002',
          transactionType: 'EDI 210',
          direction: 'outbound',
          tradingPartner: 'Amazon Logistics',
          status: 'pending',
          documentNumber: 'INV-2025-005678',
          controlNumber: '000001235',
          timestamp: '2025-01-20T13:45:00Z',
          fileSize: 1536,
          errorCount: 0,
          warningCount: 0,
          relatedDocuments: [],
          businessData: {
            invoiceNumber: 'INV-2025-005678',
            loadNumber: 'AMZ-LD-005678',
            amount: 2450.0,
          },
        },
        {
          id: 'txn-003',
          transactionType: 'EDI 214',
          direction: 'outbound',
          tradingPartner: 'C.H. Robinson',
          status: 'failed',
          documentNumber: 'ST-2025-009876',
          controlNumber: '000001236',
          timestamp: '2025-01-20T12:15:00Z',
          fileSize: 1024,
          errorCount: 3,
          warningCount: 2,
          relatedDocuments: [],
          businessData: {
            loadNumber: 'CHR-LD-009876',
            shipmentDate: '2025-01-21',
          },
        },
      ];

      const mockMetrics: EDIMetrics = {
        totalTransactions: 15420,
        successfulTransactions: 14890,
        failedTransactions: 285,
        pendingTransactions: 245,
        averageProcessingTime: 45, // seconds
        monthlyVolume: 4650,
        errorRate: 1.85,
        uptimePercentage: 99.7,
        tradingPartnerCount: 12,
        activeConnections: 9,
      };

      setTradingPartners(mockTradingPartners);
      setTransactions(mockTransactions);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading EDI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'acknowledged':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
      case 'processing':
        return <ClockIcon className="h-4 w-4" />;
      case 'error':
      case 'failed':
        return <XCircleIcon className="h-4 w-4" />;
      case 'inactive':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const getPartnerTypeIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'carrier':
        return <ArrowsRightLeftIcon className="h-5 w-5" />;
      case 'broker':
        return <UserIcon className="h-5 w-5" />;
      case 'vendor':
        return <MapPinIcon className="h-5 w-5" />;
      default:
        return <BuildingOfficeIcon className="h-5 w-5" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? (
      <ArrowDownTrayIcon className="h-4 w-4" />
    ) : (
      <ArrowUpTrayIcon className="h-4 w-4" />
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedPartner !== 'all' && transaction.tradingPartner !== selectedPartner) return false;
    if (selectedTransaction !== 'all' && transaction.transactionType !== selectedTransaction)
      return false;
    if (selectedStatus !== 'all' && transaction.status !== selectedStatus) return false;
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">EDI Integration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Electronic Data Interchange management and trading partner connectivity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Reports
          </Button>
          <Link href="/edi/partners/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Trading Partner
            </Button>
          </Link>
        </div>
      </div>

      {/* EDI Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{metrics.totalTransactions.toLocaleString()}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold">
                  {((metrics.successfulTransactions / metrics.totalTransactions) * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+0.3%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Trading Partners</p>
                <p className="text-2xl font-bold">{metrics.tradingPartnerCount}</p>
              </div>
              <BuildingOfficeIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-blue-600">{metrics.activeConnections} active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">System Uptime</p>
                <p className="text-2xl font-bold">{metrics.uptimePercentage}%</p>
              </div>
              <SignalIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Last 30 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Alert */}
      {metrics.failedTransactions > 0 && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                  System Alert: Failed Transactions Detected
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {metrics.failedTransactions} transactions have failed in the last 24 hours. Review
                  the transaction log for details and contact trading partners if necessary.
                </p>
              </div>
              <Button size="sm" variant="outline">
                View Failed Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="partners">Trading Partners</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getDirectionIcon(transaction.direction)}
                        <div>
                          <div className="font-medium">{transaction.transactionType}</div>
                          <div className="text-sm text-gray-500">{transaction.tradingPartner}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Partner Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tradingPartners.slice(0, 5).map(partner => (
                    <div
                      key={partner.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getPartnerTypeIcon(partner.type)}
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{partner.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(partner.status)}>
                          {getStatusIcon(partner.status)}
                          <span className="ml-1">{partner.status}</span>
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {partner.successRate}% success
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.totalTransactions}
                    </div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.successfulTransactions}
                    </div>
                    <div className="text-sm text-gray-500">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {metrics.failedTransactions}
                    </div>
                    <div className="text-sm text-gray-500">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {metrics.pendingTransactions}
                    </div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span>
                      {((metrics.successfulTransactions / metrics.totalTransactions) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(metrics.successfulTransactions / metrics.totalTransactions) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          {/* Trading Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradingPartners.map(partner => (
              <Card key={partner.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPartnerTypeIcon(partner.type)}
                      {partner.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(partner.status)}>
                        {getStatusIcon(partner.status)}
                        <span className="ml-1">{partner.status}</span>
                      </Badge>
                      {partner.testMode && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Test</Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">EDI ID</div>
                        <div className="font-medium">{partner.ediId}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Connection</div>
                        <div className="font-medium capitalize">{partner.connectionType}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Monthly Volume</div>
                        <div className="font-medium">{partner.monthlyVolume.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Success Rate</div>
                        <div className="font-medium">{partner.successRate}%</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-2">Supported Transactions</div>
                      <div className="flex flex-wrap gap-1">
                        {partner.supportedTransactions.map(transaction => (
                          <Badge key={transaction} variant="outline" className="text-xs">
                            {transaction}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          Last Activity: {new Date(partner.lastActivity).toLocaleDateString()}
                        </span>
                        <span className="capitalize">{partner.type}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/edi/partners/${partner.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tradingPartners.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Trading Partners
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Get started by adding your first trading partner.
                  </p>
                  <Link href="/edi/partners/new">
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Trading Partner
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trading Partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Partners</SelectItem>
                    {tradingPartners.map(partner => (
                      <SelectItem key={partner.id} value={partner.name}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="EDI 204">EDI 204 - Load Tender</SelectItem>
                    <SelectItem value="EDI 210">EDI 210 - Invoice</SelectItem>
                    <SelectItem value="EDI 214">EDI 214 - Shipment Status</SelectItem>
                    <SelectItem value="EDI 990">EDI 990 - Load Response</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPartner('all');
                    setSelectedTransaction('all');
                    setSelectedStatus('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>EDI Transactions ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {getDirectionIcon(transaction.direction)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.transactionType}</span>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {transaction.direction}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{transaction.tradingPartner}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          Document: {transaction.documentNumber} • Control:{' '}
                          {transaction.controlNumber} • Size:{' '}
                          {(transaction.fileSize / 1024).toFixed(1)}KB
                          {transaction.errorCount > 0 && (
                            <span className="text-red-600"> • {transaction.errorCount} errors</span>
                          )}
                          {transaction.warningCount > 0 && (
                            <span className="text-yellow-600">
                              {' '}
                              • {transaction.warningCount} warnings
                            </span>
                          )}
                        </div>
                        {transaction.businessData.loadNumber && (
                          <div className="text-xs text-gray-500 mt-1">
                            Load: {transaction.businessData.loadNumber}
                            {transaction.businessData.amount && (
                              <span>
                                {' '}
                                • Amount: ${transaction.businessData.amount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {transaction.status === 'failed' && (
                          <Button size="sm" variant="outline">
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Transactions Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No transactions match your current filters.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Processing Time</p>
                    <p className="text-2xl font-bold">{metrics.averageProcessingTime}s</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-green-600">-5.2s</span>
                  <span className="text-gray-500 ml-1">vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Error Rate</p>
                    <p className="text-2xl font-bold">{metrics.errorRate}%</p>
                  </div>
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-red-600">+0.3%</span>
                  <span className="text-gray-500 ml-1">vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Volume</p>
                    <p className="text-2xl font-bold">{metrics.monthlyVolume.toLocaleString()}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-green-600">+18.7%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Connections</p>
                    <p className="text-2xl font-bold">{metrics.activeConnections}</p>
                  </div>
                  <SignalIcon className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-500">of {metrics.tradingPartnerCount} total</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Trading Partner Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tradingPartners.map(partner => (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          partner.status === 'active'
                            ? 'bg-green-500'
                            : partner.status === 'pending'
                              ? 'bg-yellow-500'
                              : partner.status === 'error'
                                ? 'bg-red-500'
                                : 'bg-gray-500'
                        }`}
                      ></div>
                      <div>
                        <div className="font-medium">{partner.name}</div>
                        <div className="text-sm text-gray-500">
                          {partner.connectionType.toUpperCase()} • {partner.ediId}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{partner.successRate}% success rate</div>
                      <div className="text-xs text-gray-500">
                        {partner.monthlyVolume} transactions/month
                      </div>
                      <div className="text-xs text-gray-400">
                        Last: {new Date(partner.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Test Connection
                      </Button>
                      <Button size="sm" variant="outline">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Types Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['EDI 204', 'EDI 210', 'EDI 214', 'EDI 990'].map(transactionType => {
                  const typeTransactions = transactions.filter(
                    t => t.transactionType === transactionType
                  );
                  const successCount = typeTransactions.filter(
                    t => t.status === 'completed'
                  ).length;
                  const successRate =
                    typeTransactions.length > 0
                      ? (successCount / typeTransactions.length) * 100
                      : 0;

                  return (
                    <div key={transactionType} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{transactionType}</h4>
                        <Badge
                          className={
                            successRate >= 95
                              ? 'bg-green-100 text-green-800'
                              : successRate >= 90
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {successRate.toFixed(1)}% success
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Total</div>
                          <div className="font-medium">{typeTransactions.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Successful</div>
                          <div className="font-medium text-green-600">{successCount}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Failed</div>
                          <div className="font-medium text-red-600">
                            {typeTransactions.filter(t => t.status === 'failed').length}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={successRate} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <div className="flex items-center gap-3">
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium text-red-900 dark:text-red-100">
                        Connection Error: J.B. Hunt Transport
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300">
                        Unable to establish connection. Last successful connection: 2 days ago.
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-red-600">2 hours ago</div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium text-yellow-900 dark:text-yellow-100">
                        High Error Rate: EDI 214 Transactions
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        Error rate increased to 8.5% in the last hour. Review transaction logs.
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-yellow-600">45 minutes ago</div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="flex items-center gap-3">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">
                        New Trading Partner: C.H. Robinson
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        Trading partner setup completed. Test transactions recommended.
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600">3 hours ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
