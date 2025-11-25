
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { accessToken } = await withAuth({ ensureSignedIn: true });
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: doctorId } = await params;

        // Fetch doctor from backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Failed to fetch doctor' }, { status: response.status });
        }

        const doctorData = await response.json();

        // Normalize doctor data
        let doctor = doctorData.doctor || doctorData;

        // Parse specialization if it's a JSON string
        let specialization = doctor.specialization;
        if (typeof specialization === 'string') {
            try {
                specialization = JSON.parse(specialization);
            } catch (e) {
                // Keep as string if parsing fails
            }
        }

        // Parse languages if it's a JSON string
        let languages = doctor.languages_spoken;
        if (typeof languages === 'string') {
            try {
                languages = JSON.parse(languages);
            } catch (e) {
                languages = [];
            }
        }

        // Split name into firstName and lastName if needed
        const nameParts = (doctor.name || '').split(' ');
        const firstName = doctor.firstName || nameParts[0] || '';
        const lastName = doctor.lastName || nameParts.slice(1).join(' ') || '';

        const normalizedDoctor = {
            ...doctor,
            id: doctor.id || doctor.doctor_id || doctor.user_id || doctor.userId,
            firstName,
            lastName,
            specialty: specialization?.primary || doctor.specialty || 'General',
            specialization: {
                primary: specialization?.primary || doctor.specialty || 'General',
                secondary: Array.isArray(specialization?.secondary) ? specialization.secondary : []
            },
            experience: doctor.years_of_experience || doctor.experience || 0,
            languages: Array.isArray(languages) ? languages : [],
            consultation_fee: doctor.consultation_fee || doctor.fees || 500,
            hospital_id: doctor.hospital_id || doctor.org_id,
        };

        return NextResponse.json(normalizedDoctor);
    } catch (error: any) {
        console.error('Error fetching doctor:', error);
        return NextResponse.json(
            { error: 'Failed to fetch doctor' },
            { status: 500 }
        );
    }
}
