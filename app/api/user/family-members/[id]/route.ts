
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

// PUT /api/user/family-members/[id] - Update a family member
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { accessToken, user } = await withAuth({ ensureSignedIn: true });

        if (!accessToken || !user) {
            console.error('No access token or user available');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const memberData = await request.json();
        const { id } = await params;

        // Update family member via backend API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/family-members/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Auth-ID': user.id,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(memberData),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || 'Failed to update family member' },
                { status: response.status }
            );
        }

        const updatedMember = await response.json();
        return NextResponse.json(updatedMember);
    } catch (error: any) {
        console.error('Error updating family member:', error);
        return NextResponse.json(
            { error: error.response?.data?.error || 'Failed to update family member' },
            { status: error.response?.status || 500 }
        );
    }
}

// DELETE /api/user/family-members/[id] - Delete a family member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { accessToken, user } = await withAuth({ ensureSignedIn: true });

        if (!accessToken || !user) {
            console.error('No access token or user available');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Delete family member via backend API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/family-members/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Auth-ID': user.id,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || 'Failed to delete family member' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting family member:', error);
        return NextResponse.json(
            { error: error.response?.data?.error || 'Failed to delete family member' },
            { status: error.response?.status || 500 }
        );
    }
}
