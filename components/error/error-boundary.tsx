'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from './error-display';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-4">
                    <ErrorDisplay
                        title="Something went wrong"
                        message={this.state.error?.message || "An unexpected error occurred"}
                        onRetry={() => this.setState({ hasError: false, error: null })}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
