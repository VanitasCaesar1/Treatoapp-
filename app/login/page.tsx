'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'signup' | 'magic-link';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [magicCode, setMagicCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = mode === 'signup' 
        ? '/api/auth/signup' 
        : '/api/auth/login';
      
      const body = mode === 'signup'
        ? { email, password, first_name: firstName, last_name: lastName }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      toast.success(mode === 'signup' ? 'Account created!' : 'Welcome back!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicCode = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send code');
      }

      setCodeSent(true);
      toast.success('Code sent to your email!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMagicCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !magicCode) {
      toast.error('Please enter the code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: magicCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      toast.success('Welcome!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/signin?provider=GoogleOAuth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 max-w-[420px] mx-auto w-full">
        <div className="w-full space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Health</h1>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
            {/* Mode Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => { setMode('login'); setCodeSent(false); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setCodeSent(false); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'signup' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => { setMode('magic-link'); setCodeSent(false); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'magic-link' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                Magic Link
              </button>
            </div>

            {/* Magic Link Form */}
            {mode === 'magic-link' && (
              <form onSubmit={handleVerifyMagicCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={codeSent}
                    />
                  </div>
                </div>

                {codeSent && (
                  <div className="space-y-2">
                    <Label htmlFor="magic-code">Verification Code</Label>
                    <Input
                      id="magic-code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={magicCode}
                      onChange={(e) => setMagicCode(e.target.value)}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                )}

                {!codeSent ? (
                  <Button
                    type="button"
                    onClick={handleSendMagicCode}
                    disabled={isLoading}
                    className="w-full h-11"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Send Code <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} className="w-full h-11">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>
                )}

                {codeSent && (
                  <button
                    type="button"
                    onClick={() => { setCodeSent(false); setMagicCode(''); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Use a different email
                  </button>
                )}
              </form>
            )}

            {/* Password Form */}
            {(mode === 'login' || mode === 'signup') && (
              <form onSubmit={handlePasswordAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === 'login' && (
                      <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-11">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === 'signup' ? (
                    'Create Account'
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full h-11"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
