import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { accessToken } = await withAuth({ ensureSignedIn: true });

        if (!accessToken) {
            console.error('No access token available');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const hospitalId = params.id;

        // Forward the request to the backend
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hospitals/${hospitalId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error('Hospital fetch failed:', response.status, response.statusText);
            return NextResponse.json({
                error: 'Failed to fetch hospital details'
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching hospital:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hospital details' },
            { status: 500 }
        );
    }
}
