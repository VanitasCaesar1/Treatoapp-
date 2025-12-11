import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantOrderId: string }> }
) {
  try {
    const { accessToken } = await withAuth(request);
    const { merchantOrderId } = await params;

    const { searchParams } = new URL(request.url);
    const details = searchParams.get('details') === 'true';
    const errorContext = searchParams.get('errorContext') === 'true';

    let endpoint = `${BACKEND_URL}/api/phonepe/payment/order/${merchantOrderId}/status`;
    const queryParams = [];
    if (details) queryParams.push('details=true');
    if (errorContext) queryParams.push('errorContext=true');
    if (queryParams.length > 0) {
      endpoint += '?' + queryParams.join('&');
    }

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
