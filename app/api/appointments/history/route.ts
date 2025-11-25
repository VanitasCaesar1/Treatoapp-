
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

// GET - Fetch appointment history for the logged-in user
export async function GET(request: NextRequest) {
    try {
        const { user, accessToken } = await withAuth({ ensureSignedIn: true });
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch appointments from backend
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/history?user_id=${user.id}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch appointment history' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching appointment history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch appointment history' },
            { status: 500 }
        );
    }
}
