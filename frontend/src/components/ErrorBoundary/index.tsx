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

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useToastContext } from '@/providers/ToastProvider';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Context consumer component to access toast context
const ErrorToastConsumer = ({ error }: { error: Error }) => {
  const toast = useToastContext();

  React.useEffect(() => {
    if (error) {
      toast.error({
        title: 'An error occurred',
        description: 'Something went wrong. Please try again later.',
      });
    }
  }, [error, toast]);

  return null;
};

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <>
          <ErrorToastConsumer error={this.state.error as Error} />
          <div className="p-4 rounded-md bg-red-50 border border-red-200">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-4">
              We apologize for the inconvenience. Please try again later.
            </p>
            <details className="text-sm text-gray-700">
              <summary className="cursor-pointer text-red-600 font-medium">
                Error details (for developers)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                {this.state.error?.toString() || 'Unknown error'}
              </pre>
            </details>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to use the error boundary
const ErrorBoundary = (props: Props): JSX.Element => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
