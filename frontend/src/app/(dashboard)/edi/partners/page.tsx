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
  BuildingOfficeIcon,
  PlusIcon,
  EyeIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  SignalIcon,
  PhoneIcon,
  EnvelopeIcon,
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
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  businessInfo: {
    industry: string;
    annualVolume: number;
    primaryCommodities: string[];
    operatingRegions: string[];
  };
}

export default function TradingPartnersPage() {
  const [partners, setPartners] = useState<TradingPartner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedConnection, setSelectedConnection] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTradingPartners();
  }, []);

  const loadTradingPartners = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockPartners: TradingPartner[] = [
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
          address: {
            street: '702 SW 8th Street',
            city: 'Bentonville',
            state: 'AR',
            zip: '72716',
            country: 'USA',
          },
          businessInfo: {
            industry: 'Retail',
            annualVolume: 15000,
            primaryCommodities: ['General Merchandise', 'Groceries', 'Electronics'],
            operatingRegions: ['National', 'International'],
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
          address: {
            street: '410 Terry Avenue North',
            city: 'Seattle',
            state: 'WA',
            zip: '98109',
            country: 'USA',
          },
          businessInfo: {
            industry: 'E-commerce',
            annualVolume: 25000,
            primaryCommodities: ['Consumer Goods', 'Electronics', 'Books'],
            operatingRegions: ['Global'],
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
          address: {
            street: '14701 Charlson Road',
            city: 'Eden Prairie',
            state: 'MN',
            zip: '55347',
            country: 'USA',
          },
          businessInfo: {
            industry: 'Logistics',
            annualVolume: 10000,
            primaryCommodities: ['Mixed Freight', 'Temperature Controlled'],
            operatingRegions: ['North America'],
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
          address: {
            street: '615 J.B. Hunt Corporate Drive',
            city: 'Lowell',
            state: 'AR',
            zip: '72745',
            country: 'USA',
          },
          businessInfo: {
            industry: 'Transportation',
            annualVolume: 5400,
            primaryCommodities: ['Intermodal', 'Dedicated Contract Services'],
            operatingRegions: ['North America'],
          },
        },
      ];

      setPartners(mockPartners);
    } catch (error) {
      console.error('Error loading trading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4" />;
      case 'inactive':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
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

  const filteredPartners = partners.filter(partner => {
    if (
      searchTerm &&
      !partner.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !partner.ediId.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (selectedType !== 'all' && partner.type !== selectedType) return false;
    if (selectedStatus !== 'all' && partner.status !== selectedStatus) return false;
    if (selectedConnection !== 'all' && partner.connectionType !== selectedConnection) return false;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Trading Partners</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage EDI trading partner relationships and configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Export List
          </Button>
          <Link href="/edi/partners/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Trading Partner
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Partners</p>
                <p className="text-2xl font-bold">{partners.length}</p>
              </div>
              <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+2</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Connections</p>
                <p className="text-2xl font-bold">
                  {partners.filter(p => p.status === 'active').length}
                </p>
              </div>
              <SignalIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">
                {(
                  (partners.filter(p => p.status === 'active').length / partners.length) *
                  100
                ).toFixed(0)}
                % of total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Success Rate</p>
                <p className="text-2xl font-bold">
                  {(partners.reduce((sum, p) => sum + p.successRate, 0) / partners.length).toFixed(
                    1
                  )}
                  %
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+1.2%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Volume</p>
                <p className="text-2xl font-bold">
                  {partners.reduce((sum, p) => sum + p.monthlyVolume, 0).toLocaleString()}
                </p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+15.3%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search partners..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Partner Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="carrier">Carrier</SelectItem>
                <SelectItem value="broker">Broker</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedConnection} onValueChange={setSelectedConnection}>
              <SelectTrigger>
                <SelectValue placeholder="Connection Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Connections</SelectItem>
                <SelectItem value="as2">AS2</SelectItem>
                <SelectItem value="van">VAN</SelectItem>
                <SelectItem value="sftp">SFTP</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedStatus('all');
                setSelectedConnection('all');
              }}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trading Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(partner => (
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

                <div>
                  <div className="text-sm text-gray-500 mb-2">Contact Information</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3" />
                      <span>{partner.contactInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-3 w-3" />
                      <span>{partner.contactInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-3 w-3" />
                      <span>{partner.contactInfo.phone}</span>
                    </div>
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

      {filteredPartners.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Trading Partners Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No trading partners match your current filters.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSelectedConnection('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
