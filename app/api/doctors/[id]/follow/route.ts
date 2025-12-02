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

        const doctorId = params.id;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}/follow`,
            {
                method: 'POST',
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to follow doctor' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error following doctor:', error);
        return NextResponse.json({ error: 'Failed to follow doctor' }, { status: 500 });
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

        const doctorId = params.id;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}/follow`,
            {
                method: 'DELETE',
                headers: {
                    'X-User-ID': user.id,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to unfollow doctor' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error unfollowing doctor:', error);
        return NextResponse.json({ error: 'Failed to unfollow doctor' }, { status: 500 });
    }
}
