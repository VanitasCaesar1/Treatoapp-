import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(req: NextRequest) {
    try {
        const { user } = await withAuth();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user roles from user service
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${user.id}/roles`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch roles:', response.status);
            // Default to patient role if fetch fails
            return NextResponse.json({ roles: ['patient'] });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching user roles:', error);
        return NextResponse.json({ roles: ['patient'] }, { status: 200 }); // Graceful fallback
    }
}
