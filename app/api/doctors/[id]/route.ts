import { NextRequest, NextResponse } from "next/server";
import { withAuth, createBackendHeaders } from "@/lib/auth/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { accessToken } = await withAuth(request);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: doctorId } = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch doctor' }, { status: response.status });
    }

    const doctorData = await response.json();
    let doctor = doctorData.doctor || doctorData;

    // Parse specialization if it's a JSON string
    let specialization = doctor.specialization;
    if (typeof specialization === 'string') {
      try { specialization = JSON.parse(specialization); } catch (e) {}
    }

    // Parse languages if it's a JSON string
    let languages = doctor.languages_spoken;
    if (typeof languages === 'string') {
      try { languages = JSON.parse(languages); } catch (e) { languages = []; }
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
    return NextResponse.json({ error: 'Failed to fetch doctor' }, { status: 500 });
  }
}
