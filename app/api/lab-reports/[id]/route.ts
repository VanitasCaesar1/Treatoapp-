import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createBackendHeaders } from '@/lib/auth/api-auth';

// GET - Get a single lab report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { accessToken, user } = await withAuth(request);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lab-reports/${id}`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Lab report not found' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching lab report:', error);
    return NextResponse.json({ error: 'Failed to fetch lab report' }, { status: 500 });
  }
}

// DELETE - Delete a lab report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { accessToken, user } = await withAuth(request);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lab-reports/${id}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to delete lab report' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lab report:', error);
    return NextResponse.json({ error: 'Failed to delete lab report' }, { status: 500 });
  }
}
