import { NextResponse } from 'next/server';
import { getSignInUrl } from '@workos-inc/authkit-nextjs';

/**
 * Generate WorkOS authorization URL for mobile deep linking
 * POST /api/auth/authorize
 */
export async function POST() {
    try {
        const signInUrl = await getSignInUrl({
            // For mobile: use custom URL scheme for redirect
            // For web: use standard callback URL
            redirectUri: process.env.NODE_ENV === 'production'
                ? 'treato://auth/callback'
                : 'http://10.0.2.2:3000/callback',
        });

        return NextResponse.json({ url: signInUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate auth URL' },
            { status: 500 }
        );
    }
}
