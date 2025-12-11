/*
 * Error Boundary Component
 *
 * "Something went wrong" is useless. Give users a way to retry,
 * report, or navigate away. This component catches React errors
 * and provides a recovery UI.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 *
 * With custom fallback:
 *   <ErrorBoundary fallback={<CustomError />}>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /* Custom fallback UI */
  fallback?: ReactNode;
  /* Called when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /* Show report button */
  showReportButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    /*
     * Log to console in development.
     * In production, send to error tracking service.
     */
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    /* Call custom error handler if provided */
    this.props.onError?.(error, errorInfo);

    /*
     * Send to error tracking service.
     * Replace with your actual error tracking (Sentry, etc.)
     */
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  /*
   * reportError - Send error to tracking service
   */
  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        /* Error reporting failed - nothing we can do */
      });
    } catch {
      /* Ignore errors in error reporting */
    }
  }

  /*
   * handleRetry - Reset error state and try again
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  /*
   * handleRefresh - Full page refresh
   */
  handleRefresh = () => {
    window.location.reload();
  };

  /*
   * handleGoHome - Navigate to home page
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  /*
   * handleReport - Open error report dialog
   */
  handleReport = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent(`Bug Report: ${error?.message || 'Unknown error'}`);
    const body = encodeURIComponent(
      `Error: ${error?.message}\n\nStack: ${error?.stack}\n\nComponent Stack: ${errorInfo?.componentStack}\n\nURL: ${window.location.href}`
    );
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      /* Use custom fallback if provided */
      if (this.props.fallback) {
        return this.props.fallback;
      }

      /* Default error UI */
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>

          <p className="text-gray-500 mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={this.handleRetry}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={this.handleRefresh}
            >
              Refresh Page
            </Button>

            <Button
              variant="ghost"
              onClick={this.handleGoHome}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>

            {this.props.showReportButton && (
              <Button
                variant="ghost"
                onClick={this.handleReport}
                className="gap-2 text-gray-500"
              >
                <Bug className="w-4 h-4" />
                Report Bug
              </Button>
            )}
          </div>

          {/* Show stack trace in development */}
          {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
            <details className="mt-8 text-left w-full max-w-2xl">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show error details
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-64">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/*
 * withErrorBoundary - HOC to wrap component with error boundary
 *
 * Usage:
 *   export default withErrorBoundary(MyComponent);
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

/*
 * useErrorHandler - Hook to manually trigger error boundary
 *
 * Usage:
 *   const handleError = useErrorHandler();
 *   try {
 *     await riskyOperation();
 *   } catch (error) {
 *     handleError(error);
 *   }
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}
