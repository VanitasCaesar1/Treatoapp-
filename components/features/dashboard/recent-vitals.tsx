'use client';

import { useMedicalHistory } from '@/lib/hooks/use-medical-records';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Activity, Heart, Thermometer, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { withAuth } from '@workos-inc/authkit-nextjs';

export function RecentVitals() {
  // For now, we'll use a placeholder patient ID
  // In a real app, this would come from the user session
  const { data: medicalHistory, isLoading, error, refetch } = useMedicalHistory('current');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorMessage 
            message={error instanceof Error ? error.message : 'Failed to load vital signs'} 
            onRetry={refetch} 
          />
        </CardContent>
      </Card>
    );
  }

  // Get the most recent vital signs
  const recentVitals = medicalHistory?.vitals?.[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Vitals</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/medical-records">View History</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!recentVitals ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No vital signs recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Last recorded: {format(parseISO(recentVitals.recordedAt), 'MMM dd, yyyy')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Blood Pressure */}
              {recentVitals.bloodPressureSystolic && recentVitals.bloodPressureDiastolic && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <Activity className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="text-lg font-semibold">
                      {recentVitals.bloodPressureSystolic}/{recentVitals.bloodPressureDiastolic}
                    </p>
                    <p className="text-xs text-muted-foreground">mmHg</p>
                  </div>
                </div>
              )}

              {/* Heart Rate */}
              {recentVitals.heartRate && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                    <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="text-lg font-semibold">{recentVitals.heartRate}</p>
                    <p className="text-xs text-muted-foreground">bpm</p>
                  </div>
                </div>
              )}

              {/* Temperature */}
              {recentVitals.temperature && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Thermometer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="text-lg font-semibold">{recentVitals.temperature}°</p>
                    <p className="text-xs text-muted-foreground">Fahrenheit</p>
                  </div>
                </div>
              )}

              {/* Oxygen Saturation */}
              {recentVitals.oxygenSaturation && (
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Oxygen Saturation</p>
                    <p className="text-lg font-semibold">{recentVitals.oxygenSaturation}%</p>
                    <p className="text-xs text-muted-foreground">SpO2</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
