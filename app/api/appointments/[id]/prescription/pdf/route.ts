import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { accessToken } = await withAuth(request);

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: appointmentId } = await params;

    // Fetch PDF from backend - route through gateway
    const response = await fetch(
      `${API_BASE_URL}/api/appointments/${appointmentId}/prescription/pdf`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
      }
      throw new Error('Failed to generate PDF');
    }

    // Get the PDF blob
    const pdfBuffer = await response.arrayBuffer();

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=prescription-${appointmentId}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating prescription PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
