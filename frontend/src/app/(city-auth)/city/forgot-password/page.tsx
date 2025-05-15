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
import Alert from '@mui/joy/Alert';
import Card from '@mui/joy/Card';
import Stack from '@mui/joy/Stack';

// MUI Icons
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ApartmentIcon from '@mui/icons-material/Apartment';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Custom theme
import cityTheme from '@/theme/cityTheme';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // This is a placeholder for the actual password reset functionality
      // In a real implementation, you would call an API endpoint to send a password reset email

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
      console.error('Password reset error:', err);
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

          {/* Right side - Forgot Password form */}
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
                  Reset Your Password
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Enter your email address and we'll send you instructions to reset your password
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

              {success ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Alert
                    variant="soft"
                    color="success"
                    startDecorator={<CheckCircleIcon />}
                    sx={{ mb: 3 }}
                  >
                    Password reset instructions have been sent to your email address.
                  </Alert>
                  <Typography level="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    Please check your email and follow the instructions to reset your password. If
                    you don't receive an email within a few minutes, please check your spam folder.
                  </Typography>
                  <Button
                    startDecorator={<ArrowBackIcon />}
                    onClick={() => router.push('/city/login')}
                    sx={{
                      bgcolor: 'primary.500',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.600',
                      },
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              ) : (
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
                      {isLoading ? 'Sending...' : 'Reset Password'}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography level="body2" sx={{ color: 'text.secondary' }}>
                        Remember your password?{' '}
                        <Link href="/city/login" style={{ textDecoration: 'none' }}>
                          <Typography
                            component="span"
                            sx={{ color: 'primary.400', fontWeight: 500, textDecoration: 'none' }}
                          >
                            Back to Login
                          </Typography>
                        </Link>
                      </Typography>
                    </Box>
                  </Stack>
                </form>
              )}
            </Card>
          </Box>
        </Box>
      </CssVarsProvider>
    </ErrorBoundary>
  );
}
