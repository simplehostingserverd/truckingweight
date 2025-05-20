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

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// MUI Joy UI components
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import { CssVarsProvider } from '@mui/joy/styles';
import Typography from '@mui/joy/Typography';

// MUI Icons
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';

// Custom theme
import cityTheme from '@/theme/cityTheme';

export default function CityRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cityName, setCityName] = useState('');
  const [cityState, setCityState] = useState('');
  const [cityZip, setCityZip] = useState('');
  const [cityAddress, setCityAddress] = useState('');
  const [cityPhone, setCityPhone] = useState('');
  const [cityEmail, setCityEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Validate email domain - only .gov domains are allowed
      if (!email.toLowerCase().endsWith('.gov')) {
        setError('Only .gov email domains are allowed for city registration');
        setIsLoading(false);
        return;
      }

      // Validate city email domain if provided
      if (cityEmail && !cityEmail.toLowerCase().endsWith('.gov')) {
        setError('Only .gov email domains are allowed for city contact email');
        setIsLoading(false);
        return;
      }

      // First, create the city
      const cityResponse = await fetch('/api/city-auth/register-city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: cityName,
          state: cityState,
          zip_code: cityZip,
          address: cityAddress,
          contact_phone: cityPhone,
          contact_email: cityEmail || email,
        }),
      });

      const cityData = await cityResponse.json();

      if (!cityResponse.ok) {
        throw new Error(cityData.error || 'Failed to register city');
      }

      // Then, register the city admin user
      const userResponse = await fetch('/api/city-auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          cityId: cityData.city.id,
          role,
          status: 'pending', // Set initial status to pending for security review
        }),
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.error || 'Failed to register user');
      }

      // Show success message without redirect - user needs to wait for approval
      setSuccess(true);
    } catch (err: any /* @ts-ignore */) {
      setError(err.message || 'An error occurred during registration');
      console.error('City registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <CssVarsProvider defaultMode="dark" theme={cityTheme}>
        <Box
          sx={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            bgcolor: 'background.body',
          }}
        >
          {/* Left side - Image and info */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              width: '50%',
              position: 'relative',
              bgcolor: 'primary.800',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, rgba(0,80,179,0.9), rgba(0,58,140,0.7))',
                zIndex: 1,
              }}
            />
            <Image
              src="/images/city-weighing-bg.jpg"
              alt="City Weighing System"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <Box
              sx={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                px: 6,
                color: 'white',
              }}
            >
              <Box sx={{ mb: 4 }}>
                <ApartmentIcon sx={{ fontSize: 48, color: 'primary.300' }} />
              </Box>
              <Typography
                level="h1"
                sx={{ mb: 2, color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              >
                City Weighing Portal
              </Typography>
              <Typography sx={{ mb: 4, color: 'primary.200', fontSize: '1.25rem' }}>
                Register your municipality to manage commercial vehicle weights, permits, and
                compliance.
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: 'primary.300', mr: 1.5, fontSize: '1.25rem' }} />
                  <Typography sx={{ color: 'primary.100' }}>
                    Issue and manage overweight/oversize permits
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: 'primary.300', mr: 1.5, fontSize: '1.25rem' }} />
                  <Typography sx={{ color: 'primary.100' }}>
                    Track commercial vehicle compliance
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: 'primary.300', mr: 1.5, fontSize: '1.25rem' }} />
                  <Typography sx={{ color: 'primary.100' }}>
                    Manage city-owned scales and weighing stations
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: 'primary.300', mr: 1.5, fontSize: '1.25rem' }} />
                  <Typography sx={{ color: 'primary.100' }}>
                    Issue violations and collect fines
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Right side - Registration form */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
            }}
          >
            <Card
              variant="outlined"
              sx={{
                width: '100%',
                maxWidth: 600,
                p: 4,
                boxShadow: 'lg',
                bgcolor: 'background.level1',
                borderColor: 'primary.700',
                borderWidth: 2,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography level="h2" sx={{ mb: 1, color: 'primary.400', fontWeight: 'bold' }}>
                  Register Your Municipality
                </Typography>
                <Typography level="body1" sx={{ color: 'text.secondary' }}>
                  Create a city account to manage commercial vehicle weights and permits
                </Typography>
              </Box>

              {error && (
                <Alert
                  variant="soft"
                  color="danger"
                  startDecorator={<WarningIcon />}
                  sx={{ mb: 3 }}
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert
                  variant="soft"
                  color="success"
                  startDecorator={<CheckCircleIcon />}
                  sx={{ mb: 3 }}
                >
                  Registration submitted successfully! Your account is pending approval by our
                  security team. You will receive an email notification once your account is
                  activated.
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Typography level="title-md" sx={{ color: 'primary.400', mt: 2 }}>
                    City Information
                  </Typography>
                  <FormControl required>
                    <FormLabel>City Name</FormLabel>
                    <Input
                      value={cityName}
                      onChange={e => setCityName(e.target.value)}
                      placeholder="Enter city name"
                      startDecorator={<LocationCityIcon />}
                      required
                    />
                  </FormControl>

                  <FormControl required>
                    <FormLabel>State</FormLabel>
                    <Input
                      value={cityState}
                      onChange={e => setCityState(e.target.value)}
                      placeholder="TX"
                      required
                    />
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>Address</FormLabel>
                      <Input
                        value={cityAddress}
                        onChange={e => setCityAddress(e.target.value)}
                        placeholder="City Hall Address"
                      />
                    </FormControl>
                    <FormControl sx={{ width: '30%' }}>
                      <FormLabel>ZIP Code</FormLabel>
                      <Input
                        value={cityZip}
                        onChange={e => setCityZip(e.target.value)}
                        placeholder="12345"
                      />
                    </FormControl>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>City Contact Email</FormLabel>
                      <Input
                        type="email"
                        value={cityEmail}
                        onChange={e => setCityEmail(e.target.value)}
                        placeholder="city@example.gov"
                      />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>City Contact Phone</FormLabel>
                      <Input
                        value={cityPhone}
                        onChange={e => setCityPhone(e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </FormControl>
                  </Box>

                  <Divider />

                  <Typography level="title-md" sx={{ color: 'primary.400', mt: 2 }}>
                    City Account Registration
                  </Typography>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 1 }}>
                    Your registration will be reviewed by our team for security verification before
                    activation
                  </Typography>

                  <FormControl required>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your full name"
                      startDecorator={<PersonIcon />}
                      required
                    />
                  </FormControl>

                  <FormControl required>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@example.gov"
                      startDecorator={<EmailIcon />}
                      required
                    />
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl required sx={{ flex: 1 }}>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        startDecorator={<LockIcon />}
                        required
                      />
                    </FormControl>
                    <FormControl required sx={{ flex: 1 }}>
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        startDecorator={<LockIcon />}
                        required
                      />
                    </FormControl>
                  </Box>

                  {/* Role is hardcoded to admin for the initial city registration */}

                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading || success}
                    sx={{
                      mt: 2,
                      bgcolor: 'primary.500',
                      '&:hover': { bgcolor: 'primary.600' },
                    }}
                  >
                    {isLoading ? 'Submitting Registration...' : 'Submit Registration for Approval'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography level="body2" sx={{ color: 'text.secondary' }}>
                      Already have an account?{' '}
                      <Link href="/city-login" style={{ textDecoration: 'none' }}>
                        <Typography
                          component="span"
                          sx={{ color: 'primary.400', fontWeight: 500, textDecoration: 'none' }}
                        >
                          Sign in
                        </Typography>
                      </Link>
                    </Typography>
                  </Box>
                </Stack>
              </form>
            </Card>
          </Box>
        </Box>
      </CssVarsProvider>
    </ErrorBoundary>
  );
}
