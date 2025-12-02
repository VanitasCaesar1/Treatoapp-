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
        const body = await req.json();

        const response = await fetch(
            `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/posts/${postId}/comment`,
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
            return NextResponse.json({ error: 'Failed to add comment' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const postId = params.id;
        const url = new URL(req.url);
        const page = url.searchParams.get("page") || "1";
        const limit = url.searchParams.get("limit") || "20";

        const response = await fetch(
            `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/posts/${postId}/comments?page=${page}&limit=${limit}`,
            {
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch comments' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}
