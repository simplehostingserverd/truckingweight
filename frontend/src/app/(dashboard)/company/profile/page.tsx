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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/client';
import { uploadCompanyLogo } from '@/utils/supabase/storage';
import {
  ArrowPathIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PhotoIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter as _useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function CompanyProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    id: 0,
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    logo_url: '',
    status: 'Active',
    created_at: '',
    updated_at: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    logo_url: '',
  });
  const [userRole, setUserRole] = useState('user');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  // Fetch company profile data
  const fetchCompanyProfile = async () => {
    try {
      setIsLoading(true);

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Get user data with company information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, companies(*)')
        .eq('id', user.id)
        .single();

      if (userError) {
        throw userError;
      }

      // Check if user has admin role
      setUserRole(userData?.is_admin ? 'admin' : 'user');

      if (!userData?.company_id) {
        throw new Error('No company associated with this user');
      }

      // Get company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userData.company_id)
        .single();

      if (companyError) {
        throw companyError;
      }

      setCompanyProfile(companyData || {});
      setFormData({
        name: companyData.name || '',
        address: companyData.address || '',
        city: companyData.city || '',
        state: companyData.state || '',
        zip: companyData.zip || '',
        country: companyData.country || 'USA',
        contact_name: companyData.contact_name || '',
        contact_email: companyData.contact_email || '',
        contact_phone: companyData.contact_phone || '',
        website: companyData.website || '',
        logo_url: companyData.logo_url || '',
      });
    } catch (err: unknown) {
      console.error('Error fetching company profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company profile');
      // Generate dummy data for testing
      generateDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate dummy data for testing
  const generateDummyData = () => {
    const dummyProfile = {
      id: 1,
      name: 'Acme Trucking Co.',
      address: '123 Main St',
      city: 'Houston',
      state: 'TX',
      zip: '77002',
      country: 'USA',
      contact_name: 'John Smith',
      contact_email: 'john@acmetrucking.com',
      contact_phone: '(713) 555-1234',
      website: 'https://www.acmetrucking.com',
      logo_url: '',
      status: 'Active',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-11-15T00:00:00Z',
    };

    setCompanyProfile(dummyProfile);
    setFormData({
      name: dummyProfile.name,
      address: dummyProfile.address,
      city: dummyProfile.city,
      state: dummyProfile.state,
      zip: dummyProfile.zip,
      country: dummyProfile.country,
      contact_name: dummyProfile.contact_name,
      contact_email: dummyProfile.contact_email,
      contact_phone: dummyProfile.contact_phone,
      website: dummyProfile.website,
      logo_url: dummyProfile.logo_url,
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo file size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    try {
      setLogoUploading(true);
      setError('');

      // Upload logo to Supabase Storage
      const logoUrl = await uploadCompanyLogo(companyProfile.id, file);

      // Update form data with new logo URL
      setFormData({
        ...formData,
        logo_url: logoUrl,
      });

      // Show success message
      setSuccess('Logo uploaded successfully');
    } catch (err: unknown) {
      console.error('Error uploading logo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Update company profile
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          website: formData.website,
          logo_url: formData.logo_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyProfile.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setCompanyProfile({
        ...companyProfile,
        ...formData,
        updated_at: new Date().toISOString(),
      });

      setSuccess('Company profile updated successfully');
      setIsEditing(false);
    } catch (err: unknown) {
      console.error('Error updating company profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update company profile');
    }
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Company Profile</h1>
            <p className="text-gray-400">Manage your company information</p>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Save Changes</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={fetchCompanyProfile} disabled={isLoading}>
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Profile
                </Button>
              </>
            )}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo and Basic Info */}
          <Card className="bg-gray-800 border-gray-700 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Company Logo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {isLoading ? (
                <Skeleton className="h-40 w-40 rounded-md bg-gray-700" />
              ) : (
                <div className="mb-4 flex flex-col items-center">
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt={`${formData.name} Logo`}
                      className="h-40 w-40 object-contain rounded-md bg-white p-2"
                    />
                  ) : (
                    <div className="h-40 w-40 flex items-center justify-center rounded-md bg-gray-700">
                      <BuildingOfficeIcon className="h-20 w-20 text-gray-500" />
                    </div>
                  )}
                </div>
              )}

              {isEditing && (
                <div className="mt-4 w-full">
                  <Label htmlFor="logo-upload" className="text-gray-300">
                    Upload New Logo
                  </Label>
                  <div className="mt-2">
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      Choose File
                    </Button>
                    {logoUploading && (
                      <div className="mt-2 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                        <span className="text-sm text-gray-400">Uploading...</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Recommended size: 200x200px. Max file size: 2MB.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card className="bg-gray-800 border-gray-700 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full bg-gray-700" />
                  <Skeleton className="h-10 w-full bg-gray-700" />
                  <Skeleton className="h-10 w-full bg-gray-700" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">
                        Company Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-gray-300">
                        Website
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-700 my-4" />
                  <h3 className="text-lg font-medium text-white mb-4">Address</h3>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-300">
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-300">
                        City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-gray-300">
                        State
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip" className="text-gray-300">
                        ZIP Code
                      </Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-300">
                      Country
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <Separator className="bg-gray-700 my-4" />
                  <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name" className="text-gray-300">
                        Contact Name
                      </Label>
                      <Input
                        id="contact_name"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_email" className="text-gray-300">
                        Contact Email
                      </Label>
                      <Input
                        id="contact_email"
                        name="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone" className="text-gray-300">
                        Contact Phone
                      </Label>
                      <Input
                        id="contact_phone"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card className="bg-gray-800 border-gray-700 md:col-span-3">
            <CardHeader>
              <CardTitle className="text-white">Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full bg-gray-700" />
                  <Skeleton className="h-10 w-full bg-gray-700" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Company Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Company Name</p>
                          <p className="text-white">{companyProfile.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Address</p>
                          <p className="text-white">
                            {companyProfile.address}
                            <br />
                            {companyProfile.city}, {companyProfile.state} {companyProfile.zip}
                            <br />
                            {companyProfile.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Website</p>
                          <p className="text-white">
                            {companyProfile.website ? (
                              <a
                                href={companyProfile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                {companyProfile.website}
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <p className="text-white">
                            {companyProfile.contact_phone || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p className="text-white">
                            {companyProfile.contact_email ? (
                              <a
                                href={`mailto:${companyProfile.contact_email}`}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                {companyProfile.contact_email}
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">Contact Person</p>
                          <p className="text-white">
                            {companyProfile.contact_name || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
