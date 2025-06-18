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
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface PDFViewerProps {
  pdfUrl?: string;
  title?: string;
  onClose?: () => void;
  className?: string;
  height?: string;
  showControls?: boolean;
}

/**
 * Internal PDF Viewer Component
 * Allows users to view PDFs without leaving the application
 * Supports zoom, navigation, download, and print functionality
 */
export default function PDFViewer({
  pdfUrl,
  title = 'Document Viewer',
  onClose,
  className = '',
  height = '600px',
  showControls = true,
}: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pdfUrl) {
      // Simulate loading time for PDF
      const timer = setTimeout(() => {
        setIsLoading(false);
        setTotalPages(3); // Mock total pages - in production this would be determined by the PDF
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pdfUrl]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <XMarkIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Document
            </h3>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {showControls && (
              <>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <MagnifyingGlassMinusIcon className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <MagnifyingGlassPlusIcon className="h-4 w-4" />
                </Button>
                <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2" />
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <PrinterIcon className="h-4 w-4" />
                </Button>
              </>
            )}
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* PDF Viewer Container */}
          <div className="relative bg-gray-100 dark:bg-gray-800 overflow-auto" style={{ height }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : pdfUrl ? (
              <div className="w-full h-full">
                <iframe
                  src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}`}
                  className="w-full h-full border-0"
                  title={title}
                  onLoad={() => setIsLoading(false)}
                  onError={() => setError('Failed to load PDF document')}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No PDF URL provided</p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {showControls && !isLoading && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Use zoom controls to adjust document size
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
