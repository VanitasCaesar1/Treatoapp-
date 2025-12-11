'use client';

import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
    sendMagicAuthCode,
    verifyMagicAuthCode,
    loginWithPassword,
    signupWithPassword,
} from '@/lib/auth/backend-auth';
import { loginWithOAuth } from '@/lib/auth/mobile-auth';
import { storeTokens } from '@/lib/auth/token-storage';
import { useRouter } from 'next/navigation';

/**
 * Example Login Screen for Mobile App
 * Shows all authentication methods: Magic Auth, Password, OAuth
 */

type AuthMethod = 'magic' | 'password' | 'signup' | 'oauth';

export function LoginScreen() {
    const router = useRouter();
    const [method, setMethod] = useState<AuthMethod>('magic');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Magic Auth state
    const [email, setEmail] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState('');

    // Password Auth state
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleMagicAuth = async () => {
        setLoading(true);
        setError('');

        try {
            if (!codeSent) {
                // Send code
                await sendMagicAuthCode(email);
                await Haptics.impact({ style: ImpactStyle.Medium });
                setCodeSent(true);
            } else {
                // Verify code
                const auth = await verifyMagicAuthCode(email, code);
                await storeTokens(auth.access_token, auth.refresh_token, auth.user, auth.expires_in);
                await Haptics.impact({ style: ImpactStyle.Heavy });
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
            await Haptics.impact({ style: ImpactStyle.Heavy });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordAuth = async () => {
        setLoading(true);
        setError('');

        try {
            let auth;
            if (method === 'signup') {
                auth = await signupWithPassword(email, password, firstName, lastName);
            } else {
                auth = await loginWithPassword(email, password);
            }

            await storeTokens(auth.access_token, auth.refresh_token, auth.user, auth.expires_in);
            await Haptics.impact({ style: ImpactStyle.Heavy });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            await Haptics.impact({ style: ImpactStyle.Heavy });
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'microsoft' | 'github') => {
        setLoading(true);
        setError('');

        try {
            await loginWithOAuth(provider);
            // Deep link handler will complete the flow
        } catch (err: any) {
            setError(err.message);
            await Haptics.impact({ style: ImpactStyle.Heavy });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Treato</h1>
                    <p className="text-gray-600 mt-2">Welcome back</p>
                </div>

                {/* Auth Method Selector */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setMethod('magic'); setCodeSent(false); }}
                        className={`flex-1 py-2 rounded-xl font-medium transition-all ${method === 'magic'
                                ? 'bg-white text-blue-600 shadow-lg'
                                : 'bg-white/50 text-gray-600'
                            }`}
                    >
                        Magic Link
                    </button>
                    <button
                        onClick={() => setMethod('password')}
                        className={`flex-1 py-2 rounded-xl font-medium transition-all ${method === 'password'
                                ? 'bg-white text-blue-600 shadow-lg'
                                : 'bg-white/50 text-gray-600'
                            }`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => setMethod('oauth')}
                        className={`flex-1 py-2 rounded-xl font-medium transition-all ${method === 'oauth'
                                ? 'bg-white text-blue-600 shadow-lg'
                                : 'bg-white/50 text-gray-600'
                            }`}
                    >
                        Social
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Magic Auth */}
                    {method === 'magic' && (
                        <div className="space-y-4">
                            {!codeSent ? (
                                <>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={handleMagicAuth}
                                        disabled={loading || !email}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Send Magic Code'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 text-center">
                                        Check your email for a 6-digit code
                                    </p>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                                    />
                                    <button
                                        onClick={handleMagicAuth}
                                        disabled={loading || code.length !== 6}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Verifying...' : 'Verify Code'}
                                    </button>
                                    <button
                                        onClick={() => setCodeSent(false)}
                                        className="w-full text-gray-600 text-sm"
                                    >
                                        ← Back
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Password Auth */}
                    {method === 'password' && (
                        <div className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handlePasswordAuth}
                                disabled={loading || !email || !password}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                            <button
                                onClick={() => setMethod('signup')}
                                className="w-full text-blue-600 text-sm"
                            >
                                Don't have an account? Sign up
                            </button>
                        </div>
                    )}

                    {/* Signup */}
                    {method === 'signup' && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handlePasswordAuth}
                                disabled={loading || !email || !password || !firstName || !lastName}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating account...' : 'Sign Up'}
                            </button>
                            <button
                                onClick={() => setMethod('password')}
                                className="w-full text-blue-600 text-sm"
                            >
                                ← Back to sign in
                            </button>
                        </div>
                    )}

                    {/* OAuth */}
                    {method === 'oauth' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => handleOAuthLogin('google')}
                                disabled={loading}
                                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

                            <button
                                onClick={() => handleOAuthLogin('microsoft')}
                                disabled={loading}
                                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 23 23">
                                    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                                    <path fill="#f35325" d="M1 1h10v10H1z" />
                                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                                </svg>
                                Continue with Microsoft
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    By continuing, you agree to our Terms & Privacy Policy
                </p>
            </div>
        </div>
    );
}
