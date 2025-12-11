import { NextRequest, NextResponse } from "next/server";
import { withAuth, createBackendHeaders } from "@/lib/auth/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { accessToken } = await withAuth(req);
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const specialty = url.searchParams.get("specialty");
    const location = url.searchParams.get("location");
    const availability = url.searchParams.get("availability");
    const rating = url.searchParams.get("rating");
    const experience = url.searchParams.get("experience");
    const limit = url.searchParams.get("limit") || "20";
    const offset = url.searchParams.get("offset") || "0";

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (query) queryParams.append("q", query);
    if (specialty) queryParams.append("specialty", specialty);
    if (location) queryParams.append("location", location);
    if (availability) queryParams.append("availability", availability);
    if (rating) queryParams.append("rating", rating);
    if (experience) queryParams.append("experience", experience);
    queryParams.append("limit", limit);
    queryParams.append("offset", offset);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/search?${queryParams.toString()}`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to search doctors' }, { status: response.status });
    }

    const searchResults = await response.json();
    
    // Normalize doctor data to match frontend expectations
    if (searchResults.doctors && Array.isArray(searchResults.doctors)) {
      searchResults.doctors = searchResults.doctors.map((doctor: any, index: number) => {
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
          // Pass through availability data
          available_slots_today: doctor.available_slots_today,
          next_available_date: doctor.next_available_date,
        };
      });
    }
    
    return NextResponse.json(searchResults);
  } catch (error: any) {
    console.error('Error searching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to search doctors' },
      { status: 500 }
    );
  }
}
