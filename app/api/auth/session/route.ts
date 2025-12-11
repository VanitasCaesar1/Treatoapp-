import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
    try {
        const { user } = await withAuth(request);

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
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
