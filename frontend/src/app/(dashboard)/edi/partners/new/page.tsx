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

import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  MapPinIcon,
  CogIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  WifiIcon,
  ServerIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Checkbox,
} from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TradingPartnerForm {
  name: string;
  type: 'customer' | 'carrier' | 'broker' | 'vendor' | '';
  ediId: string;
  qualifierId: string;
  testMode: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  technicalContactName: string;
  technicalContactEmail: string;
  technicalContactPhone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  industry: string;
  annualVolume: string;
  primaryCommodities: string[];
  operatingRegions: string[];
  connectionType: 'direct' | 'van' | 'as2' | 'sftp' | '';
  inboundPath: string;
  outboundPath: string;
  acknowledgmentRequired: boolean;
  encryptionRequired: boolean;
  compressionEnabled: boolean;
  supportedTransactions: string[];
  username: string;
  password: string;
  certificatePath: string;
  privateKeyPath: string;
}

const EDI_TRANSACTIONS = [
  { code: 'EDI 204', name: 'Motor Carrier Load Tender' },
  { code: 'EDI 210', name: 'Motor Carrier Freight Details and Invoice' },
  { code: 'EDI 214', name: 'Transportation Carrier Shipment Status Message' },
  { code: 'EDI 990', name: 'Response to a Load Tender' },
  { code: 'EDI 997', name: 'Functional Acknowledgment' },
  { code: 'EDI 856', name: 'Ship Notice/Manifest' },
  { code: 'EDI 850', name: 'Purchase Order' },
  { code: 'EDI 810', name: 'Invoice' },
];

const INDUSTRIES = [
  'Retail',
  'E-commerce',
  'Manufacturing',
  'Automotive',
  'Food & Beverage',
  'Pharmaceuticals',
  'Chemicals',
  'Construction',
  'Agriculture',
  'Technology',
  'Healthcare',
  'Logistics',
  'Transportation',
  'Other',
];

const COMMODITIES = [
  'General Merchandise',
  'Groceries',
  'Electronics',
  'Automotive Parts',
  'Chemicals',
  'Food Products',
  'Pharmaceuticals',
  'Construction Materials',
  'Textiles',
  'Machinery',
  'Consumer Goods',
  'Raw Materials',
  'Hazardous Materials',
  'Temperature Controlled',
  'Oversized/Heavy Haul',
];

const REGIONS = [
  'Local',
  'Regional',
  'National',
  'International',
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Global',
];

