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

import ErrorBoundary from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { uploadTruckingDocument } from '@/utils/supabase/storage';
import {
  ArrowDownTrayIcon,
  DocumentCheckIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  DocumentTextIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<
    Array<{
      id: number;
      name: string;
      type: string;
      file_url: string;
      created_at: string;
      updated_at: string;
      company_id: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [documentType, setDocumentType] = useState('weight_ticket');
  const [documentName, setDocumentName] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
    fetchUserCompany();
  }, []);

  const fetchUserCompany = async () => {
    try {
      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Authentication error');
      }

      // Get user data with company information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (userError) {
        throw userError;
      }

      setCompanyId(userData?.company_id || null);
    } catch (err: unknown) {
      console.error('Error fetching user company:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get authenticated user's company ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (userError) {
        throw userError;
      }

      // Get documents for the company
      const { data, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', userData.company_id)
        .order('created_at', { ascending: false });

      if (docsError) {
        throw docsError;
      }

      setDocuments(data || []);
    } catch (err: unknown) {
      console.error('Error fetching documents:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to load documents');
      // Generate dummy data for testing
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateDummyData = () => {
    const dummyDocuments = [
      {
        id: 1,
        name: 'Weight Ticket #12345',
        type: 'weight_ticket',
        file_url: 'https://example.com/documents/weight_ticket_12345.pdf',
        created_at: '2023-05-15T10:30:00Z',
        updated_at: '2023-05-15T10:30:00Z',
        company_id: 1,
      },
      {
        id: 2,
        name: 'Permit #98765',
        type: 'permit',
        file_url: 'https://example.com/documents/permit_98765.pdf',
        created_at: '2023-06-20T14:45:00Z',
        updated_at: '2023-06-20T14:45:00Z',
        company_id: 1,
      },
      {
        id: 3,
        name: 'Invoice #54321',
        type: 'invoice',
        file_url: 'https://example.com/documents/invoice_54321.pdf',
        created_at: '2023-07-10T09:15:00Z',
        updated_at: '2023-07-10T09:15:00Z',
        company_id: 1,
      },
    ];

    setDocuments(dummyDocuments);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setDocumentFile(null);
      return;
    }

    const file = e.target.files[0];
    setDocumentFile(file);

    // Auto-fill document name from filename if not already set
    if (!documentName) {
      const fileName = file.name.split('.')[0];
      setDocumentName(fileName);
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile || !documentName || !documentType || !companyId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      // Create a new document record
      const { data: newDocument, error: createError } = await supabase
        .from('documents')
        .insert({
          name: documentName,
          type: documentType,
          company_id: companyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Upload the document file to Supabase Storage
      const fileUrl = await uploadTruckingDocument(newDocument.id, documentFile, documentType);

      // Update the document record with the file URL
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          file_url: fileUrl,
        })
        .eq('id', newDocument.id);

      if (updateError) {
        throw updateError;
      }

      // Add the new document to the state
      setDocuments([{ ...newDocument, file_url: fileUrl }, ...documents]);

      // Show success message
      setSuccess('Document uploaded successfully');

      // Reset form
      setDocumentName('');
      setDocumentFile(null);
      setShowUploadDialog(false);

      // Refresh documents list
      fetchDocuments();
    } catch (err: unknown) {
      console.error('Error uploading document:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteDocument = async (documentId: number) => {
    try {
      setError('');

      // Delete document record
      const { error: deleteError } = await supabase.from('documents').delete().eq('id', documentId);

      if (deleteError) {
        throw deleteError;
      }

      // Update state
      setDocuments(documents.filter(doc => doc.id !== documentId));
      setSuccess('Document deleted successfully');
    } catch (err: unknown) {
      console.error('Error deleting document:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to delete document');
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'weight_ticket':
        return <DocumentCheckIcon className="h-6 w-6 text-blue-500" />;
      case 'permit':
        return <DocumentTextIcon className="h-6 w-6 text-green-500" />;
      case 'invoice':
        return <DocumentDuplicateIcon className="h-6 w-6 text-amber-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'weight_ticket':
        return 'Weight Ticket';
      case 'permit':
        return 'Permit';
      case 'invoice':
        return 'Invoice';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    // Filter by tab
    if (activeTab !== 'all' && doc.type !== activeTab) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Documents</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your company documents</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                  <DialogDescription>
                    Upload a document to your company's document library.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="document-name">Document Name</Label>
                    <Input
                      id="document-name"
                      value={documentName}
                      onChange={e => setDocumentName(e.target.value)}
                      placeholder="Enter document name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document-type">Document Type</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_ticket">Weight Ticket</SelectItem>
                        <SelectItem value="permit">Permit</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document-file">Document File</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="document-file"
                            className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="document-file"
                              name="document-file"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, DOC, DOCX, PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                    {documentFile && (
                      <div className="mt-2 flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                        <span className="text-sm truncate">{documentFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setDocumentFile(null)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadDialog(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUploadDocument} disabled={isUploading || !documentFile}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-800 text-green-300">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="weight_ticket">Weight Tickets</TabsTrigger>
                <TabsTrigger value="permit">Permits</TabsTrigger>
                <TabsTrigger value="invoice">Invoices</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="space-y-4">
                {filteredDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-4">
                      {getDocumentTypeIcon(doc.type)}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {doc.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {getDocumentTypeLabel(doc.type)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderIcon className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  No documents found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? 'No documents match your search criteria'
                    : activeTab !== 'all'
                      ? `You don't have any ${getDocumentTypeLabel(
                          activeTab
                        ).toLowerCase()} documents yet`
                      : "You don't have any documents yet"}
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowUploadDialog(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
