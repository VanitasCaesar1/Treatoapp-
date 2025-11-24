import { handleAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Custom callback handler that creates user profile if needed
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