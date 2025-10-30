'use client';

import { MedicalEncounter } from '@/lib/types/medical-record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Pill, Stethoscope, User, ClipboardList } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface EncounterDetailsProps {
  encounter: MedicalEncounter;
}

export function EncounterDetails({ encounter }: EncounterDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{encounter.encounterType}</CardTitle>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(encounter.encounterDate), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {encounter.encounterType}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Chief Complaint */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Chief Complaint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base">{encounter.chiefComplaint}</p>
        </CardContent>
      </Card>

      {/* Diagnosis */}
      {encounter.diagnosis && encounter.diagnosis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {encounter.diagnosis.map((diag, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  <p className="flex-1">{diag}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment */}
      {encounter.treatment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{encounter.treatment}</p>
          </CardContent>
        </Card>
      )}

      {/* Prescriptions */}
      {encounter.prescriptions && encounter.prescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Prescriptions ({encounter.prescriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {encounter.prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-base">{prescription.medicineName}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Medicine ID: {prescription.medicineId}
                      </p>
                    </div>
                    <Badge variant="secondary">Prescribed</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dosage</p>
                      <p className="font-medium">{prescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Frequency</p>
                      <p className="font-medium">{prescription.frequency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{prescription.duration}</p>
                    </div>
                  </div>

                  {prescription.instructions && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                      <p className="text-sm">{prescription.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up and Notes */}
      <div className="grid gap-6 md:grid-cols-2">
        {encounter.followUpDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Follow-up Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {format(parseISO(encounter.followUpDate), 'MMMM dd, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Scheduled follow-up date
              </p>
            </CardContent>
          </Card>
        )}

        {encounter.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{encounter.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
