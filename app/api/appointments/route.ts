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
    const status = url.searchParams.get("status");
    const doctorId = url.searchParams.get("doctorId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const feeType = url.searchParams.get("feeType");
    const isValid = url.searchParams.get("isValid");
    const search = url.searchParams.get("search");
    const limit = url.searchParams.get("limit") || "20";
    const offset = url.searchParams.get("offset") || "0";

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("appointment_status", status);
    if (doctorId) queryParams.append("doctor_id", doctorId);
    if (startDate) queryParams.append("start_date", startDate);
    if (endDate) queryParams.append("end_date", endDate);
    if (feeType) queryParams.append("fee_type", feeType);
    if (isValid !== null) queryParams.append("is_valid", isValid);
    if (search) queryParams.append("search", search);
    queryParams.append("limit", limit);
    queryParams.append("offset", offset);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments?${queryParams.toString()}`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: response.status });
    }

    const appointmentsData = await response.json();
    return NextResponse.json(appointmentsData);
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch appointments' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await withAuth(req);

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments`,
      {
        method: 'POST',
        headers: createBackendHeaders(accessToken),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: response.status });
    }

    const createdAppointment = await response.json();
    return NextResponse.json(createdAppointment);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create appointment' },
      { status: error.response?.status || 500 }
    );
  }
}
