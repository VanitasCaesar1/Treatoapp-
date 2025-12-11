import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createBackendHeaders } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(request);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/profile`,
      { headers: createBackendHeaders(accessToken, user.id) }
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404 || errorText.includes('no rows')) {
        return NextResponse.json(
          {
            error: 'Profile not found',
            message: 'Your profile needs to be created. Please contact support or try logging in again.',
            code: 'PROFILE_NOT_FOUND'
          },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: response.status });
    }

    const profile = await response.json();
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch profile' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(request);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/profile`,
      {
        method: 'PUT',
        headers: createBackendHeaders(accessToken, user.id),
        body: JSON.stringify(profileData),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: response.status });
    }

    const updatedProfile = await response.json();
    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to update profile' },
      { status: error.response?.status || 500 }
    );
  }
}
