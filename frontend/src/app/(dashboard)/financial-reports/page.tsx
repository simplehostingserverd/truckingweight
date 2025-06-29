/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

interface FinancialReport {
  id: string;
  name: string;
  description: string;
  category: 'revenue' | 'expenses' | 'profitability' | 'cash_flow' | 'tax';
  lastGenerated?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  format: 'pdf' | 'excel' | 'csv';
}

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  operatingRatio: number;
  revenuePerMile: number;
  costPerMile: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export default function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    operatingRatio: 0,
    revenuePerMile: 0,
    costPerMile: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const reports: FinancialReport[] = [
    {
      id: 'profit-loss',
      name: 'Profit & Loss Statement',
      description: 'Comprehensive income statement showing revenue, expenses, and net profit',
      category: 'profitability',
      lastGenerated: '2025-01-17',
      frequency: 'monthly',
      format: 'pdf',
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Track cash inflows and outflows from operations, investing, and financing',
      category: 'cash_flow',
      lastGenerated: '2025-01-15',
      frequency: 'monthly',
      format: 'pdf',
    },
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis',
      description: 'Detailed breakdown of revenue by customer, lane, and service type',
      category: 'revenue',
      lastGenerated: '2025-01-16',
      frequency: 'weekly',
      format: 'excel',
    },
    {
      id: 'expense-report',
      name: 'Expense Report',
      description: 'Comprehensive expense analysis by category and cost center',
      category: 'expenses',
      lastGenerated: '2025-01-17',
      frequency: 'monthly',
      format: 'excel',
    },
    {
      id: 'fuel-analysis',
      name: 'Fuel Cost Analysis',
      description: 'Detailed fuel consumption and cost analysis by vehicle and route',
      category: 'expenses',
      lastGenerated: '2025-01-16',
      frequency: 'weekly',
      format: 'excel',
    },
    {
      id: 'maintenance-costs',
      name: 'Maintenance Cost Report',
      description: 'Maintenance expenses by vehicle, category, and vendor',
      category: 'expenses',
      lastGenerated: '2025-01-15',
      frequency: 'monthly',
      format: 'pdf',
    },
    {
      id: 'customer-profitability',
      name: 'Customer Profitability',
      description: 'Profit analysis by customer with margin calculations',
      category: 'profitability',
      lastGenerated: '2025-01-14',
      frequency: 'monthly',
      format: 'excel',
    },
    {
      id: 'tax-summary',
      name: 'Tax Summary Report',
      description: 'Tax-related transactions and deductions summary',
      category: 'tax',
      lastGenerated: '2025-01-10',
      frequency: 'quarterly',
      format: 'pdf',
    },
  ];

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod, selectedYear]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockMetrics: FinancialMetrics = {
        totalRevenue: 1850000,
        totalExpenses: 1425000,
        grossProfit: 425000,
        netProfit: 285000,
        profitMargin: 15.4,
        operatingRatio: 77.0,
        revenuePerMile: 2.85,
        costPerMile: 2.19,
      };

      const mockMonthlyData: MonthlyData[] = [
        { month: 'Jan', revenue: 145000, expenses: 112000, profit: 33000 },
        { month: 'Feb', revenue: 152000, expenses: 118000, profit: 34000 },
        { month: 'Mar', revenue: 148000, expenses: 115000, profit: 33000 },
        { month: 'Apr', revenue: 156000, expenses: 121000, profit: 35000 },
        { month: 'May', revenue: 162000, expenses: 125000, profit: 37000 },
        { month: 'Jun', revenue: 158000, expenses: 122000, profit: 36000 },
        { month: 'Jul', revenue: 165000, expenses: 127000, profit: 38000 },
        { month: 'Aug', revenue: 159000, expenses: 123000, profit: 36000 },
        { month: 'Sep', revenue: 154000, expenses: 119000, profit: 35000 },
        { month: 'Oct', revenue: 161000, expenses: 124000, profit: 37000 },
        { month: 'Nov', revenue: 157000, expenses: 121000, profit: 36000 },
        { month: 'Dec', revenue: 163000, expenses: 126000, profit: 37000 },
      ];

      setMetrics(mockMetrics);
      setMonthlyData(mockMonthlyData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'expenses':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'profitability':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cash_flow':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'tax':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'weekly':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'monthly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'quarterly':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'yearly':
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Financial Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Generate and analyze financial reports and metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">
                  ${metrics.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600">
                  ${metrics.netProfit.toLocaleString()}
                </h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Profit Margin
                </p>
                <h3 className="text-2xl font-bold mt-1">{metrics.profitMargin}%</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue/Mile</p>
                <h3 className="text-2xl font-bold mt-1">${metrics.revenuePerMile.toFixed(2)}</h3>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full flex-shrink-0">
                <TruckIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.slice(-6).map((data, index) => (
                  <div
                    key={data.month}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-medium">{data.month}</div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">
                          Revenue: ${data.revenue.toLocaleString()}
                        </span>
                        <span className="text-red-600">
                          Expenses: ${data.expenses.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        ${data.profit.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {((data.profit / data.revenue) * 100).toFixed(1)}% margin
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Ratios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Operating Ratios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Operating Ratio</span>
                    <span className="font-medium">{metrics.operatingRatio}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className="font-medium text-green-600">{metrics.profitMargin}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Revenue per Mile</span>
                    <span className="font-medium">${metrics.revenuePerMile.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost per Mile</span>
                    <span className="font-medium">${metrics.costPerMile.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gross Profit</span>
                    <span className="font-medium text-green-600">
                      ${metrics.grossProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Net Profit</span>
                    <span className="font-medium text-blue-600">
                      ${metrics.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Expenses</span>
                    <span className="font-medium text-red-600">
                      ${metrics.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expense Ratio</span>
                    <span className="font-medium">
                      {((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                    </div>
                    <DocumentTextIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(report.category)}>
                        {report.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getFrequencyColor(report.frequency)}>
                        {report.frequency}
                      </Badge>
                    </div>

                    {report.lastGenerated && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        Last: {new Date(report.lastGenerated).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <PrinterIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Advanced Analytics
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Interactive charts and detailed financial analysis tools
                </p>
                <div className="flex gap-2 justify-center">
                  <Button>
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Revenue Trends
                  </Button>
                  <Button variant="outline">
                    <TruckIcon className="h-5 w-5 mr-2" />
                    Cost Analysis
                  </Button>
                  <Button variant="outline">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Profitability
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
