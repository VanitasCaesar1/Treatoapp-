import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

// POST /api/social/stories/[id]/view - Mark story as viewed
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const storyId = params.id;

        const response = await fetch(
            `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/stories/${storyId}/view`,
            {
                method: 'POST',
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to mark story as viewed' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error marking story as viewed:', error);
        return NextResponse.json({ error: 'Failed to mark story as viewed' }, { status: 500 });
    }
}
