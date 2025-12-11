import { NextRequest, NextResponse } from "next/server";
import { withAuth, createBackendHeaders } from "@/lib/auth/api-auth";

// GET - List lab reports for a patient or diagnosis
export async function GET(req: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(req);
    
    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const diagnosisId = url.searchParams.get('diagnosis_id');
    const patientId = url.searchParams.get('patient_id');
    const appointmentId = url.searchParams.get('appointment_id');

    // Determine endpoint based on query params
    let endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lab-reports`;
    if (patientId) {
      endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lab-reports/patient/${patientId}`;
    } else if (diagnosisId) {
      endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lab-reports/diagnosis/${diagnosisId}`;
    }

    const response = await fetch(endpoint, {
      headers: createBackendHeaders(accessToken),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch lab reports' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching lab reports:', error);
    return NextResponse.json({ error: 'Failed to fetch lab reports' }, { status: 500 });
  }
}

// POST - Upload a new lab report
export async function POST(req: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(req);
    
    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const diagnosisId = formData.get('diagnosis_id') as string;
    const appointmentId = formData.get('appointment_id') as string;
    const patientId = formData.get('patient_id') as string;
    const reportName = formData.get('report_name') as string;
    const reportType = formData.get('report_type') as string || 'lab_test';
    const testName = formData.get('test_name') as string;
    const testDate = formData.get('test_date') as string;
    const labName = formData.get('lab_name') as string;
    const notes = formData.get('notes') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!patientId) {
      return NextResponse.json({ error: 'patient_id is required' }, { status: 400 });
    }

    // Validate file type (allow images and PDFs)
    const contentType = file.type;
    if (!contentType.startsWith('image/') && contentType !== 'application/pdf') {
      return NextResponse.json({ error: 'Only images and PDFs are allowed' }, { status: 400 });
    }

    // Check file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max size: 20MB' }, { status: 400 });
    }

    // Forward to backend
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('patient_id', patientId);
    if (diagnosisId) uploadFormData.append('diagnosis_id', diagnosisId);
    if (appointmentId) uploadFormData.append('appointment_id', appointmentId);
    uploadFormData.append('report_name', reportName || file.name);
    uploadFormData.append('report_type', reportType);
    if (testName) uploadFormData.append('test_name', testName);
    if (testDate) uploadFormData.append('test_date', testDate);
    if (labName) uploadFormData.append('lab_name', labName);
    if (notes) uploadFormData.append('notes', notes);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lab-reports/upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: uploadFormData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error || 'Failed to upload lab report' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error uploading lab report:', error);
    return NextResponse.json({ error: 'Failed to upload lab report' }, { status: 500 });
  }
}
