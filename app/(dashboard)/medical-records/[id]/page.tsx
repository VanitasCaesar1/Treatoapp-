'use client';

import { useEncounter, useMedicalHistory } from '@/lib/hooks/use-medical-records';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EncounterDetails } from '@/components/features/medical-records/encounter-details';
import { VitalsChart } from '@/components/features/medical-records/vitals-chart';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface MedicalRecordDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function MedicalRecordDetailsPage({
  params,
}: MedicalRecordDetailsPageProps) {
  const { id } = use(params);
  
  const { data: encounter, isLoading, error, refetch } = useEncounter(id);
  
  // Also fetch vitals for the patient to show trends
  const { data: medicalHistory } = useMedicalHistory(
    encounter?.patientId || 'current'
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/medical-records">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Medical Records
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !encounter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/medical-records">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Medical Records
            </Link>
          </Button>
        </div>
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : 'Failed to load medical record details'
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/medical-records">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Medical Records
          </Link>
        </Button>
      </div>

      {/* Encounter Details */}
      <EncounterDetails encounter={encounter} />

      {/* Vitals Chart */}
      {medicalHistory?.vitals && medicalHistory.vitals.length > 0 && (
        <div className="pt-6">
          <h2 className="text-2xl font-bold mb-6">Vital Signs History</h2>
          <VitalsChart vitals={medicalHistory.vitals} />
        </div>
      )}
    </div>
  );
}
