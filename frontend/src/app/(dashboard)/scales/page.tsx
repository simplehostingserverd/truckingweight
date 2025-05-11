'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Database } from '@/types/supabase';

export default function ScalesPage() {
  const [scales, setScales] = useState<any[]>([]);
  const [filteredScales, setFilteredScales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [view, setView] = useState('table');
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchScales();
  }, []);

  useEffect(() => {
    filterScales();
  }, [scales, searchTerm, statusFilter, typeFilter]);

  const fetchScales = async () => {
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

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id, is_admin')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        throw userError;
      }

      let query = supabase
        .from('scales')
        .select(`
          *,
          companies(
            id,
            name
          )
        `);

      // If not admin, filter by company
      if (!userData.is_admin) {
        query = query.eq('company_id', userData.company_id);
      }

      const { data, error: scalesError } = await query.order('name');

      if (scalesError) {
        throw scalesError;
      }

      setScales(data || []);
      setFilteredScales(data || []);
    } catch (err: any) {
      console.error('Error fetching scales:', err);
      setError(err.message || 'Failed to load scales');
    } finally {
      setIsLoading(false);
    }
  };

  const filterScales = () => {
    let filtered = [...scales];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        scale =>
          scale.name.toLowerCase().includes(term) ||
          scale.location?.toLowerCase().includes(term) ||
          scale.manufacturer?.toLowerCase().includes(term) ||
          scale.model?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(scale => scale.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(scale => scale.scale_type === typeFilter);
    }

    setFilteredScales(filtered);
  };

  // Get unique scale types for filter
  const scaleTypes = ['all', ...new Set(scales.map(scale => scale.scale_type))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Scales</h1>
        <Link href="/scales/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Scale
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search scales..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {scaleTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchScales}>
            <ArrowPathIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Tabs value={view} onValueChange={setView} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredScales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No scales found</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Calibration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScales.map(scale => (
                    <TableRow key={scale.id}>
                      <TableCell className="font-medium">{scale.name}</TableCell>
                      <TableCell>{scale.scale_type}</TableCell>
                      <TableCell>{scale.location || 'N/A'}</TableCell>
                      <TableCell>{scale.manufacturer || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            scale.status === 'Active'
                              ? 'success'
                              : scale.status === 'Maintenance'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {scale.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {scale.calibration_date
                          ? new Date(scale.calibration_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Link href={`/scales/${scale.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="grid">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredScales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No scales found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScales.map(scale => (
                <Link key={scale.id} href={`/scales/${scale.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{scale.name}</CardTitle>
                        <Badge
                          variant={
                            scale.status === 'Active'
                              ? 'success'
                              : scale.status === 'Maintenance'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {scale.status}
                        </Badge>
                      </div>
                      <CardDescription>{scale.scale_type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                          <span className="text-sm">{scale.location || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Manufacturer:</span>
                          <span className="text-sm">{scale.manufacturer || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Model:</span>
                          <span className="text-sm">{scale.model || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Last Calibration:</span>
                          <span className="text-sm">
                            {scale.calibration_date
                              ? new Date(scale.calibration_date).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
