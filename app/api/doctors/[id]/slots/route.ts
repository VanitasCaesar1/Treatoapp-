
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const url = new URL(req.url);
        const { accessToken } = await withAuth({ ensureSignedIn: true });

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: doctorId } = await params;
        const date = url.searchParams.get('date');
        const hospitalId = url.searchParams.get('hospital_id') || url.searchParams.get('org_id');

        if (!date) {
            return NextResponse.json(
                { error: 'Date parameter is required' },
                { status: 400 }
            );
        }

        const queryParams = new URLSearchParams({
            date,
            ...(hospitalId && { org_id: hospitalId }),
        });

        // Fetch slots from backend
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}/slots?${queryParams.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            // Return empty slots on 404 instead of error
            if (response.status === 404) {
                return NextResponse.json({ slots: [], available_slots: [] });
            }
            return NextResponse.json(
                { error: 'Failed to fetch doctor slots' },
                { status: response.status }
            );
        }

        const slots = await response.json();
        return NextResponse.json(slots);
    } catch (error: any) {
        console.error('Error fetching doctor slots:', error);
        return NextResponse.json(
            { slots: [], available_slots: [] },
            { status: 200 } // Return empty slots instead of error
        );
    }
}
