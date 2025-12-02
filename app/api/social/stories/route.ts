import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

// GET /api/social/stories - Fetch all active stories
export async function GET(req: NextRequest) {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(
            `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/stories`,
            {
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch stories' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching stories:', error);
        return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }
}

// POST /api/social/stories - Create a new story
export async function POST(req: NextRequest) {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const response = await fetch(
            `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/stories`,
            {
                method: 'POST',
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json({
                error: error.error || 'Failed to create story'
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating story:', error);
        return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
    }
}
