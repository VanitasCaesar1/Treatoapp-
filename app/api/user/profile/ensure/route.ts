import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createBackendHeaders } from '@/lib/auth/api-auth';

/**
 * POST /api/user/profile/ensure
 * 
 * Ensures a user profile exists in the backend after OAuth login.
 * Called automatically after successful authentication.
 * Creates the profile if it doesn't exist, returns existing if it does.
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(req);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call backend to ensure profile exists
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile/ensure`,
      {
        method: 'POST',
        headers: createBackendHeaders(accessToken, user.id),
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
        }),
      }
    );

    if (!response.ok) {
      // Profile creation failed, but don't block the user
      console.error('Failed to ensure profile:', response.status);
      return NextResponse.json({ 
        success: false, 
        message: 'Profile will be created on first access' 
      });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error('Error ensuring profile:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Profile creation deferred' 
    });
  }
}
