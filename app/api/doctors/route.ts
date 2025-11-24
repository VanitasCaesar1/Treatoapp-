import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(req: NextRequest) {
  try {
    const { accessToken } = await withAuth({ ensureSignedIn: true });

    if (!accessToken) {
      console.error('No access token available');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const search = url.searchParams.get("search");
    const specialty = url.searchParams.get("specialty");
    const location = url.searchParams.get("location");
    const availability = url.searchParams.get("availability");
    const limit = url.searchParams.get("limit") || "20";
    const offset = url.searchParams.get("offset") || "0";

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (specialty) queryParams.append("specialty", specialty);
    if (location) queryParams.append("location", location);
    if (availability) queryParams.append("availability", availability);
    queryParams.append("limit", limit);
    queryParams.append("offset", offset);

    // Forward the request to the backend with minimal headers
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: response.status });
    }

    const doctorsData = await response.json();

    // Normalize doctor data to match frontend expectations
    if (doctorsData.doctors && Array.isArray(doctorsData.doctors)) {
      doctorsData.doctors = doctorsData.doctors.map((doctor: any, index: number) => {
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

        return {
          ...doctor,
          id: doctor.id || doctor.doctor_id || doctor.user_id || doctor.userId || `doctor-${index}`,
          firstName,
          lastName,
          specialty: specialization?.primary || doctor.specialty || 'General',
          specialization: specialization?.secondary || [],
          experience: doctor.years_of_experience || doctor.experience || 0,
          languages: Array.isArray(languages) ? languages : [],
        };
      });
    }

    return NextResponse.json(doctorsData);
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch doctors' },
      { status: error.response?.status || 500 }
    );
  }
}