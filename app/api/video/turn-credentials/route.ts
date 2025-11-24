import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * Proxy to video calling service - Get TURN credentials
 */
export const GET = withAuth(async (req: NextRequest) => {
    try {
        const { user } = req;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Forward request to video calling service
        const videoServiceUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8180';
        const response = await fetch(`${videoServiceUrl}/api/v1/turn/credentials`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.get('Authorization') || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Video service error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Failed to get TURN credentials:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get TURN credentials' },
            { status: 500 }
        );
    }
});
