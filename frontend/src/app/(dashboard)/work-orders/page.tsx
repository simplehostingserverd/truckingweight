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
  WrenchScrewdriverIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
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

interface WorkOrder {
  id: number;
  workOrderNumber: string;
  vehicleId: string;
  vehicleName: string;
  workType: 'preventive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCost: number;
  actualCost?: number;
  laborHours?: number;
  createdAt: string;
  vendor?: string;
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');

  useEffect(() => {
    loadWorkOrders();
  }, []);

  useEffect(() => {
    filterWorkOrders();
  }, [workOrders, searchTerm, statusFilter, priorityFilter, workTypeFilter]);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);

      // Mock data - will be replaced with API calls
      const mockWorkOrders: WorkOrder[] = [
        {
          id: 1,
          workOrderNumber: 'WO-2025-001',
          vehicleId: 'VH001',
          vehicleName: 'Freightliner Cascadia #001',
          workType: 'corrective',
          priority: 'high',
          description: 'Replace worn brake pads and rotors',
          status: 'in_progress',
          assignedTo: 'Mike Johnson',
          scheduledDate: '2025-01-18',
          startedAt: '2025-01-18',
          estimatedCost: 850.0,
          laborHours: 4,
          createdAt: '2025-01-15',
          vendor: 'Brake Masters',
        },
        {
          id: 2,
          workOrderNumber: 'WO-2025-002',
          vehicleId: 'VH002',
          vehicleName: 'Peterbilt 579 #002',
          workType: 'preventive',
          priority: 'medium',
          description: 'Scheduled oil change and filter replacement',
          status: 'open',
          assignedTo: 'Sarah Wilson',
          scheduledDate: '2025-01-20',
          estimatedCost: 275.0,
          createdAt: '2025-01-16',
          vendor: 'Quick Lube Pro',
        },
        {
          id: 3,
          workOrderNumber: 'WO-2025-003',
          vehicleId: 'VH003',
          vehicleName: 'Kenworth T680 #003',
          workType: 'emergency',
          priority: 'critical',
          description: 'Engine overheating - coolant system repair',
          status: 'in_progress',
          assignedTo: 'Tom Rodriguez',
          scheduledDate: '2025-01-17',
          startedAt: '2025-01-17',
          estimatedCost: 1250.0,
          laborHours: 8,
          createdAt: '2025-01-17',
          vendor: 'Engine Repair Specialists',
        },
        {
          id: 4,
          workOrderNumber: 'WO-2025-004',
          vehicleId: 'VH004',
          vehicleName: 'Volvo VNL #004',
          workType: 'preventive',
          priority: 'low',
          description: 'Annual DOT inspection',
          status: 'completed',
          assignedTo: 'Mike Johnson',
          scheduledDate: '2025-01-10',
          startedAt: '2025-01-10',
          completedAt: '2025-01-10',
          estimatedCost: 350.0,
          actualCost: 325.0,
          laborHours: 2,
          createdAt: '2025-01-08',
          vendor: 'DOT Inspection Center',
        },
        {
          id: 5,
          workOrderNumber: 'WO-2025-005',
          vehicleId: 'VH005',
          vehicleName: 'Mack Anthem #005',
          workType: 'corrective',
          priority: 'medium',
          description: 'Replace faulty alternator',
          status: 'open',
          assignedTo: 'Sarah Wilson',
          scheduledDate: '2025-01-22',
          estimatedCost: 650.0,
          createdAt: '2025-01-16',
          vendor: 'Electrical Repair Shop',
        },
      ];

      setWorkOrders(mockWorkOrders);
    } catch (error) {
      console.error('Error loading work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkOrders = () => {
    let filtered = workOrders;

    if (searchTerm) {
      filtered = filtered.filter(
        wo =>
          wo.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wo.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wo.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(wo => wo.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(wo => wo.priority === priorityFilter);
    }

    if (workTypeFilter !== 'all') {
      filtered = filtered.filter(wo => wo.workType === workTypeFilter);
    }

    setFilteredWorkOrders(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'open':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
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

  const getWorkTypeBadge = (workType: string) => {
    switch (workType) {
      case 'preventive':
        return <Badge className="bg-green-100 text-green-800">Preventive</Badge>;
      case 'corrective':
        return <Badge className="bg-yellow-100 text-yellow-800">Corrective</Badge>;
      case 'emergency':
        return <Badge className="bg-red-100 text-red-800">Emergency</Badge>;
      default:
        return <Badge>{workType}</Badge>;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Work Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage maintenance work orders and track progress
          </p>
        </div>
        <Link href="/work-orders/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            New Work Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search work orders..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Work Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setWorkTypeFilter('all');
              }}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
            Work Orders ({filteredWorkOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkOrders.map(workOrder => (
                  <TableRow key={workOrder.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workOrder.workOrderNumber}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {workOrder.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{workOrder.vehicleName}</div>
                    </TableCell>
                    <TableCell>{getWorkTypeBadge(workOrder.workType)}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(workOrder.priority)}>
                        {workOrder.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(workOrder.status)}
                        <Badge className={getStatusColor(workOrder.status)}>
                          {workOrder.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{workOrder.assignedTo}</div>
                      {workOrder.vendor && (
                        <div className="text-sm text-gray-500">{workOrder.vendor}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(workOrder.scheduledDate).toLocaleDateString()}
                      </div>
                      {workOrder.startedAt && (
                        <div className="text-xs text-gray-500">
                          Started: {new Date(workOrder.startedAt).toLocaleDateString()}
                        </div>
                      )}
                      {workOrder.completedAt && (
                        <div className="text-xs text-green-600">
                          Completed: {new Date(workOrder.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          Est: ${workOrder.estimatedCost.toLocaleString()}
                        </div>
                        {workOrder.actualCost && (
                          <div className="text-green-600">
                            Act: ${workOrder.actualCost.toLocaleString()}
                          </div>
                        )}
                        {workOrder.laborHours && (
                          <div className="text-xs text-gray-500">{workOrder.laborHours}h labor</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/work-orders/${workOrder.id}`}>
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/work-orders/${workOrder.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredWorkOrders.length === 0 && (
            <div className="text-center py-8">
              <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No work orders found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ||
                statusFilter !== 'all' ||
                priorityFilter !== 'all' ||
                workTypeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first work order.'}
              </p>
              {!searchTerm &&
                statusFilter === 'all' &&
                priorityFilter === 'all' &&
                workTypeFilter === 'all' && (
                  <Link href="/work-orders/new">
                    <Button className="mt-4">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Work Order
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
