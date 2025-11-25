
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

// POST - Create a new review
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, accessToken } = await withAuth({ ensureSignedIn: true });
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: doctorId } = await params;
        const body = await request.json();
        const { rating, comment, appointmentId, isAnonymous } = body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Insert review
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}/reviews`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patient_id: user.id,
                rating,
                comment: comment || null,
                appointment_id: appointmentId || null,
                is_anonymous: isAnonymous || false,
                is_verified: !!appointmentId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || 'Failed to create review' },
                { status: response.status }
            );
        }

        const reviewData = await response.json();
        return NextResponse.json(reviewData, { status: 201 });
    } catch (error: any) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
        );
    }
}

// GET - Fetch all reviews for a doctor
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { accessToken } = await withAuth({ ensureSignedIn: true });
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: doctorId } = await params;
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '10';
        const offset = searchParams.get('offset') || '0';

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}/reviews?limit=${limit}&offset=${offset}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch reviews' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}
