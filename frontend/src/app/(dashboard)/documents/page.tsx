'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import {
  DocumentIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  FolderIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadTruckingDocument } from '@/utils/supabase/storage';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
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
  
  const supabase = createClientComponentClient<Database>();

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
    } catch (err: any) {
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
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to load documents');
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
      const fileUrl = await uploadTruckingDocument(
        newDocument.id,
        documentFile,
        documentType
      );

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
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      setError('');

      // Delete document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        throw deleteError;
      }

      // Update state
      setDocuments(documents.filter(doc => doc.id !== documentId));
      setSuccess('Document deleted successfully');
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
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
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your company documents
            </p>
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
