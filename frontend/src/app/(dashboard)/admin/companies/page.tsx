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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import type { Database } from '@/types/supabase';

type Company = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  created_at: string;
  status: 'active' | 'inactive' | 'pending';
  _count?: {
    users: number;
    vehicles: number;
    drivers: number;
  };
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false);
  const [showEditCompanyDialog, setShowEditCompanyDialog] = useState(false);
  const [showDeleteCompanyDialog, setShowDeleteCompanyDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
    status: 'active' as const,
  });
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        throw userError;
      }

      if (!userData.is_admin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Get all companies
      const { data, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (companiesError) {
        throw companiesError;
      }

      // Get counts for each company
      const companiesWithCounts = await Promise.all(
        (data || []).map(async company => {
          // Get user count
          const { count: userCount, error: userCountError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);

          // Get vehicle count
          const { count: vehicleCount, error: vehicleCountError } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);

          // Get driver count
          const { count: driverCount, error: driverCountError } = await supabase
            .from('drivers')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);

          return {
            ...company,
            _count: {
              users: userCount || 0,
              vehicles: vehicleCount || 0,
              drivers: driverCount || 0,
            },
          };
        })
      );

      setCompanies(companiesWithCounts);
      setFilteredCompanies(companiesWithCounts);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(err.message || 'Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        company =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    setFilteredCompanies(filtered);
  };

  const handleCreateCompany = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validate form
      if (!newCompany.name) {
        setError('Company name is required');
        setIsLoading(false);
        return;
      }

      // Create company
      const { data, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: newCompany.name,
          address: newCompany.address,
          city: newCompany.city,
          state: newCompany.state,
          zip: newCompany.zip,
          phone: newCompany.phone,
          email: newCompany.email,
          website: newCompany.website,
          status: newCompany.status,
        })
        .select();

      if (companyError) {
        throw companyError;
      }

      // Reset form and close dialog
      setNewCompany({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
        website: '',
        status: 'active',
      });
      setShowNewCompanyDialog(false);

      // Refresh companies list
      fetchCompanies();
    } catch (err: any) {
      console.error('Error creating company:', err);
      setError(err.message || 'Failed to create company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompany = async () => {
    try {
      if (!selectedCompany) return;

      setIsLoading(true);
      setError('');

      // Update company
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          name: selectedCompany.name,
          address: selectedCompany.address,
          city: selectedCompany.city,
          state: selectedCompany.state,
          zip: selectedCompany.zip,
          phone: selectedCompany.phone,
          email: selectedCompany.email,
          website: selectedCompany.website,
          status: selectedCompany.status,
        })
        .eq('id', selectedCompany.id);

      if (companyError) {
        throw companyError;
      }

      // Reset and close dialog
      setSelectedCompany(null);
      setShowEditCompanyDialog(false);

      // Refresh companies list
      fetchCompanies();
    } catch (err: any) {
      console.error('Error updating company:', err);
      setError(err.message || 'Failed to update company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = async () => {
    try {
      if (!selectedCompany) return;

      setIsLoading(true);
      setError('');

      // Check if company has users, vehicles, or drivers
      if (
        selectedCompany._count &&
        (selectedCompany._count.users > 0 ||
          selectedCompany._count.vehicles > 0 ||
          selectedCompany._count.drivers > 0)
      ) {
        throw new Error(
          'Cannot delete company with associated users, vehicles, or drivers. Remove these associations first.'
        );
      }

      // Delete company
      const { error: companyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', selectedCompany.id);

      if (companyError) {
        throw companyError;
      }

      // Reset and close dialog
      setSelectedCompany(null);
      setShowDeleteCompanyDialog(false);

      // Refresh companies list
      fetchCompanies();
    } catch (err: any) {
      console.error('Error deleting company:', err);
      setError(err.message || 'Failed to delete company');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Companies</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage companies and their settings
          </p>
        </div>
        <Button onClick={() => setShowNewCompanyDialog(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Company
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company Management</CardTitle>
          <CardDescription>View and manage all companies in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search companies..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <Button variant="outline" onClick={fetchCompanies} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>Drivers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      <div className="flex justify-center">
                        <svg
                          className="animate-spin h-6 w-6 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map(company => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        {company.city && company.state
                          ? `${company.city}, ${company.state}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell>{company._count?.users || 0}</TableCell>
                      <TableCell>{company._count?.vehicles || 0}</TableCell>
                      <TableCell>{company._count?.drivers || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowEditCompanyDialog(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowDeleteCompanyDialog(true);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New Company Dialog */}
      <Dialog open={showNewCompanyDialog} onOpenChange={setShowNewCompanyDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>Add a new company to the system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">Company Name*</label>
              <Input
                value={newCompany.name}
                onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                placeholder="Acme Trucking"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                value={newCompany.address}
                onChange={e => setNewCompany({ ...newCompany, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={newCompany.city}
                  onChange={e => setNewCompany({ ...newCompany, city: e.target.value })}
                  placeholder="Austin"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  value={newCompany.state}
                  onChange={e => setNewCompany({ ...newCompany, state: e.target.value })}
                  placeholder="TX"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">ZIP</label>
                <Input
                  value={newCompany.zip}
                  onChange={e => setNewCompany({ ...newCompany, zip: e.target.value })}
                  placeholder="78701"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={newCompany.phone}
                  onChange={e => setNewCompany({ ...newCompany, phone: e.target.value })}
                  placeholder="(512) 555-1234"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newCompany.email}
                  onChange={e => setNewCompany({ ...newCompany, email: e.target.value })}
                  placeholder="info@acmetrucking.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                value={newCompany.website}
                onChange={e => setNewCompany({ ...newCompany, website: e.target.value })}
                placeholder="https://www.acmetrucking.com"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={newCompany.status}
                onChange={e =>
                  setNewCompany({
                    ...newCompany,
                    status: e.target.value as 'active' | 'inactive' | 'pending',
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCompanyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCompany} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={showEditCompanyDialog} onOpenChange={setShowEditCompanyDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company information.</DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">Company Name*</label>
                <Input
                  value={selectedCompany.name}
                  onChange={e => setSelectedCompany({ ...selectedCompany, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={selectedCompany.address}
                  onChange={e =>
                    setSelectedCompany({ ...selectedCompany, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={selectedCompany.city}
                    onChange={e => setSelectedCompany({ ...selectedCompany, city: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={selectedCompany.state}
                    onChange={e =>
                      setSelectedCompany({ ...selectedCompany, state: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm font-medium">ZIP</label>
                  <Input
                    value={selectedCompany.zip}
                    onChange={e => setSelectedCompany({ ...selectedCompany, zip: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={selectedCompany.phone}
                    onChange={e =>
                      setSelectedCompany({ ...selectedCompany, phone: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={selectedCompany.email}
                    onChange={e =>
                      setSelectedCompany({ ...selectedCompany, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={selectedCompany.website}
                  onChange={e =>
                    setSelectedCompany({ ...selectedCompany, website: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={selectedCompany.status}
                  onChange={e =>
                    setSelectedCompany({
                      ...selectedCompany,
                      status: e.target.value as 'active' | 'inactive' | 'pending',
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCompanyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCompany} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Company Dialog */}
      <Dialog open={showDeleteCompanyDialog} onOpenChange={setShowDeleteCompanyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="py-4">
              <p className="mb-2">
                <span className="font-medium">Name:</span> {selectedCompany.name}
              </p>
              <p className="mb-2">
                <span className="font-medium">Location:</span>{' '}
                {selectedCompany.city && selectedCompany.state
                  ? `${selectedCompany.city}, ${selectedCompany.state}`
                  : 'N/A'}
              </p>
              {selectedCompany._count && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                    Warning: This company has associated data
                  </p>
                  <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-400">
                    <li>Users: {selectedCompany._count.users}</li>
                    <li>Vehicles: {selectedCompany._count.vehicles}</li>
                    <li>Drivers: {selectedCompany._count.drivers}</li>
                  </ul>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    You must remove all associated data before deleting this company.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteCompanyDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCompany}
              disabled={
                isLoading ||
                (selectedCompany?._count &&
                  (selectedCompany._count.users > 0 ||
                    selectedCompany._count.vehicles > 0 ||
                    selectedCompany._count.drivers > 0))
              }
            >
              {isLoading ? 'Deleting...' : 'Delete Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
