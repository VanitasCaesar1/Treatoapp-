import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(req: NextRequest) {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const page = url.searchParams.get("page") || "1";
        const limit = url.searchParams.get("limit") || "10";

        // Forward to social service
        const response = await fetch(
            `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/feed?page=${page}&limit=${limit}`,
            {
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error('Feed fetch failed:', response.status, response.statusText);
            return NextResponse.json({
                error: 'Failed to fetch feed',
                data: [],
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching feed:', error);
        return NextResponse.json(
            {
                error: 'Failed ' + error.message,
                data: [],
            },
            { status: 500 }
        );
    }
}
