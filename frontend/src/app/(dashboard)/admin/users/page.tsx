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
import { createClient } from '@/utils/supabase/client';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  company_id: string | null;
  is_admin: boolean;
  created_at: string;
  companies?: {
    id: string;
    name: string;
  } | null;
};

type Company = {
  id: string;
  name: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    company_id: '',
    is_admin: false,
  });
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchTerm]);

  const fetchUsers = async () => {
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

      // Use the API endpoint to get users (which handles proper joins and permissions)
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? (err instanceof Error ? err.message : String(err)) : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setCompanies(data || []);
    } catch (err: unknown) {
      console.error('Error fetching companies:', err);
    }
  };

  const handleCreateUser = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validate form
      if (!newUser.name || !newUser.email || !newUser.password) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Get current session for authorization
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }

      // Use backend API to create user (which has proper admin permissions)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          company_id: newUser.company_id || null,
          is_admin: newUser.is_admin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData instanceof Error ? errorData.message : String(errorData)) || 'Failed to create user');
      }

      // Reset form and close dialog
      setNewUser({
        name: '',
        email: '',
        password: '',
        company_id: '',
        is_admin: false,
      });
      setShowNewUserDialog(false);

      // Refresh users list
      fetchUsers();
    } catch (err: unknown) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? (err instanceof Error ? err.message : String(err)) : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async () => {
    try {
      if (!selectedUser) return;

      setIsLoading(true);
      setError('');

      // Get current session for authorization
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }

      // Use backend API to update user
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          name: selectedUser.name,
          company_id: selectedUser.company_id,
          is_admin: selectedUser.is_admin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData instanceof Error ? errorData.message : String(errorData)) || 'Failed to update user');
      }

      // Reset and close dialog
      setSelectedUser(null);
      setShowEditUserDialog(false);

      // Refresh users list
      fetchUsers();
    } catch (err: unknown) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? (err instanceof Error ? err.message : String(err)) : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (!selectedUser) return;

      setIsLoading(true);
      setError('');

      // Get current session for authorization
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }

      // Use backend API to delete user
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData instanceof Error ? errorData.message : String(errorData)) || 'Failed to delete user');
      }

      // Reset and close dialog
      setSelectedUser(null);
      setShowDeleteUserDialog(false);

      // Refresh users list
      fetchUsers();
    } catch (err: unknown) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? (err instanceof Error ? err.message : String(err)) : 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Users</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setShowNewUserDialog(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New User
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
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
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
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.companies?.name || 'None'}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditUserDialog(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteUserDialog(true);
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

      {/* New User Dialog */}
      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. They will receive an email with login instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Select
                value={newUser.company_id || 'none'}
                onValueChange={value =>
                  setNewUser({ ...newUser, company_id: value === 'none' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-admin"
                checked={newUser.is_admin}
                onChange={e => setNewUser({ ...newUser, is_admin: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="is-admin" className="text-sm font-medium">
                Admin User
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={selectedUser.name}
                  onChange={e => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={selectedUser.email} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Select
                  value={selectedUser.company_id || 'none'}
                  onValueChange={value =>
                    setSelectedUser({
                      ...selectedUser,
                      company_id: value === 'none' ? null : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is-admin"
                  checked={selectedUser.is_admin}
                  onChange={e => setSelectedUser({ ...selectedUser, is_admin: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="edit-is-admin" className="text-sm font-medium">
                  Admin User
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p className="mb-2">
                <span className="font-medium">Name:</span> {selectedUser.name}
              </p>
              <p className="mb-2">
                <span className="font-medium">Email:</span> {selectedUser.email}
              </p>
              <p>
                <span className="font-medium">Company:</span>{' '}
                {selectedUser.companies?.name || 'None'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteUserDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
