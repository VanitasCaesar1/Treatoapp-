'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { RecordCard } from '@/components/features/medical-records/record-card';
import { MedicalHistoryTimeline } from '@/components/features/medical-records/medical-history-timeline';
import { Activity, FileText, Heart, Thermometer, Wind, AlertCircle, Loader2, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { showToast } from '@/lib/utils/toast';
import { Button } from '@/components/ui/button';
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MedicalRecordsPage() {
  const [activeTab, setActiveTab] = useState('encounters');
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicalRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from real backend
      const patientId = 'current'; // Backend should handle 'current' or get from JWT
      const [encounters, vitals, history] = await Promise.all([
        apiClient.getPatientEncounters(patientId),
        apiClient.getPatientVitals(patientId),
        apiClient.getPatientMedicalHistory(patientId)
      ]);

      setMedicalHistory({
        encounters: encounters || [],
        vitals: vitals || [],
        allergies: (history as any)?.allergies || [],
        medicalConditions: (history as any)?.medicalConditions || []
      });
    } catch (error: any) {
      console.error('Failed to load medical records:', error);
      setError(error.message || 'Unable to connect to server');
      showToast.error('Failed to load medical records', 'records-error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicalRecords();
  }, [fetchMedicalRecords]);

  const { containerRef, isRefreshing } = usePullToRefresh({
    onRefresh: fetchMedicalRecords,
  });

  if (error && !medicalHistory) {
    return (
      <ErrorDisplay
        title="Can't Load Records"
        message="Unable to access your medical records right now. Please try again."
        onRetry={() => window.location.reload()}
        variant="page"
      />
    );
  }

  const encounters = medicalHistory?.encounters || [];
  const vitals = medicalHistory?.vitals || [];
  const allergies = medicalHistory?.allergies || [];
  const medicalConditions = medicalHistory?.medicalConditions || [];

  return (
    <div ref={containerRef} className="min-h-[calc(100vh-140px)] pb-20 space-y-6">
      {/* Pull to refresh indicator */}
      <div className={cn(
        "flex justify-center items-center h-8 overflow-hidden transition-all duration-300",
        isRefreshing ? "opacity-100 mb-4" : "opacity-0 h-0 mb-0"
      )}>
        <Loader2 className="h-5 w-5 animate-spin text-medical-blue" />
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Medical Records</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            History & Vital Signs
          </p>
        </div>
        <Button className="rounded-full bg-medical-blue hover:bg-medical-blue-dark shadow-medical hover:shadow-medical-lg transition-all active:scale-95 h-10 w-10 p-0 sm:w-auto sm:px-4 sm:py-2">
          <Plus className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Add Record</span>
        </Button>
      </div>

      {/* Medical Conditions and Allergies */}
      {(medicalConditions.length > 0 || allergies.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2 animate-slide-up">
          {medicalConditions.length > 0 && (
            <div className="bg-white rounded-airbnb-lg p-5 border border-gray-100 shadow-airbnb-card">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-medical-blue" />
                <h3 className="font-semibold text-gray-900">Medical Conditions</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {medicalConditions.map((condition: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {allergies.length > 0 && (
            <div className="bg-white rounded-airbnb-lg p-5 border border-gray-100 shadow-airbnb-card">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <h3 className="font-semibold text-gray-900">Allergies</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy: string, index: number) => (
                  <Badge key={index} variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100 shadow-none">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs for Encounters and Vitals */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100/80 p-1 rounded-xl">
          <TabsTrigger
            value="encounters"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-medical-blue data-[state=active]:shadow-sm transition-all duration-200 font-medium"
          >
            Encounters ({encounters.length})
          </TabsTrigger>
          <TabsTrigger
            value="vitals"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 font-medium"
          >
            Vital Signs ({vitals.length})
          </TabsTrigger>
        </TabsList>

        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard className="h-48" />
              <SkeletonCard className="h-48" />
            </div>
          ) : (
            <>
              <TabsContent value="encounters" className="space-y-6 mt-0 focus-visible:outline-none">
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
                      {encounters.slice(0, 6).map((encounter: any) => (
                        <RecordCard key={encounter.id} encounter={encounter} />
                      ))}
                    </div>

                    {/* Timeline view */}
                    {encounters.length > 0 && (
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Timeline</h2>
                        <MedicalHistoryTimeline encounters={encounters} />
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="vitals" className="space-y-6 mt-0 focus-visible:outline-none">
                {vitals.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No Vital Signs Recorded"
                    description="You don't have any recorded vital signs yet."
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {vitals.map((vital: any) => (
                      <div key={vital.id} className="bg-white rounded-airbnb-lg p-5 border border-gray-100 shadow-airbnb-card hover:shadow-airbnb-hover transition-all duration-200">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                          <h3 className="font-semibold text-gray-900">
                            {format(parseISO(vital.recordedAt), 'MMM dd, yyyy')}
                          </h3>
                          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                            {format(parseISO(vital.recordedAt), 'h:mm a')}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-red-50 rounded-md">
                                  <Activity className="h-3.5 w-3.5 text-red-500" />
                                </div>
                                <span className="text-sm text-gray-600">Blood Pressure</span>
                              </div>
                              <span className="font-semibold text-gray-900">
                                {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                              </span>
                            </div>
                          )}

                          {vital.heartRate && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-pink-50 rounded-md">
                                  <Heart className="h-3.5 w-3.5 text-pink-500" />
                                </div>
                                <span className="text-sm text-gray-600">Heart Rate</span>
                              </div>
                              <span className="font-semibold text-gray-900">{vital.heartRate} bpm</span>
                            </div>
                          )}

                          {vital.temperature && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-orange-50 rounded-md">
                                  <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                                </div>
                                <span className="text-sm text-gray-600">Temperature</span>
                              </div>
                              <span className="font-semibold text-gray-900">{vital.temperature}°F</span>
                            </div>
                          )}

                          {vital.oxygenSaturation && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 rounded-md">
                                  <Wind className="h-3.5 w-3.5 text-blue-500" />
                                </div>
                                <span className="text-sm text-gray-600">Oxygen Saturation</span>
                              </div>
                              <span className="font-semibold text-gray-900">{vital.oxygenSaturation}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
}
