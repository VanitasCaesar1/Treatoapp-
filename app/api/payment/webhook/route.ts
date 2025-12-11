import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const authHeader = request.headers.get('Authorization');

    // Forward webhook to backend
    const response = await fetch(`${BACKEND_URL}/api/phonepe/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body,
    });

    return new NextResponse(null, { status: response.status });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
