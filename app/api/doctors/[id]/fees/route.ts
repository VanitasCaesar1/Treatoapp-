import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { accessToken } = await withAuth({ ensureSignedIn: true });

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: doctorId } = await params;

        // Fetch doctor fees from backend
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}/fees`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ fees: [] });
            }
            return NextResponse.json({ error: 'Failed to fetch fees' }, { status: response.status });
        }

        const feesData = await response.json();
        return NextResponse.json(feesData);
    } catch (error: any) {
        console.error('Error fetching fees:', error);
        return NextResponse.json(
            { error: 'Failed to fetch fees' },
            { status: 500 }
        );
    }
}
