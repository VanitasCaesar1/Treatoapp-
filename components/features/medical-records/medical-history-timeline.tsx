'use client';

import { MedicalEncounter } from '@/lib/types/medical-record';
import { format, parseISO } from 'date-fns';
import { Calendar, FileText, Pill, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MedicalHistoryTimelineProps {
  encounters: MedicalEncounter[];
}

export function MedicalHistoryTimeline({ encounters }: MedicalHistoryTimelineProps) {
  if (encounters.length === 0) {
    return null;
  }

  return (
    <div className="relative space-y-8">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      {encounters.map((encounter, index) => (
        <div key={encounter.id} className="relative pl-12">
          {/* Timeline dot */}
          <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>

          {/* Content */}
          <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{encounter.encounterType}</h3>
                  <Badge variant="outline" className="text-xs">
                    {format(parseISO(encounter.encounterDate), 'MMM dd, yyyy')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{encounter.chiefComplaint}</p>
              </div>
            </div>

            {encounter.diagnosis && encounter.diagnosis.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Diagnosis</p>
                <div className="flex flex-wrap gap-1">
                  {encounter.diagnosis.map((diag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {diag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {encounter.treatment && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Treatment</p>
                <p className="text-sm">{encounter.treatment}</p>
              </div>
            )}

            {encounter.prescriptions && encounter.prescriptions.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Pill className="h-4 w-4" />
                <span>{encounter.prescriptions.length} prescription(s) prescribed</span>
              </div>
            )}

            {encounter.followUpDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="h-4 w-4" />
                <span>Follow-up: {format(parseISO(encounter.followUpDate), 'MMM dd, yyyy')}</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/medical-records/${encounter.id}`}>
                  View Full Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
