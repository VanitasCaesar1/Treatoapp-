'use client';

import { MedicalEncounter } from '@/lib/types/medical-record';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Pill, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RecordCardProps {
  encounter: MedicalEncounter;
}

export function RecordCard({ encounter }: RecordCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{encounter.encounterType}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(parseISO(encounter.encounterDate), 'MMM dd, yyyy')}</span>
            </div>
          </div>
          <Badge variant="outline">{encounter.encounterType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Chief Complaint</p>
          <p className="text-sm">{encounter.chiefComplaint}</p>
        </div>

        {encounter.diagnosis && encounter.diagnosis.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Diagnosis</p>
            <div className="flex flex-wrap gap-2">
              {encounter.diagnosis.map((diag, index) => (
                <Badge key={index} variant="secondary">
                  {diag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {encounter.prescriptions && encounter.prescriptions.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Pill className="h-4 w-4" />
            <span>{encounter.prescriptions.length} prescription(s)</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/medical-records/${encounter.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
