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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToastContext } from '@/providers/ToastProvider';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React, { Component, ErrorInfo, JSX, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Context consumer component to access toast context
const ErrorToastConsumer = ({ error }: { error: Error }) => {
  const toast = useToastContext();

  React.useEffect(() => {
    if (error) {
      toast.error({
        title: 'An error occurred',
        description: error.message || 'Please try again or contact support if the issue persists.',
      });
    }
  }, [error, toast]);

  return null;
};

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Show error toast
      return (
        <>
          <ErrorToastConsumer error={this.state.error as Error} />
          {this.props.fallback || (
            <div className="flex items-center justify-center min-h-[400px] p-6">
              <Card className="w-full max-w-md">
                <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
                  <CardTitle className="flex items-center text-red-700 dark:text-red-300">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                    Something went wrong
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {this.state.error?.message || 'An unexpected error occurred.'}
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-[200px] text-sm">
                    <pre className="whitespace-pre-wrap break-words">
                      {this.state.error?.stack || 'No stack trace available'}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                  <Button
                    onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  >
                    Try Again
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to use the error boundary
export const ErrorBoundary = (props: Props): JSX.Element => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
