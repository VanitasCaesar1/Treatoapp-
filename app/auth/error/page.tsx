'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Heart, RefreshCw, Home, Shield } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'An authentication error occurred';
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Add a small delay for better UX
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  const getErrorDetails = (message: string) => {
    if (message.includes('Failed to create session')) {
      return {
        title: 'Session Creation Failed',
        description: 'We had trouble setting up your session. This is usually temporary.',
        suggestion: 'Please try signing in again. If the problem persists, contact support.'
      };
    }
    if (message.includes('Authentication failed')) {
      return {
        title: 'Authentication Failed',
        description: 'We couldn\'t verify your credentials.',
        suggestion: 'Please check your login details and try again.'
      };
    }
    return {
      title: 'Authentication Error',
      description: 'Something went wrong during the sign-in process.',
      suggestion: 'Please try again. If the issue continues, contact our support team.'
    };
  };

  const errorDetails = getErrorDetails(message);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Mobile-optimized container */}
      <div className="flex-1 flex items-center justify-center p-4 max-w-[480px] mx-auto w-full">
        <div className="w-full space-y-8">
          {/* Logo and branding */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Health</h1>
              <p className="text-gray-600 text-lg">Authentication Issue</p>
            </div>
          </div>

          {/* Main error card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {errorDetails.title}
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                {errorDetails.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error message details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-2">Error Details:</p>
                <p className="text-sm text-red-700">{message}</p>
              </div>

              {/* Suggestion */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">What to do next:</p>
                <p className="text-sm text-blue-700">{errorDetails.suggestion}</p>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
                >
                  {isRetrying ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Redirecting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </div>
                  )}
                </Button>

                <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Your data is secure and protected</span>
            </div>
            <p className="text-xs text-gray-500">
              If you continue to experience issues, please contact our support team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Heart className="h-10 w-10 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}