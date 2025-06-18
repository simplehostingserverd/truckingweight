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

import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator'; // Unused

// Create a client-side only component to avoid hydration issues
const CityReportsPageClient = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('standard');
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState('last30');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [savedReports, setSavedReports] = useState([]);

  // Standard report types
  const standardReports = [
    {
      id: 'weighing-summary',
      name: 'Weighing Summary',
      description: 'Summary of all weighing activities including compliance statistics',
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    {
      id: 'revenue-report',
      name: 'Revenue Report',
      description: 'Detailed breakdown of revenue from permits and fines',
      icon: <DocumentTextIcon className="h-5 w-5" />,
    },
    {
      id: 'permit-activity',
      name: 'Permit Activity',
      description: 'Analysis of permit issuance, usage, and compliance',
      icon: <DocumentTextIcon className="h-5 w-5" />,
    },
    {
      id: 'violation-report',
      name: 'Violation Report',
      description: 'Detailed report on violations, fines, and resolution status',
      icon: <DocumentTextIcon className="h-5 w-5" />,
    },
    {
      id: 'scale-usage',
      name: 'Scale Usage',
      description: 'Utilization and performance metrics for all city scales',
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
  ];

  // Custom report fields
  const customReportFields = [
    {
      id: 'date-range',
      name: 'Date Range',
      type: 'select',
      options: [
        { value: 'last7', label: 'Last 7 days' },
        { value: 'last30', label: 'Last 30 days' },
        { value: 'last90', label: 'Last 90 days' },
        { value: 'year-to-date', label: 'Year to date' },
        { value: 'custom', label: 'Custom range' },
      ],
    },
    {
      id: 'scale-filter',
      name: 'Scale Filter',
      type: 'select',
      options: [
        { value: 'all', label: 'All Scales' },
        { value: 'active', label: 'Active Scales Only' },
        { value: 'fixed', label: 'Fixed Scales Only' },
        { value: 'portable', label: 'Portable Scales Only' },
      ],
    },
    {
      id: 'compliance-status',
      name: 'Compliance Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'compliant', label: 'Compliant Only' },
        { value: 'non-compliant', label: 'Non-Compliant Only' },
        { value: 'warning', label: 'Warning Only' },
      ],
    },
    {
      id: 'company-filter',
      name: 'Company Filter',
      type: 'input',
      placeholder: 'Enter company name',
    },
  ];

  // Initialize data
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      generateMockReports();
      setIsLoading(false);
    }, 1000);
  }, []);

  // Generate mock reports data
  const generateMockReports = () => {
    const recent = [
      {
        id: 1,
        name: 'Weighing Summary - November 2023',
        type: 'weighing-summary',
        date: '2023-11-20',
        format: 'pdf',
        status: 'completed',
        url: '#',
      },
      {
        id: 2,
        name: 'Revenue Report - Q4 2023',
        type: 'revenue-report',
        date: '2023-11-15',
        format: 'excel',
        status: 'completed',
        url: '#',
      },
      {
        id: 3,
        name: 'Violation Report - October 2023',
        type: 'violation-report',
        date: '2023-11-05',
        format: 'pdf',
        status: 'completed',
        url: '#',
      },
    ];

    const saved = [
      {
        id: 1,
        name: 'Weighing Summary - November 2023',
        type: 'weighing-summary',
        date: '2023-11-20',
        format: 'pdf',
        status: 'completed',
        url: '#',
      },
      {
        id: 2,
        name: 'Revenue Report - Q4 2023',
        type: 'revenue-report',
        date: '2023-11-15',
        format: 'excel',
        status: 'completed',
        url: '#',
      },
      {
        id: 3,
        name: 'Violation Report - October 2023',
        type: 'violation-report',
        date: '2023-11-05',
        format: 'pdf',
        status: 'completed',
        url: '#',
      },
      {
        id: 4,
        name: 'Scale Usage - Q3 2023',
        type: 'scale-usage',
        date: '2023-10-10',
        format: 'pdf',
        status: 'completed',
        url: '#',
      },
      {
        id: 5,
        name: 'Permit Activity - September 2023',
        type: 'permit-activity',
        date: '2023-10-05',
        format: 'excel',
        status: 'completed',
        url: '#',
      },
    ];

    setRecentReports(recent);
    setSavedReports(saved);
  };

  // Handle report generation
  const handleGenerateReport = () => {
    if (!selectedReport) {
      setError('Please select a report type');
      return;
    }

    setError('');
    setGeneratingReport(true);

    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);

      // Add to recent reports
      const reportName =
        standardReports.find(r => r.id === selectedReport)?.name || 'Custom Report';
      const newReport = {
        id: Date.now(),
        name: `${reportName} - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        type: selectedReport,
        date: new Date().toISOString().split('T')[0],
        format: reportFormat,
        status: 'completed',
        url: '#',
      };

      setRecentReports([newReport, ...recentReports]);
      setSavedReports([newReport, ...savedReports]);
    }, 2000);
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports</h1>
            <p className="text-gray-400">Generate and manage city weighing system reports</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Report Generator */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Generate Report</CardTitle>
                <CardDescription className="text-gray-400">
                  Select a report type and customize parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="standard"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="space-y-6"
                >
                  <TabsList className="grid grid-cols-2 w-full max-w-md">
                    <TabsTrigger value="standard">Standard Reports</TabsTrigger>
                    <TabsTrigger value="custom">Custom Report</TabsTrigger>
                  </TabsList>

                  <TabsContent value="standard" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="report-type" className="text-gray-400">
                          Report Type
                        </Label>
                        <Select value={selectedReport} onValueChange={setSelectedReport}>
                          <SelectTrigger
                            id="report-type"
                            className="bg-gray-800 border-gray-700 text-white"
                          >
                            <SelectValue placeholder="Select a report type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            {standardReports.map(report => (
                              <SelectItem key={report.id} value={report.id}>
                                <div className="flex items-center">
                                  {report.icon}
                                  <span className="ml-2">{report.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedReport && (
                          <p className="text-sm text-gray-400 mt-1">
                            {standardReports.find(r => r.id === selectedReport)?.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="date-range" className="text-gray-400">
                          Date Range
                        </Label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger
                            id="date-range"
                            className="bg-gray-800 border-gray-700 text-white"
                          >
                            <SelectValue placeholder="Select date range" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="last7">Last 7 days</SelectItem>
                            <SelectItem value="last30">Last 30 days</SelectItem>
                            <SelectItem value="last90">Last 90 days</SelectItem>
                            <SelectItem value="year-to-date">Year to date</SelectItem>
                            <SelectItem value="custom">Custom range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="report-format" className="text-gray-400">
                          Format
                        </Label>
                        <Select value={reportFormat} onValueChange={setReportFormat}>
                          <SelectTrigger
                            id="report-format"
                            className="bg-gray-800 border-gray-700 text-white"
                          >
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        className="w-full mt-4"
                        onClick={handleGenerateReport}
                        disabled={!selectedReport || generatingReport}
                      >
                        {generatingReport ? (
                          <>
                            <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                            Generate Report
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="custom-report-name" className="text-gray-400">
                          Report Name
                        </Label>
                        <Input
                          id="custom-report-name"
                          placeholder="Enter report name"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      {customReportFields.map(field => (
                        <div key={field.id}>
                          <Label htmlFor={field.id} className="text-gray-400">
                            {field.name}
                          </Label>
                          {field.type === 'select' ? (
                            <Select defaultValue={field.options[0].value}>
                              <SelectTrigger
                                id={field.id}
                                className="bg-gray-800 border-gray-700 text-white"
                              >
                                <SelectValue placeholder={`Select ${field.name}`} />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                {field.options.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={field.id}
                              placeholder={field.placeholder}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          )}
                        </div>
                      ))}

                      <div>
                        <Label htmlFor="custom-report-format" className="text-gray-400">
                          Format
                        </Label>
                        <Select value={reportFormat} onValueChange={setReportFormat}>
                          <SelectTrigger
                            id="custom-report-format"
                            className="bg-gray-800 border-gray-700 text-white"
                          >
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        className="w-full mt-4"
                        onClick={handleGenerateReport}
                        disabled={generatingReport}
                      >
                        {generatingReport ? (
                          <>
                            <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                            Generate Custom Report
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Reports */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full bg-gray-700" />
                    ))}
                  </div>
                ) : recentReports.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No recent reports</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReports.map(report => (
                      <div
                        key={report.id}
                        className="flex items-start p-3 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="bg-gray-700 p-2 rounded-md mr-3">
                          <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{report.name}</h4>
                          <div className="flex items-center mt-1">
                            <CalendarIcon className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-400">
                              {new Date(report.date).toLocaleDateString()}
                            </p>
                            <Badge
                              className="ml-2 bg-gray-700 text-gray-300 hover:bg-gray-700 border-gray-600"
                              variant="outline"
                            >
                              {report.format.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-2">
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-gray-400">No scheduled reports</p>
                  <Button variant="outline" className="mt-2">
                    Schedule a Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Saved Reports */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle>Saved Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-gray-700" />
                ))}
              </div>
            ) : savedReports.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400">No saved reports</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedReports.map(report => (
                  <div
                    key={report.id}
                    className="flex items-start p-3 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="bg-gray-700 p-2 rounded-md mr-3">
                      <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{report.name}</h4>
                      <div className="flex items-center mt-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-400">
                          {new Date(report.date).toLocaleDateString()}
                        </p>
                        <Badge
                          className="ml-2 bg-gray-700 text-gray-300 hover:bg-gray-700 border-gray-600"
                          variant="outline"
                        >
                          {report.format.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

// Use dynamic import with SSR disabled to avoid hydration issues
const CityReportsPage = dynamic(() => Promise.resolve(CityReportsPageClient), {
  ssr: false,
});

export default function Page() {
  return <CityReportsPage />;
}
