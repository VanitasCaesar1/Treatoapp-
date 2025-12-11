import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createBackendHeaders } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(request);
    
    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/history?user_id=${user.id}`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch appointment history' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching appointment history:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment history' }, { status: 500 });
  }
}
