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
        const limit = url.searchParams.get("limit") || "18";
        const category = url.searchParams.get("category");
        const search = url.searchParams.get("search");

        // Build query params
        const params = new URLSearchParams({
            page,
            limit,
        });

        if (category) params.append('category', category);
        if (search) params.append('search', search);

        const response = await fetch(
            `${process.env.SOCIAL_SERVICE_URL || 'http://localhost:8090'}/api/explore?${params.toString()}`,
            {
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch explore posts' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching explore posts:', error);
        return NextResponse.json({ error: 'Failed to fetch explore posts' }, { status: 500 });
    }
}
