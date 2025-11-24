'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Smartphone, Clock } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    // Redirect to the login API route which will handle the AuthKit flow
    window.location.href = '/api/auth/signin';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Mobile-optimized container */}
      <div className="flex-1 flex items-center justify-center p-4 max-w-[480px] mx-auto w-full">
        <div className="w-full space-y-8">
          {/* Logo and branding */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Health</h1>
              <p className="text-gray-600 text-lg">Your healthcare, simplified</p>
            </div>
          </div>

          {/* Main login card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Sign in to access your healthcare dashboard, book appointments, and manage your medical records securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In with WorkOS'
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Protected by enterprise-grade security
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4 px-4">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Secure</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Mobile First</p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">24/7 Access</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
