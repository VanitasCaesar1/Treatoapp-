import { NextRequest, NextResponse } from "next/server";
import { withAuth, createBackendHeaders } from "@/lib/auth/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { accessToken } = await withAuth(req);

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const patientId = url.searchParams.get("patientId");
    const recordType = url.searchParams.get("recordType");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const limit = url.searchParams.get("limit") || "20";
    const offset = url.searchParams.get("offset") || "0";

    const queryParams = new URLSearchParams();
    if (patientId) queryParams.append("patient_id", patientId);
    if (recordType) queryParams.append("record_type", recordType);
    if (startDate) queryParams.append("start_date", startDate);
    if (endDate) queryParams.append("end_date", endDate);
    queryParams.append("limit", limit);
    queryParams.append("offset", offset);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records?${queryParams.toString()}`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch medical records' }, { status: response.status });
    }

    const medicalRecordsData = await response.json();
    return NextResponse.json(medicalRecordsData);
  } catch (error: any) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch medical records' },
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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medical-records`,
      {
        method: 'POST',
        headers: createBackendHeaders(accessToken),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create medical record' }, { status: response.status });
    }

    const createdRecord = await response.json();
    return NextResponse.json(createdRecord);
  } catch (error: any) {
    console.error('Error creating medical record:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create medical record' },
      { status: error.response?.status || 500 }
    );
  }
}
