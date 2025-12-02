'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by boundary:', error, errorInfo);

        // Log to error tracking service (Sentry, etc.)
        if (typeof window !== 'undefined' && (window as any).Sentry) {
            (window as any).Sentry.captureException(error, { extra: errorInfo });
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="text-center max-w-md">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            We're sorry for the inconvenience. Please try refreshing the page.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-medical-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/dashboard/dashboard'}
                                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Go to Home
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Error details (dev only)
                                </summary>
                                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
