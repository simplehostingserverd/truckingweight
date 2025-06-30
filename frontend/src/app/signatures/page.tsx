/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, RefreshCw, Edit2, Eye, Plus } from 'lucide-react';
import { signaturesService } from '@/services/signatures-service';
import type { Signature, SignatureFormData } from '@/types/signatures';

interface SignaturePageState {
  signatures: Signature[];
  loading: boolean;
  error: string | null;
  success: string | null;
  isDrawing: boolean;
  signatureName: string;
  saving: boolean;
  deleting: number | null;
}

interface EditDialogState {
  isOpen: boolean;
  signature: Signature | null;
  name: string;
  saving: boolean;
}

interface ViewDialogState {
  isOpen: boolean;
  signature: Signature | null;
}

interface DeleteDialogState {
  isOpen: boolean;
  signature: Signature | null;
  deleting: boolean;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 200;

export default function SignaturesPage() {
  // Main state
  const [state, setState] = useState<SignaturePageState>({
    signatures: [],
    loading: true,
    error: null,
    success: null,
    isDrawing: false,
    signatureName: '',
    saving: false,
    deleting: null,
  });

  // Dialog states
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    signature: null,
    name: '',
    saving: false,
  });

  const [viewDialog, setViewDialog] = useState<ViewDialogState>({
    isOpen: false,
    signature: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    signature: null,
    deleting: false,
  });

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Update state helper
  const updateState = useCallback((updates: Partial<SignaturePageState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (state.error || state.success) {
      const timer = setTimeout(() => {
        updateState({ error: null, success: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, state.success, updateState]);

  // Fetch signatures
  const fetchSignatures = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await signaturesService.getSignatures();
      
      if (response.success && response.data) {
        updateState({
          signatures: response.data,
          loading: false,
        });
      } else {
        updateState({
          error: response.error || 'Failed to fetch signatures',
          loading: false,
        });
      }
    } catch (error) {
      updateState({
        error: 'An unexpected error occurred while fetching signatures',
        loading: false,
      });
    }
  }, [updateState]);

  // Initialize canvas and fetch data
  useEffect(() => {
    fetchSignatures();
    initializeCanvas();
  }, [fetchSignatures]);

  // Canvas initialization
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Configure drawing context
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawingRef.current = true;
    updateState({ isDrawing: true });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    updateState({ isDrawing: false });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Save signature
  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      updateState({ error: 'Canvas not available' });
      return;
    }

    if (!state.signatureName.trim()) {
      updateState({ error: 'Please enter a signature name' });
      return;
    }

    if (signaturesService.isCanvasEmpty(canvas)) {
      updateState({ error: 'Please draw a signature before saving' });
      return;
    }

    updateState({ saving: true, error: null });

    try {
      const signatureBlob = await signaturesService.canvasToBlob(canvas);
      
      const formData: SignatureFormData = {
        name: state.signatureName,
        signatureBlob,
      };

      const response = await signaturesService.createSignature(formData);

      if (response.data) {
        updateState({
          signatures: [response.data, ...state.signatures],
          signatureName: '',
          success: 'Signature saved successfully',
          saving: false,
        });
        clearCanvas();
      } else {
        updateState({
          error: response.error || 'Failed to save signature',
          saving: false,
        });
      }
    } catch (error) {
      updateState({
        error: 'An unexpected error occurred while saving signature',
        saving: false,
      });
    }
  };

  // Edit signature
  const openEditDialog = (signature: Signature) => {
    setEditDialog({
      isOpen: true,
      signature,
      name: signature.name,
      saving: false,
    });
  };

  const saveEdit = async () => {
    if (!editDialog.signature) return;

    if (!editDialog.name.trim()) {
      updateState({ error: 'Please enter a signature name' });
      return;
    }

    setEditDialog(prev => ({ ...prev, saving: true }));

    try {
      const response = await signaturesService.updateSignature(
        editDialog.signature.id,
        { name: editDialog.name.trim() }
      );

      if (response.data) {
        updateState({
          signatures: state.signatures.map(sig =>
            sig.id === editDialog.signature!.id ? response.data! : sig
          ),
          success: 'Signature updated successfully',
        });
        setEditDialog({ isOpen: false, signature: null, name: '', saving: false });
      } else {
        updateState({ error: response.error || 'Failed to update signature' });
        setEditDialog(prev => ({ ...prev, saving: false }));
      }
    } catch (error) {
      updateState({ error: 'An unexpected error occurred while updating signature' });
      setEditDialog(prev => ({ ...prev, saving: false }));
    }
  };

  // View signature
  const openViewDialog = (signature: Signature) => {
    setViewDialog({ isOpen: true, signature });
  };

  // Delete signature
  const openDeleteDialog = (signature: Signature) => {
    setDeleteDialog({ isOpen: true, signature, deleting: false });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.signature) return;

    setDeleteDialog(prev => ({ ...prev, deleting: true }));

    try {
      const response = await signaturesService.deleteSignature(deleteDialog.signature.id);

      if (response.success) {
        updateState({
          signatures: state.signatures.filter(sig => sig.id !== deleteDialog.signature!.id),
          success: 'Signature deleted successfully',
        });
        setDeleteDialog({ isOpen: false, signature: null, deleting: false });
      } else {
        updateState({ error: response.error || 'Failed to delete signature' });
        setDeleteDialog(prev => ({ ...prev, deleting: false }));
      }
    } catch (error) {
      updateState({ error: 'An unexpected error occurred while deleting signature' });
      setDeleteDialog(prev => ({ ...prev, deleting: false }));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signatures</h1>
          <p className="text-muted-foreground">Manage your digital signatures</p>
        </div>
        <Button
          onClick={fetchSignatures}
          disabled={state.loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="signatureName" className="block text-sm font-medium mb-2">
                Signature Name
              </label>
              <Input
                id="signatureName"
                type="text"
                placeholder="Enter signature name (e.g., John Smith)"
                value={state.signatureName}
                onChange={(e) => updateState({ signatureName: e.target.value })}
                disabled={state.saving}
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Draw Signature</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-200 rounded cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ touchAction: 'none' }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use your mouse or touch to draw your signature above
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={clearCanvas}
                variant="outline"
                disabled={state.saving}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={saveSignature}
                disabled={state.saving || !state.signatureName.trim()}
                className="flex-1"
              >
                {state.saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Signature'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Saved Signatures */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-24" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : state.signatures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No signatures found</p>
                <p className="text-sm">Create your first signature using the form on the left</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {state.signatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {signature.signature_url ? (
                        <img
                          src={signature.signature_url}
                          alt={signature.name}
                          className="h-16 w-24 object-contain border rounded bg-white"
                        />
                      ) : (
                        <div className="h-16 w-24 border rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{signature.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {formatDate(signature.created_at)}
                      </p>
                      {signature.updated_at !== signature.created_at && (
                        <p className="text-xs text-muted-foreground">
                          Updated: {formatDate(signature.updated_at)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openViewDialog(signature)}
                        title="View signature"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(signature)}
                        title="Edit signature name"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(signature)}
                        disabled={state.deleting === signature.id}
                        title="Delete signature"
                      >
                        {state.deleting === signature.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setEditDialog({ isOpen: false, signature: null, name: '', saving: false });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Signature</DialogTitle>
            <DialogDescription>
              Update the name for this signature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium mb-2">
                Signature Name
              </label>
              <Input
                id="editName"
                type="text"
                value={editDialog.name}
                onChange={(e) => setEditDialog(prev => ({ ...prev, name: e.target.value }))}
                disabled={editDialog.saving}
                maxLength={255}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ isOpen: false, signature: null, name: '', saving: false })}
              disabled={editDialog.saving}
            >
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              disabled={editDialog.saving || !editDialog.name.trim()}
            >
              {editDialog.saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setViewDialog({ isOpen: false, signature: null });
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewDialog.signature?.name}</DialogTitle>
            <DialogDescription>
              Created: {viewDialog.signature && formatDate(viewDialog.signature.created_at)}
              {viewDialog.signature?.updated_at !== viewDialog.signature?.created_at && (
                <> • Updated: {viewDialog.signature && formatDate(viewDialog.signature.updated_at)}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {viewDialog.signature?.signature_url ? (
              <img
                src={viewDialog.signature.signature_url}
                alt={viewDialog.signature.name}
                className="max-w-full max-h-96 object-contain border rounded bg-white"
              />
            ) : (
              <div className="w-96 h-48 border rounded bg-gray-100 flex items-center justify-center text-gray-500">
                No signature image available
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setViewDialog({ isOpen: false, signature: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteDialog({ isOpen: false, signature: null, deleting: false });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Signature</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the signature "{deleteDialog.signature?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ isOpen: false, signature: null, deleting: false })}
              disabled={deleteDialog.deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteDialog.deleting}
            >
              {deleteDialog.deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Signature'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}