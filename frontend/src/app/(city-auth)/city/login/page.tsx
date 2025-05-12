'use client';

import ErrorBoundary from '@/components/ErrorBoundary';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the city login API
      const response = await fetch('/api/city-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      // Store the token in localStorage
      localStorage.setItem('cityToken', data.token);

      // Store user data in localStorage
      localStorage.setItem('cityUser', JSON.stringify(data.user));

      // Redirect to city dashboard
      router.push('/city/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      console.error('City login error:', err);
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
            <Typography level="h1" sx={{ mb: 2, color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}>
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
              <Typography level="body1" sx={{ color: 'text.secondary' }}>
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
                    onChange={(e) => setEmail(e.target.value)}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                    <FormLabel>Password</FormLabel>
                    <Link href="/city/forgot-password" style={{ textDecoration: 'none' }}>
                      <Typography level="body3" sx={{ color: 'primary.400' }}>
                        Forgot password?
                      </Typography>
                    </Link>
                  </Box>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    onChange={(e) => setRememberMe(e.target.checked)}
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

                <Box sx={{ textAlign: 'center' }}>
                  <Typography level="body2" sx={{ color: 'text.secondary' }}>
                    Don't have an account?{' '}
                    <Link href="/city/register" style={{ textDecoration: 'none' }}>
                      <Typography
                        component="span"
                        sx={{ color: 'primary.400', fontWeight: 500, textDecoration: 'none' }}
                      >
                        Contact your administrator
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
