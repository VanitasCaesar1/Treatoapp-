import { handleAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Custom callback handler that creates user profile if needed
// Supports both web and mobile (via deep links) authentication flows
export async function GET(request: NextRequest) {
  // First, handle the WorkOS authentication
  const authResponse = await handleAuth({ returnPathname: '/dashboard' })(request);

  // If auth was successful (redirect response), try to ensure profile exists
  if (authResponse.status === 302 || authResponse.status === 307) {
    try {
      // Try to fetch or create the profile
      // This will trigger profile creation in the backend if it doesn't exist
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/profile/ensure`, {
        method: 'POST',
        headers: {
          'Cookie': authResponse.headers.get('set-cookie') || request.headers.get('cookie') || '',
        },
      }).catch(() => {
        // Silently fail - profile will be created on first access
        console.log('Profile creation deferred to first access');
      });
    } catch (error) {
      // Don't block the redirect if profile creation fails
      console.error('Failed to ensure profile exists:', error);
    }
  }

  return authResponse;
}

/**
 * POST endpoint for mobile deep link callback
 * Handles authentication code from mobile app
 */
export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    // Create a new request with the code as query params
    const callbackUrl = new URL('/callback', request.url);
    callbackUrl.searchParams.set('code', code);
    if (state) {
      callbackUrl.searchParams.set('state', state);
    }

    // Create a new request object
    const callbackRequest = new NextRequest(callbackUrl, {
      method: 'GET',
      headers: request.headers,
    });

    // Use the existing GET handler to process the auth
    return await GET(callbackRequest);
  } catch (error) {
    console.error('Mobile callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}