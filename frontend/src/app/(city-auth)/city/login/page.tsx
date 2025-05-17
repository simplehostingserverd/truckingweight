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

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createSafeUrl } from '@/utils/navigation';

// MUI Joy UI components
import { CssVarsProvider } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import Alert from '@mui/joy/Alert';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Stack from '@mui/joy/Stack';
import Grid from '@mui/joy/Grid';

// MUI Icons
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ApartmentIcon from '@mui/icons-material/Apartment';
import WarningIcon from '@mui/icons-material/Warning';

// Custom theme
import cityTheme from '@/theme/cityTheme';

export default function CityLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoLogin, setShowDemoLogin] = useState(process.env.NODE_ENV === 'development');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Import Supabase client dynamically to avoid SSR issues
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      // First try direct Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!authError && authData.session) {
        console.log('Successfully authenticated with Supabase JWT');
        
        // For backward compatibility, also call the API to get the Paseto token
        try {
          const response = await fetch('/api/city-auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          if (response.ok) {
            const data = await response.json();
            // Store the token in localStorage for backward compatibility
            localStorage.setItem('cityToken', data.token);
            // Store user data in localStorage for backward compatibility
            localStorage.setItem('cityUser', JSON.stringify(data.user));
          }
        } catch (apiError) {
          console.warn('Failed to get legacy tokens, but JWT auth succeeded:', apiError);
        }
        
        // Redirect to city dashboard
        router.push(createSafeUrl('/city/dashboard'));
        router.refresh(); // Important to refresh the router
        return;
      }
      
      // If Supabase Auth fails, fall back to the API
      const response = await fetch('/api/city-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Login failed');
      }

      // Store the token in localStorage for backward compatibility
      localStorage.setItem('cityToken', data.token);
      // Store user data in localStorage for backward compatibility
      localStorage.setItem('cityUser', JSON.stringify(data.user));
      
      // If the API returned Supabase tokens, use them to set the session
      if (data.supabaseToken) {
        try {
          // Set the session manually
          await supabase.auth.setSession({
            access_token: data.supabaseToken,
            refresh_token: data.refreshToken || '',
          });
        } catch (sessionError) {
          console.warn('Failed to set Supabase session:', sessionError);
        }
      }

      // Redirect to city dashboard
      router.push(createSafeUrl('/city/dashboard'));
      router.refresh(); // Important to refresh the router
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      console.error('City login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle demo login with test credentials
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Import Supabase client dynamically to avoid SSR issues
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      // Try to sign in with demo credentials
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'cityadmin@example.gov',
        password: 'CityAdmin123!',
      });
      
      if (!authError && authData.session) {
        console.log('Successfully authenticated demo user with Supabase JWT');
        
        // For backward compatibility, also create local storage items
        const demoUser = {
          id: authData.user.id,
          name: 'Demo City Admin',
          email: 'cityadmin@example.gov',
          cityId: 1,
          role: 'admin',
        };
        
        // Store the token and user data in localStorage for backward compatibility
        localStorage.setItem('cityToken', authData.session.access_token);
        localStorage.setItem('cityUser', JSON.stringify(demoUser));
        
        // Redirect to city dashboard
        router.push(createSafeUrl('/city/dashboard'));
        router.refresh(); // Important to refresh the router
        return;
      }
      
      // If Supabase Auth fails, fall back to the old method
      console.warn('Supabase Auth failed for demo login, using fallback method');
      
      // Create a demo token and user
      const demoToken = 'test-city-token-' + Date.now();
      const demoUser = {
        id: 'demo-city-user',
        name: 'Demo City Admin',
        email: 'cityadmin@example.gov',
        cityId: 1,
        role: 'admin',
      };
      
      // Store the token and user data in localStorage
      localStorage.setItem('cityToken', demoToken);
      localStorage.setItem('cityUser', JSON.stringify(demoUser));
      
      // Redirect to city dashboard
      router.push(createSafeUrl('/city/dashboard'));
    } catch (error) {
      console.error('Error during demo login:', error);
      setError('Demo login failed. Please try again.');
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
              sizes="(max-width: 1200px) 100vw, 50vw"
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
                Manage commercial vehicle weights, permits, and compliance across your municipality.
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
                    Track compliance and issue violations
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ color: 'primary.300', mr: 1.5, fontSize: '1.25rem' }} />
                  <Typography sx={{ color: 'primary.100' }}>
                    Monitor revenue and generate reports
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Right side - Login form */}
          <Box
            sx={{
              width: { xs: '100%', lg: '50%' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Card
              variant="outlined"
              sx={{
                width: '100%',
                maxWidth: 480,
                p: 4,
                boxShadow: 'lg',
                bgcolor: 'background.level1',
                borderColor: 'primary.700',
                borderWidth: 2,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography level="h2" sx={{ mb: 1, color: 'primary.400', fontWeight: 'bold' }}>
                  City Weighing Portal
                </Typography>
                <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                  Please sign in to your municipal account
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

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <FormControl>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="city@example.gov"
                      startDecorator={<EmailIcon />}
                      sx={{
                        '--Input-focusedHighlight': 'primary.500',
                        '&:hover': {
                          borderColor: 'primary.400',
                        },
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        mb: 1,
                      }}
                    >
                      <FormLabel>Password</FormLabel>
                      <Link href="/city/forgot-password" style={{ textDecoration: 'none' }}>
                        <Typography level="body-xs" sx={{ color: 'primary.400' }}>
                          Forgot password?
                        </Typography>
                      </Link>
                    </Box>
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      startDecorator={<LockIcon />}
                      sx={{
                        '--Input-focusedHighlight': 'primary.500',
                        '&:hover': {
                          borderColor: 'primary.400',
                        },
                      }}
                    />
                  </FormControl>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      label="Remember me"
                      sx={{
                        color: 'primary.500',
                        '&.Mui-checked': {
                          color: 'primary.500',
                        },
                      }}
                    />
                  </Box>

                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                    fullWidth
                    sx={{
                      bgcolor: 'primary.500',
                      color: 'white',
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'primary.600',
                      },
                      '&:active': {
                        bgcolor: 'primary.700',
                      },
                    }}
                  >
                    {isLoading ? 'Signing in...' : 'Login'}
                  </Button>

                  <Divider sx={{ my: 1 }}>
                    <Typography level="body3" sx={{ color: 'text.tertiary' }}>
                      OR
                    </Typography>
                  </Divider>

                  {showDemoLogin && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="neutral"
                      onClick={handleDemoLogin}
                      disabled={isLoading}
                      sx={{
                        mb: 2,
                        borderColor: 'primary.300',
                        color: 'primary.300',
                        '&:hover': {
                          borderColor: 'primary.400',
                          backgroundColor: 'primary.800',
                        },
                      }}
                    >
                      Demo Login (No Password Required)
                    </Button>
                  )}

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      Don't have an account?{' '}
                      <Link href="/city/register" style={{ textDecoration: 'none' }}>
                        <Typography
                          component="span"
                          level="body-sm"
                          sx={{ color: 'primary.400', fontWeight: 500, textDecoration: 'none' }}
                        >
                          Contact your administrator
                        </Typography>
                      </Link>
                    </Typography>
                  </Box>

                  {/* Credentials hint for development */}
                  {process.env.NODE_ENV === 'development' && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.level2',
                        border: '1px dashed',
                        borderColor: 'primary.700',
                      }}
                    >
                      <Typography level="body-xs" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        <InfoIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                        <strong>Development Credentials:</strong>
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary', ml: 2 }}>
                        Email: cityadmin@example.gov
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary', ml: 2 }}>
                        Password: CityAdmin123!
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </form>
            </Card>
          </Box>
        </Box>
      </CssVarsProvider>
    </ErrorBoundary>
  );
}
