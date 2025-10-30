'use client';

import { useState } from 'react';
import { useMedicalHistory } from '@/lib/hooks/use-medical-records';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import { RecordCard } from '@/components/features/medical-records/record-card';
import { MedicalHistoryTimeline } from '@/components/features/medical-records/medical-history-timeline';
import { Activity, FileText, Heart, Thermometer, Wind, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function MedicalRecordsPage() {
  const [activeTab, setActiveTab] = useState('encounters');
  
  // For now, we'll use 'current' as the patient ID
  // In a real app, this would come from the user session
  const { data: medicalHistory, isLoading, error, refetch } = useMedicalHistory('current');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground mt-2">
            View your medical history, encounters, and vital signs
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground mt-2">
            View your medical history, encounters, and vital signs
          </p>
        </div>
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load medical records'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const encounters = medicalHistory?.encounters || [];
  const vitals = medicalHistory?.vitals || [];
  const allergies = medicalHistory?.allergies || [];
  const medicalConditions = medicalHistory?.medicalConditions || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <p className="text-muted-foreground mt-2">
          View your medical history, encounters, and vital signs
        </p>
      </div>

      {/* Medical Conditions and Allergies */}
      {(medicalConditions.length > 0 || allergies.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {medicalConditions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Medical Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {medicalConditions.map((condition, index) => (
                    <Badge key={index} variant="secondary">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {allergies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs for Encounters and Vitals */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="encounters">
            <FileText className="h-4 w-4 mr-2" />
            Encounters ({encounters.length})
          </TabsTrigger>
          <TabsTrigger value="vitals">
            <Activity className="h-4 w-4 mr-2" />
            Vital Signs ({vitals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encounters" className="space-y-6 mt-6">
          {encounters.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Medical Encounters"
              description="You don't have any recorded medical encounters yet."
            />
          ) : (
            <>
              {/* Grid view */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {encounters.slice(0, 6).map((encounter) => (
                  <RecordCard key={encounter.id} encounter={encounter} />
                ))}
              </div>

              {/* Timeline view */}
              {encounters.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Medical History Timeline</h2>
                  <MedicalHistoryTimeline encounters={encounters} />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6 mt-6">
          {vitals.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No Vital Signs Recorded"
              description="You don't have any recorded vital signs yet."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vitals.map((vital) => (
                <Card key={vital.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {format(parseISO(vital.recordedAt), 'MMM dd, yyyy')}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(vital.recordedAt), 'h:mm a')}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Blood Pressure</span>
                        </div>
                        <span className="font-semibold">
                          {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                        </span>
                      </div>
                    )}

                    {vital.heartRate && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-pink-500" />
                          <span className="text-sm">Heart Rate</span>
                        </div>
                        <span className="font-semibold">{vital.heartRate} bpm</span>
                      </div>
                    )}

                    {vital.temperature && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Temperature</span>
                        </div>
                        <span className="font-semibold">{vital.temperature}°F</span>
                      </div>
                    )}

                    {vital.oxygenSaturation && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Oxygen Saturation</span>
                        </div>
                        <span className="font-semibold">{vital.oxygenSaturation}%</span>
                      </div>
                    )}

                    {vital.respiratoryRate && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-cyan-500" />
                          <span className="text-sm">Respiratory Rate</span>
                        </div>
                        <span className="font-semibold">{vital.respiratoryRate} /min</span>
                      </div>
                    )}

                    {vital.weight && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Weight</span>
                        <span className="font-semibold">{vital.weight} lbs</span>
                      </div>
                    )}

                    {vital.bmi && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">BMI</span>
                        <span className="font-semibold">{vital.bmi}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
