import { NextRequest, NextResponse } from 'next/server';
import { withAuth, createBackendHeaders } from '@/lib/auth/api-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { accessToken } = await withAuth(request);

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: appointmentId } = await params;

    const response = await fetch(
      `${API_BASE_URL}/api/v1/appointments/${appointmentId}/prescription`,
      { headers: createBackendHeaders(accessToken) }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
      }
      throw new Error('Failed to fetch prescription');
    }

    const data = await response.json();

    // Transform backend data to frontend format
    const prescription = {
      id: data.prescription_id || `RX-${appointmentId.slice(-6).toUpperCase()}`,
      date: data.appointment_date || data.created_at,
      doctor: {
        name: data.doctor_name || 'Doctor',
        specialty: data.doctor_specialty || 'General Medicine',
        regNo: data.doctor_registration_number || 'N/A',
        hospital: data.hospital_name || 'Medical Clinic',
        phone: data.doctor_phone,
      },
      patient: {
        name: data.patient_name || 'Patient',
        age: data.patient_age || 0,
        gender: data.patient_gender || 'N/A',
        id: data.patient_id?.slice(-8).toUpperCase() || 'N/A',
      },
      diagnosis: data.diagnosis || data.diagnosis_info?.[0]?.condition || 'N/A',
      vitals: {
        bp: data.vitals?.blood_pressure,
        pulse: data.vitals?.heart_rate ? `${data.vitals.heart_rate} bpm` : undefined,
        weight: data.vitals?.weight ? `${data.vitals.weight} kg` : undefined,
        temperature: data.vitals?.temperature ? `${data.vitals.temperature}°F` : undefined,
        spo2: data.vitals?.oxygen_saturation ? `${data.vitals.oxygen_saturation}%` : undefined,
      },
      medications: (data.medications || data.treatment_plan?.medications || []).map((med: any) => ({
        name: med.name || med.medicine_name,
        dosage: med.dosage || med.dose,
        frequency: med.frequency || med.timing,
        duration: med.duration || `${med.days || 0} days`,
        instructions: med.instructions || med.notes,
      })),
      advice: data.advice || data.treatment_plan?.follow_up?.notes?.split('\n').filter(Boolean) || [],
    };

    return NextResponse.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    return NextResponse.json({ error: 'Failed to fetch prescription' }, { status: 500 });
  }
}
