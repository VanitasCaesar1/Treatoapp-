import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(request: NextRequest) {
    try {
        const { user } = await withAuth({ ensureSignedIn: false });

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({
            user: {
                profilePictureUrl: user.profilePictureUrl,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Session error:', error);
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
