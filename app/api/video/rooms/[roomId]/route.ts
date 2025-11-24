import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * Get room details
 */
export const GET = withAuth(async (req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) => {
    try {
        const { user } = req;
        const { roomId } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Forward request to video calling service
        const videoServiceUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8180';
        const response = await fetch(`${videoServiceUrl}/api/v1/rooms/${roomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.get('Authorization') || '',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'Room not found' }, { status: 404 });
            }
            throw new Error(`Video service error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Failed to get room details:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get room details' },
            { status: 500 }
        );
    }
});

/**
 * Join room (create participant)
 */
export const POST = withAuth(async (req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) => {
    try {
        const { user } = req;
        const { roomId } = await params;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Forward request to video calling service
        const videoServiceUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8180';
        const response = await fetch(`${videoServiceUrl}/api/v1/rooms/${roomId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.get('Authorization') || '',
            },
            body: JSON.stringify({
                userId: user.id,
                userName: user.firstName || user.email || 'Patient',
                userType: 'patient'
            }),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'Room not found' }, { status: 404 });
            }
            throw new Error(`Video service error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Failed to join room:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to join room' },
            { status: 500 }
        );
    }
});
