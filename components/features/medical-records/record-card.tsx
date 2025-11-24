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
    <div className="group bg-white rounded-airbnb-lg border border-gray-100 shadow-airbnb-card hover:shadow-airbnb-hover transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-medical-blue-50 rounded-md">
                <FileText className="h-4 w-4 text-medical-blue" />
              </div>
              <h3 className="font-bold text-gray-900">{encounter.encounterType}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium pl-1">
              <Calendar className="h-3 w-3" />
              <span>{format(parseISO(encounter.encounterDate), 'MMM dd, yyyy')}</span>
            </div>
          </div>
          <Badge variant="outline" className="border-gray-200 text-gray-600 font-medium">
            {encounter.encounterType}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Chief Complaint</p>
            <p className="text-sm text-gray-700 leading-relaxed">{encounter.chiefComplaint}</p>
          </div>

          {encounter.diagnosis && encounter.diagnosis.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Diagnosis</p>
              <div className="flex flex-wrap gap-2">
                {encounter.diagnosis.map((diag, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100">
                    {diag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {encounter.prescriptions && encounter.prescriptions.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-medical-blue bg-medical-blue-50/50 p-2 rounded-lg">
              <Pill className="h-4 w-4" />
              <span className="font-medium">{encounter.prescriptions.length} prescription(s)</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
          <Link
            href={`/medical-records/${encounter.id}`}
            className="text-sm font-bold text-medical-blue hover:text-medical-blue-dark transition-colors flex items-center gap-1 active:scale-95"
          >
            View Details
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
