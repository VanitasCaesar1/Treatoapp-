import { NextRequest, NextResponse } from 'next/server';
import { createBackendHeaders } from '@/lib/auth/api-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '20';

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines/search`);
    if (query) url.searchParams.set('q', query);
    url.searchParams.set('limit', limit);

    const response = await fetch(url.toString(), {
      headers: createBackendHeaders(accessToken),
    });

    if (!response.ok) {
      // Return empty array if service unavailable
      return NextResponse.json({ medicines: [], total: 0 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Medicines search error:', error);
    return NextResponse.json({ medicines: [], total: 0 });
  }
}
