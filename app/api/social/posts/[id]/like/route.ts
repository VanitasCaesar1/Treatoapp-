import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const postId = params.id;

        const response = await fetch(
            `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/posts/${postId}/like`,
            {
                method: 'POST',
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to like post' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error liking post:', error);
        return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const postId = params.id;

        const response = await fetch(
            `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/posts/${postId}/like`,
            {
                method: 'DELETE',
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to unlike post' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error unliking post:', error);
        return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
    }
}
