import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createBackendHeaders } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(request);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/family-members`,
      { headers: createBackendHeaders(accessToken, user.id) }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch family members' }, { status: response.status });
    }

    const familyMembers = await response.json();
    return NextResponse.json(familyMembers);
  } catch (error: any) {
    console.error('Error fetching family members:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch family members' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(request);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberData = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/family-members`,
      {
        method: 'POST',
        headers: createBackendHeaders(accessToken, user.id),
        body: JSON.stringify(memberData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to add family member' },
        { status: response.status }
      );
    }

    const newMember = await response.json();
    return NextResponse.json(newMember);
  } catch (error: any) {
    console.error('Error adding family member:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to add family member' },
      { status: error.response?.status || 500 }
    );
  }
}
