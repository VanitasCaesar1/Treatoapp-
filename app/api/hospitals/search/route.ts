import { NextRequest, NextResponse } from 'next/server';
import { createBackendHeaders } from '@/lib/auth/api-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '20';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hospitals/search`);
    if (query) url.searchParams.set('q', query);
    url.searchParams.set('limit', limit);
    if (lat) url.searchParams.set('lat', lat);
    if (lng) url.searchParams.set('lng', lng);

    const response = await fetch(url.toString(), {
      headers: createBackendHeaders(accessToken),
    });

    if (!response.ok) {
      return NextResponse.json({ hospitals: [], total: 0 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Hospitals search error:', error);
    return NextResponse.json({ hospitals: [], total: 0 });
  }
}
