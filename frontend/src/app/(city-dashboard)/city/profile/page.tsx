/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved;
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System;
 * Unauthorized copying of this file, via any medium is strictly prohibited;
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission;
 */

'use client';

import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  BuildingOfficeIcon,
  ArrowPathIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PhotoIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { uploadCityLogo } from '@/utils/supabase/storage';

// Create a client-side only component to avoid hydration issues
const CityProfilePageClient = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [cityProfile, setCityProfile] = useState({
    id: 0,
    name: '',
    state: '',
    country: 'USA',
    address: '',
    zip_code: '',
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
    state: '',
    country: 'USA',
    address: '',
    zip_code: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    logo_url: '',
  });
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

  // Fetch city profile data
  const fetchCityProfile = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Safely access localStorage only on the client side
      if (typeof window === 'undefined') return;

      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Fetch city profile
      const response = await fetch('/api/city-profile', {
        headers: {
          Authorization: `Bearer ${cityToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch city profile');
      }

      const data = await response.json();
      setCityProfile(data.city || {});
      setFormData({
        name: data.city.name || '',
        state: data.city.state || '',
        country: data.city.country || 'USA',
        address: data.city.address || '',
        zip_code: data.city.zip_code || '',
        contact_email: data.city.contact_email || '',
        contact_phone: data.city.contact_phone || '',
        website: data.city.website || '',
        logo_url: data.city.logo_url || '',
      });
    } catch (err: unknown) {
      console.error('Error fetching city profile:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to load city profile');
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
      name: 'Houston',
      state: 'TX',
      country: 'USA',
      address: '901 Bagby St',
      zip_code: '77002',
      contact_email: 'info@houston.gov',
      contact_phone: '(713) 837-0311',
      website: 'https://www.houstontx.gov',
      logo_url: '/images/houston-logo.png',
      status: 'Active',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-11-15T00:00:00Z',
    };

    setCityProfile(dummyProfile);
    setFormData({
      name: dummyProfile.name,
      state: dummyProfile.state,
      country: dummyProfile.country,
      address: dummyProfile.address,
      zip_code: dummyProfile.zip_code,
      contact_email: dummyProfile.contact_email,
      contact_phone: dummyProfile.contact_phone,
      website: dummyProfile.website,
      logo_url: dummyProfile.logo_url,
    });
  };

  // Load city profile on component mount
  useEffect(() => {
    fetchCityProfile();
  }, []);

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
      const logoUrl = await uploadCityLogo(cityProfile.id, file);

      // Update form data with new logo URL
      setFormData({
        ...formData,
        logo_url: logoUrl,
      });

      // Show success message
      setSuccess('Logo uploaded successfully');
    } catch (err: unknown) {
      console.error('Error uploading logo:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to upload logo');
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
      // Safely access localStorage only on the client side
      if (typeof window === 'undefined') return;

      const cityToken = localStorage.getItem('cityToken');

      if (!cityToken) {
        throw new Error('No authentication token found');
      }

      // Call the API to update the city profile
      const response = await fetch('/api/city-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cityToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update city profile');
      }

      // Update local state with the new data
      const data = await response.json();
      setCityProfile(data.city);

      setSuccess('City profile updated successfully');
      setIsEditing(false);
    } catch (err: unknown) {
      console.error('Error updating city profile:', err);
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to update city profile');
    }
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">City Profile</h1>
            <p className="text-gray-400">Manage your city's information and settings</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchCityProfile} disabled={isLoading}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - City Info */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>City Information</CardTitle>
                <CardDescription className="text-gray-400">
                  {isEditing
                    ? 'Edit your city profile information'
                    : 'View your city profile information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full bg-gray-700" />
                    ))}
                  </div>
                ) : isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">
                          City Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
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
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-300">
                        Address
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip_code" className="text-gray-300">
                          ZIP Code
                        </Label>
                        <Input
                          id="zip_code"
                          name="zip_code"
                          value={formData.zip_code}
                          onChange={handleInputChange}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
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
                          className="bg-gray-700 border-gray-600 text-white"
                          disabled
                        />
                      </div>
                    </div>

                    <Separator className="my-4 bg-gray-700" />

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
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo_url" className="text-gray-300">
                        Logo URL
                      </Label>
                      <Input
                        id="logo_url"
                        name="logo_url"
                        value={formData.logo_url}
                        onChange={handleInputChange}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">City Name</h3>
                        <p className="mt-1 text-lg text-white">{cityProfile.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">State</h3>
                        <p className="mt-1 text-lg text-white">{cityProfile.state}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Address</h3>
                      <p className="mt-1 text-white flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
                        {cityProfile.address}, {cityProfile.zip_code}
                      </p>
                    </div>

                    <Separator className="my-4 bg-gray-700" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">Contact Email</h3>
                        <p className="mt-1 text-white flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-2" />
                          {cityProfile.contact_email || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">Contact Phone</h3>
                        <p className="mt-1 text-white flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-500 mr-2" />
                          {cityProfile.contact_phone || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Website</h3>
                      <p className="mt-1 text-white flex items-center">
                        <GlobeAltIcon className="h-5 w-5 text-gray-500 mr-2" />
                        {cityProfile.website ? (
                          <a
                            href={cityProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            {cityProfile.website}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>

                    <div className="mt-4">
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Information
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Logo and Stats */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>City Logo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {isLoading ? (
                  <Skeleton className="h-40 w-40 rounded-md bg-gray-700" />
                ) : cityProfile.logo_url ? (
                  <div className="relative w-40 h-40 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src={cityProfile.logo_url}
                      alt={`${cityProfile.name} Logo`}
                      className="max-w-full max-h-full object-contain"
                      onError={e => {
                        e.currentTarget.src = '/images/placeholder-logo.png';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 bg-gray-700 rounded-md flex items-center justify-center">
                    <BuildingOfficeIcon className="h-20 w-20 text-gray-500" />
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
                        Recommended size: 200x200px. Max file size: 2MB;
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>City Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full bg-gray-700" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white font-medium">{cityProfile.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Registered Since:</span>
                      <span className="text-white font-medium">
                        {new Date(cityProfile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Updated:</span>
                      <span className="text-white font-medium">
                        {new Date(cityProfile.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-white font-medium">{cityProfile.id}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Use dynamic import with SSR disabled to avoid hydration issues
const CityProfilePage = dynamic(() => Promise.resolve(CityProfilePageClient), {
  ssr: false,
});

export default function Page() {
  return <CityProfilePage />;
}
