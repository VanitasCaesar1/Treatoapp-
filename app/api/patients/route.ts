import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * GET /api/patients - Get current user's patient profile
 */
export const GET = withAuth(async (req: NextRequest) => {
    try {
        const { user } = req;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch patient profile using user ID
        const response = await fetch(`${API_BASE_URL}/api/patient/profile/${user.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.get('Authorization') || '',
            },
        });

        if (response.status === 404) {
            // Patient profile doesn't exist - return null
            return NextResponse.json({ patient: null }, { status: 200 });
        }

        if (!response.ok) {
            throw new Error(`Backend error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Failed to fetch patient profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch patient profile' },
            { status: 500 }
        );
    }
});

/**
 * POST /api/patients - Create patient profile
 */
export const POST = withAuth(async (req: NextRequest) => {
    try {
        const { user } = req;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Create patient profile
        const response = await fetch(`${API_BASE_URL}/api/patient/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.get('Authorization') || '',
            },
            body: JSON.stringify({
                user_id: user.id,
                patient_id: user.id, // Use WorkOS user ID as patient ID (1:1 mapping)
                first_name: body.first_name || user.firstName || '',
                last_name: body.last_name || user.lastName || '',
                email: body.email || user.email || '',
                phone: body.phone,
                date_of_birth: body.date_of_birth,
                gender: body.gender,
                address: body.address,
                emergency_contact: body.emergency_contact,
                medical_history: body.medical_history,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Backend error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create patient profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create patient profile' },
            { status: 500 }
        );
    }
});

/**
 * PUT /api/patients - Update patient profile
 */
export const PUT = withAuth(async (req: NextRequest) => {
    try {
        const { user } = req;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Update patient profile
        const response = await fetch(`${API_BASE_URL}/api/patient/profile/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.get('Authorization') || '',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Backend error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Failed to update patient profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update patient profile' },
            { status: 500 }
        );
    }
});
