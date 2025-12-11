import { NextRequest, NextResponse } from 'next/server';
import { createBackendHeaders } from '@/lib/auth/api-auth';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hospitals/${id}`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Hospital fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch hospital' }, { status: 500 });
  }
}
