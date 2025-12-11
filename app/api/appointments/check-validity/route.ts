import { NextRequest, NextResponse } from "next/server";
import { withAuth, createBackendHeaders } from "@/lib/auth/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { accessToken } = await withAuth(req);

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const patientId = url.searchParams.get("patient_id");
    const doctorId = url.searchParams.get("doctor_id");
    const orgId = url.searchParams.get("org_id");

    if (!patientId || !doctorId || !orgId) {
      return NextResponse.json({ 
        error: 'patient_id, doctor_id, and org_id are required' 
      }, { status: 400 });
    }

    const queryParams = new URLSearchParams({
      patient_id: patientId,
      doctor_id: doctorId,
      org_id: orgId,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/check-validity?${queryParams}`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      return NextResponse.json({ is_valid: false }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error checking validity:', error);
    return NextResponse.json({ is_valid: false }, { status: 200 });
  }
}
