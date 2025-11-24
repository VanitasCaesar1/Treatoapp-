import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

// GET /api/user/family-members - Get all family members
export async function GET(request: NextRequest) {
    try {
        const { accessToken, user } = await withAuth({ ensureSignedIn: true });

        if (!accessToken || !user) {
            console.error('No access token or user available');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch family members from backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/family-members`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Auth-ID': user.id,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch family members' }, { status: response.status });
        }

        const familyMembers = await response.json();

        return NextResponse.json(familyMembers);
    } catch (error: any) {
        console.error('Error fetching family members:', error);
        return NextResponse.json(
            { error: error.response?.data?.error || 'Failed to fetch family members' },
            { status: error.response?.status || 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { accessToken, user } = await withAuth({ ensureSignedIn: true });

        if (!accessToken || !user) {
            console.error('No access token or user available');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const memberData = await request.json();

        // Add family member via backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/family-members`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Auth-ID': user.id,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(memberData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || 'Failed to add family member' },
                { status: response.status }
            );
        }

        const newMember = await response.json();

        return NextResponse.json(newMember);
    } catch (error: any) {
        console.error('Error adding family member:', error);
        return NextResponse.json(
            { error: error.response?.data?.error || 'Failed to add family member' },
            { status: error.response?.status || 500 }
        );
    }
}
