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

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import {
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadSignature } from '@/utils/supabase/storage';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function SignaturesPage() {
  const [signatures, setSignatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [companyId, setCompanyId] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchSignatures();
    fetchUserCompany();

    // Initialize canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
      }
    }
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
    } catch (err: any /* @ts-ignore */ ) {
      console.error('Error fetching user company:', err);
    }
  };

  const fetchSignatures = async () => {
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

      // Get signatures for the company
      const { data, error: signaturesError } = await supabase
        .from('signatures')
        .select('*')
        .eq('company_id', userData.company_id)
        .order('created_at', { ascending: false });

      if (signaturesError) {
        throw signaturesError;
      }

      setSignatures(data || []);
    } catch (err: any /* @ts-ignore */ ) {
      console.error('Error fetching signatures:', err);
      setError(err.message || 'Failed to load signatures');
      // Generate dummy data for testing
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateDummyData = () => {
    const dummySignatures = [
      {
        id: 1,
        name: 'John Smith',
        signature_url: 'https://example.com/signatures/john_smith.png',
        created_at: '2023-05-15T10:30:00Z',
        updated_at: '2023-05-15T10:30:00Z',
        company_id: 1,
      },
      {
        id: 2,
        name: 'Jane Doe',
        signature_url: 'https://example.com/signatures/jane_doe.png',
        created_at: '2023-06-20T14:45:00Z',
        updated_at: '2023-06-20T14:45:00Z',
        company_id: 1,
      },
    ];

    setSignatures(dummySignatures);
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);

    // Get canvas position
    const rect = canvas.getBoundingClientRect();

    // Get mouse/touch position
    let x, y;
    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get canvas position
    const rect = canvas.getBoundingClientRect();

    // Get mouse/touch position
    let x, y;
    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;

      // Prevent scrolling
      e.preventDefault();
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    if (!signatureName) {
      setError('Please enter a name for the signature');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if canvas is empty
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const isCanvasEmpty = !pixelData.some(channel => channel !== 0);

    if (isCanvasEmpty) {
      setError('Please draw a signature');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert signature to image'));
          }
        }, 'image/png');
      });

      // Create a new signature record
      const { data: newSignature, error: createError } = await supabase
        .from('signatures')
        .insert({
          name: signatureName,
          company_id: companyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Upload the signature image to Supabase Storage
      const signatureUrl = await uploadSignature(newSignature.id, blob);

      // Update the signature record with the image URL
      const { error: updateError } = await supabase
        .from('signatures')
        .update({
          signature_url: signatureUrl,
        })
        .eq('id', newSignature.id);

      if (updateError) {
        throw updateError;
      }

      // Add the new signature to the state
      setSignatures([{ ...newSignature, signature_url: signatureUrl }, ...signatures]);

      // Show success message
      setSuccess('Signature saved successfully');

      // Reset form
      setSignatureName('');
      clearCanvas();

      // Refresh signatures list
      fetchSignatures();
    } catch (err: any /* @ts-ignore */ ) {
      console.error('Error saving signature:', err);
      setError(err.message || 'Failed to save signature');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSignature = async (signatureId: number) => {
    try {
      setError('');

      // Delete signature record
      const { error: deleteError } = await supabase
        .from('signatures')
        .delete()
        .eq('id', signatureId);

      if (deleteError) {
        throw deleteError;
      }

      // Update state
      setSignatures(signatures.filter(sig => sig.id !== signatureId));
      setSuccess('Signature deleted successfully');
    } catch (err: any /* @ts-ignore */ ) {
      console.error('Error deleting signature:', err);
      setError(err.message || 'Failed to delete signature');
    }
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Signatures</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your digital signatures</p>
          </div>
          <Button variant="outline" onClick={fetchSignatures} disabled={isLoading}>
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signature Drawing Pad */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signature-name">Signature Name</Label>
                  <Input
                    id="signature-name"
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    placeholder="Enter name (e.g., John Smith)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Draw Signature</Label>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-md bg-white">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={200}
                      className="w-full h-48 touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button variant="outline" onClick={clearCanvas}>
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Clear
                    </Button>
                    <Button onClick={saveSignature} disabled={isLoading}>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Save Signature
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Use your mouse or touch screen to draw your signature.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Signatures */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : signatures.length > 0 ? (
                <div className="space-y-4">
                  {signatures.map(signature => (
                    <div
                      key={signature.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-32 bg-white rounded-md overflow-hidden">
                          <img
                            src={signature.signature_url}
                            alt={`${signature.name}'s signature`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {signature.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Created: {new Date(signature.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSignature(signature.id)}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PencilIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    No signatures found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Create your first signature using the drawing pad.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
