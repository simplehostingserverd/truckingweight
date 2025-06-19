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
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  FolderIcon,
  PrinterIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import PDFViewer from '@/components/PDFViewer/PDFViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import Link from 'next/link'; // Unused // Unused

interface ComplianceDocument {
  id: number;
  title: string;
  type: 'hos_log' | 'dvir_report' | 'safety_certificate' | 'training_record' | 'audit_report';
  driverName?: string;
  vehicleNumber?: string;
  companyName: string;
  dateCreated: string;
  dateExpires?: string;
  status: 'active' | 'expired' | 'pending' | 'archived';
  fileSize: string;
  pages: number;
  pdfUrl: string;
  description: string;
  tags: string[];
}

export default function ComplianceDocumentsPage() {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ComplianceDocument | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [_activeTab, setActiveTab] = useState('documents');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      // Professional mock compliance documents for investor demonstration
      const mockDocuments: ComplianceDocument[] = [
        {
          id: 1,
          title: 'HOS Log - Michael Rodriguez - FL-2847',
          type: 'hos_log',
          driverName: 'Michael Rodriguez',
          vehicleNumber: 'FL-2847',
          companyName: 'Premier Freight Solutions',
          dateCreated: '2025-01-20',
          status: 'active',
          fileSize: '2.4 MB',
          pages: 3,
          pdfUrl: '/api/documents/hos-log-fl2847-20250120.pdf',
          description: 'DOT-compliant Hours of Service log for interstate freight delivery',
          tags: ['HOS', 'DOT Compliant', 'Interstate', 'Certified'],
        },
        {
          id: 2,
          title: 'DVIR Report - Freightliner FL-2847 Pre-Trip Inspection',
          type: 'dvir_report',
          driverName: 'Michael Rodriguez',
          vehicleNumber: 'FL-2847',
          companyName: 'Premier Freight Solutions',
          dateCreated: '2025-01-20',
          status: 'active',
          fileSize: '1.8 MB',
          pages: 2,
          pdfUrl: '/api/documents/dvir-fl2847-20250120.pdf',
          description:
            'Driver Vehicle Inspection Report - Pre-trip inspection with satisfactory results',
          tags: ['DVIR', 'Pre-Trip', 'Satisfactory', 'Safety'],
        },
        {
          id: 3,
          title: 'Safety Certificate - Advanced Defensive Driving',
          type: 'safety_certificate',
          driverName: 'Michael Rodriguez',
          companyName: 'Premier Freight Solutions',
          dateCreated: '2024-12-15',
          dateExpires: '2025-12-15',
          status: 'active',
          fileSize: '1.2 MB',
          pages: 1,
          pdfUrl: '/api/documents/safety-cert-adc-mrodriguez.pdf',
          description: 'Advanced Defensive Driving Certification - Score: 98/100',
          tags: ['Safety', 'Certification', 'Training', 'Defensive Driving'],
        },
        {
          id: 4,
          title: 'DOT Safety Audit Report - Premier Freight Solutions',
          type: 'audit_report',
          companyName: 'Premier Freight Solutions',
          dateCreated: '2024-12-01',
          status: 'active',
          fileSize: '5.7 MB',
          pages: 12,
          pdfUrl: '/api/documents/dot-audit-premier-freight-2024.pdf',
          description: 'Annual DOT safety audit with satisfactory compliance rating',
          tags: ['DOT', 'Audit', 'Compliance', 'Annual Review'],
        },
        {
          id: 5,
          title: 'Training Record - Jennifer Chen - Hazmat Certification',
          type: 'training_record',
          driverName: 'Jennifer Chen',
          vehicleNumber: 'PB-3947',
          companyName: 'Premier Freight Solutions',
          dateCreated: '2024-11-10',
          dateExpires: '2026-11-10',
          status: 'active',
          fileSize: '2.1 MB',
          pages: 4,
          pdfUrl: '/api/documents/hazmat-cert-jchen.pdf',
          description: 'Hazardous Materials Transportation Certification',
          tags: ['Hazmat', 'Certification', 'Training', 'DOT'],
        },
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading compliance documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'hos_log':
        return <ClockIcon className="h-5 w-5" />;
      case 'dvir_report':
        return <ShieldCheckIcon className="h-5 w-5" />;
      case 'safety_certificate':
      case 'training_record':
        return <UserIcon className="h-5 w-5" />;
      case 'audit_report':
        return <FolderIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleViewDocument = (document: ComplianceDocument) => {
    setSelectedDocument(document);
    setShowPDFViewer(true);
  };

  const filteredDocuments = documents.filter(doc => {
    if (typeFilter !== 'all' && doc.type !== typeFilter) return false;
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showPDFViewer && selectedDocument) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PDFViewer
          pdfUrl={selectedDocument.pdfUrl}
          title={selectedDocument.title}
          onClose={() => setShowPDFViewer(false)}
          height="800px"
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Compliance Documents</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Digital document management for HOS logs, DVIR reports, and safety certificates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Bulk Export
          </Button>
          <Button>
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hos_log">HOS Logs</SelectItem>
                <SelectItem value="dvir_report">DVIR Reports</SelectItem>
                <SelectItem value="safety_certificate">Safety Certificates</SelectItem>
                <SelectItem value="training_record">Training Records</SelectItem>
                <SelectItem value="audit_report">Audit Reports</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map(document => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getDocumentTypeIcon(document.type)}
                  <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(document.status)}>
                  {document.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {document.description}
                </p>

                <div className="space-y-2 text-sm">
                  {document.driverName && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span>{document.driverName}</span>
                    </div>
                  )}
                  {document.vehicleNumber && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">🚛</span>
                      <span>{document.vehicleNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{new Date(document.dateCreated).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {document.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {document.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{document.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    {document.fileSize} • {document.pages} pages
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocument(document)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <PrinterIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Documents Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No compliance documents match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
