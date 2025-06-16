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
import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserIcon,
  UserPlusIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Create a client-side only component to avoid hydration issues
const CityUsersPageClient = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [userRole, setUserRole] = useState('admin');

  // Check if user has admin role
  useEffect(() => {
    // Safely access localStorage only on the client side
    if (typeof window === 'undefined') return;

    const cityUser = localStorage.getItem('cityUser');
    if (!cityUser) {
      router.push('/city/login');
      return;
    }

    try {
      const userData = JSON.parse(cityUser);
      if (userData.role !== 'admin') {
        router.push('/city/dashboard');
        return;
      }
      setUserRole(userData.role);
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/city/login');
    }
  }, [router]);

  // Fetch users data
  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Safely access localStorage only on the client side
      if (typeof window === 'undefined') return;

      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Fetch users
      const response = await fetch('/api/city-users', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
      // Generate dummy data for testing
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate dummy data for testing
  const generateDummyData = () => {
    const dummyUsers = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.gov',
        role: 'admin',
        status: 'active',
        lastLogin: '2023-11-20T09:30:00Z',
        createdAt: '2023-01-15T00:00:00Z',
      },
      {
        id: 2,
        name: 'John Operator',
        email: 'john.operator@example.gov',
        role: 'operator',
        status: 'active',
        lastLogin: '2023-11-19T14:45:00Z',
        createdAt: '2023-02-10T00:00:00Z',
      },
      {
        id: 3,
        name: 'Sarah Inspector',
        email: 'sarah.inspector@example.gov',
        role: 'inspector',
        status: 'active',
        lastLogin: '2023-11-18T11:20:00Z',
        createdAt: '2023-03-05T00:00:00Z',
      },
      {
        id: 4,
        name: 'Mike Viewer',
        email: 'mike.viewer@example.gov',
        role: 'viewer',
        status: 'active',
        lastLogin: '2023-11-15T16:10:00Z',
        createdAt: '2023-04-20T00:00:00Z',
      },
      {
        id: 5,
        name: 'Jane Doe',
        email: 'jane.doe@example.gov',
        role: 'operator',
        status: 'inactive',
        lastLogin: '2023-10-05T10:30:00Z',
        createdAt: '2023-05-12T00:00:00Z',
      },
    ];
    setUsers(dummyUsers);
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get counts for tabs
  const adminCount = users.filter(user => user.role === 'admin').length;
  const operatorCount = users.filter(user => user.role === 'operator').length;
  const inspectorCount = users.filter(user => user.role === 'inspector').length;
  const viewerCount = users.filter(user => user.role === 'viewer').length;

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // Handle role selection
  const handleRoleChange = value => {
    setNewUser({ ...newUser, role: value });
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!newUser.name || !newUser.email || !newUser.password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    // In a real implementation, we would submit to the API
    // For now, we'll just add to the local state
    const newUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const createdUser = {
      id: newUserId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };

    setUsers([...users, createdUser]);
    setShowAddUserDialog(false);
    setNewUser({
      name: '',
      email: '',
      role: 'viewer',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400">Manage city dashboard users and permissions</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddUserDialog(true)}>
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="search" className="text-gray-400">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="role-filter" className="text-gray-400">
              Role
            </Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger id="role-filter" className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="inspector">Inspector</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status-filter" className="text-gray-400">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
            <TabsTrigger value="all">All ({users.length})</TabsTrigger>
            <TabsTrigger value="admin">Admin ({adminCount})</TabsTrigger>
            <TabsTrigger value="operator">Operator ({operatorCount})</TabsTrigger>
            <TabsTrigger value="inspector">Inspector ({inspectorCount})</TabsTrigger>
            <TabsTrigger value="viewer">Viewer ({viewerCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <UsersTable users={filteredUsers} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <UsersTable users={users.filter(user => user.role === 'admin')} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="operator" className="space-y-6">
            <UsersTable
              users={users.filter(user => user.role === 'operator')}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="inspector" className="space-y-6">
            <UsersTable
              users={users.filter(user => user.role === 'inspector')}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="viewer" className="space-y-6">
            <UsersTable
              users={users.filter(user => user.role === 'viewer')}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Add User Dialog */}
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new user account for the city dashboard.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-300">
                  Role
                </Label>
                <Select value={newUser.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role" className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="inspector">Inspector</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setShowAddUserDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

// Users table component
const UsersTable = ({ users, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full bg-gray-700" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No users found matching the current filters.</p>
      </div>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800">
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Email</TableHead>
              <TableHead className="text-gray-400">Role</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Last Login</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700">
                <TableCell className="font-medium text-white">{user.name}</TableCell>
                <TableCell className="text-gray-300">{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-gray-300">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString() +
                      ' ' +
                      new Date(user.lastLogin).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      <LockClosedIcon className="h-4 w-4" />
                      <span className="sr-only">Reset Password</span>
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-400">
                      <TrashIcon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Role badge component
const RoleBadge = ({ role }) => {
  switch (role) {
    case 'admin':
      return (
        <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/20 border-purple-500/30">
          <ShieldCheckIcon className="h-3.5 w-3.5 mr-1" />
          Admin
        </Badge>
      );
    case 'operator':
      return (
        <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20 border-blue-500/30">
          <UserIcon className="h-3.5 w-3.5 mr-1" />
          Operator
        </Badge>
      );
    case 'inspector':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30">
          <UserIcon className="h-3.5 w-3.5 mr-1" />
          Inspector
        </Badge>
      );
    case 'viewer':
      return (
        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30">
          <UserIcon className="h-3.5 w-3.5 mr-1" />
          Viewer
        </Badge>
      );
    default:
      return <Badge>{role}</Badge>;
  }
};

// Status badge component
const StatusBadge = ({ status }) => {
  return status === 'active' ? (
    <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30">
      Active
    </Badge>
  ) : (
    <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/20 border-gray-500/30">
      Inactive
    </Badge>
  );
};

// Use dynamic import with SSR disabled to avoid hydration issues
const CityUsersPage = dynamic(() => Promise.resolve(CityUsersPageClient), {
  ssr: false,
});

export default function Page() {
  return <CityUsersPage />;
}
