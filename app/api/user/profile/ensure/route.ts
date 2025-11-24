import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function POST(request: NextRequest) {
  try {
    const { user, accessToken } = await withAuth({ ensureSignedIn: true });

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get existing profile first
    const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // If profile exists, return it
    if (checkResponse.ok) {
      const profile = await checkResponse.json();
      return NextResponse.json({ exists: true, profile });
    }

    // Profile doesn't exist, create it
    const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email?.split('@')[0] || 'User',
        username: user.email?.split('@')[0] || `user_${Date.now()}`,
        email_verified: user.emailVerified || false,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Failed to create profile:', errorText);
      return NextResponse.json(
        { error: 'Failed to create profile', details: errorText },
        { status: createResponse.status }
      );
    }

    const newProfile = await createResponse.json();
    return NextResponse.json({ exists: false, profile: newProfile, created: true });
  } catch (error: any) {
    console.error('Error ensuring profile exists:', error);
    return NextResponse.json(
      { error: 'Failed to ensure profile exists', details: error.message },
      { status: 500 }
    );
  }
}