export default function NewTradingPartnerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TradingPartnerForm>({
    name: '',
    type: '',
    ediId: '',
    qualifierId: '01',
    testMode: true,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    technicalContactName: '',
    technicalContactEmail: '',
    technicalContactPhone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    industry: '',
    annualVolume: '',
    primaryCommodities: [],
    operatingRegions: [],
    connectionType: '',
    inboundPath: '',
    outboundPath: '',
    acknowledgmentRequired: true,
    encryptionRequired: false,
    compressionEnabled: false,
    supportedTransactions: [],
    username: '',
    password: '',
    certificatePath: '',
    privateKeyPath: '',
  });

  const handleInputChange = (field: keyof TradingPartnerForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleArrayChange = (
    field: 'primaryCommodities' | 'operatingRegions' | 'supportedTransactions',
    value: string,
    checked: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter(item => item !== value),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.type) newErrors.type = 'Partner type is required';
    if (!formData.ediId.trim()) newErrors.ediId = 'EDI ID is required';
    if (!formData.qualifierId.trim()) newErrors.qualifierId = 'Qualifier ID is required';
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
    if (!formData.connectionType) newErrors.connectionType = 'Connection type is required';
    if (formData.supportedTransactions.length === 0) {
      newErrors.supportedTransactions = 'At least one EDI transaction must be selected';
    }

    if (formData.connectionType === 'sftp' || formData.connectionType === 'direct') {
      if (!formData.username.trim())
        newErrors.username = 'Username is required for this connection type';
      if (!formData.password.trim())
        newErrors.password = 'Password is required for this connection type';
    }

    if (formData.connectionType === 'as2') {
      if (!formData.certificatePath.trim())
        newErrors.certificatePath = 'Certificate path is required for AS2';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (errors.name || errors.type || errors.ediId) {
        setActiveTab('basic');
      } else if (errors.contactName || errors.contactEmail) {
        setActiveTab('contact');
      } else if (errors.connectionType || errors.supportedTransactions) {
        setActiveTab('technical');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting trading partner:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/edi/partners');
    } catch (error) {
      console.error('Error creating trading partner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/edi/partners">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Trading Partners
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add Trading Partner</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Set up a new EDI trading partner connection
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      placeholder="Enter company name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="type">Partner Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={value => handleInputChange('type', value)}
                    >
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select partner type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="carrier">Carrier</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
                  </div>

                  <div>
                    <Label htmlFor="ediId">EDI ID *</Label>
                    <Input
                      id="ediId"
                      value={formData.ediId}
                      onChange={e => handleInputChange('ediId', e.target.value)}
                      placeholder="e.g., 008466000000"
                      className={errors.ediId ? 'border-red-500' : ''}
                    />
                    {errors.ediId && <p className="text-sm text-red-500 mt-1">{errors.ediId}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="qualifierId">Qualifier ID *</Label>
                    <Select
                      value={formData.qualifierId}
                      onValueChange={value => handleInputChange('qualifierId', value)}
                    >
                      <SelectTrigger className={errors.qualifierId ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">01 - DUNS Number</SelectItem>
                        <SelectItem value="02">02 - SCAC Code</SelectItem>
                        <SelectItem value="12">12 - Phone Number</SelectItem>
                        <SelectItem value="ZZ">ZZ - Mutually Defined</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.qualifierId && (
                      <p className="text-sm text-red-500 mt-1">{errors.qualifierId}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="testMode">Test Mode</Label>
                    <Switch
                      id="testMode"
                      checked={formData.testMode}
                      onCheckedChange={checked => handleInputChange('testMode', checked)}
                    />
                  </div>

                  {formData.testMode && (
                    <Alert>
                      <InformationCircleIcon className="h-4 w-4" />
                      <AlertDescription>
                        Test mode is enabled. Transactions will be processed in a test environment.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={e => handleInputChange('contactName', e.target.value)}
                      placeholder="Enter contact name"
                      className={errors.contactName ? 'border-red-500' : ''}
                    />
                    {errors.contactName && (
                      <p className="text-sm text-red-500 mt-1">{errors.contactName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={e => handleInputChange('contactEmail', e.target.value)}
                      placeholder="contact@company.com"
                      className={errors.contactEmail ? 'border-red-500' : ''}
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-red-500 mt-1">{errors.contactEmail}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={e => handleInputChange('contactPhone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className={errors.contactPhone ? 'border-red-500' : ''}
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-red-500 mt-1">{errors.contactPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={value => handleInputChange('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="connectionType">Connection Type *</Label>
                  <Select
                    value={formData.connectionType}
                    onValueChange={value => handleInputChange('connectionType', value)}
                  >
                    <SelectTrigger className={errors.connectionType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select connection type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Connection</SelectItem>
                      <SelectItem value="van">VAN (Value Added Network)</SelectItem>
                      <SelectItem value="as2">AS2 (Applicability Statement 2)</SelectItem>
                      <SelectItem value="sftp">SFTP (Secure File Transfer Protocol)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.connectionType && (
                    <p className="text-sm text-red-500 mt-1">{errors.connectionType}</p>
                  )}
                </div>

                <div>
                  <Label>Supported EDI Transactions *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {EDI_TRANSACTIONS.map(transaction => (
                      <div
                        key={transaction.code}
                        className="flex items-start space-x-3 p-3 border rounded-lg"
                      >
                        <Checkbox
                          id={`transaction-${transaction.code}`}
                          checked={formData.supportedTransactions.includes(transaction.code)}
                          onCheckedChange={checked =>
                            handleArrayChange(
                              'supportedTransactions',
                              transaction.code,
                              checked as boolean
                            )
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`transaction-${transaction.code}`}
                            className="font-medium"
                          >
                            {transaction.code}
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">{transaction.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.supportedTransactions && (
                    <p className="text-sm text-red-500 mt-2">{errors.supportedTransactions}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <div className="flex gap-2">
          {activeTab !== 'basic' && (
            <Button
              variant="outline"
              onClick={() => {
                const tabs = ['basic', 'contact', 'business', 'technical'];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1]);
                }
              }}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {activeTab !== 'technical' ? (
            <Button
              onClick={() => {
                const tabs = ['basic', 'contact', 'business', 'technical'];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1]);
                }
              }}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Create Partner
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <Alert className="mt-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors before proceeding:
            <ul className="list-disc list-inside mt-2">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
