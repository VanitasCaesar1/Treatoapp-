'use client';

import { VitalSigns } from '@/lib/types/medical-record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Thermometer, Wind, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface VitalsChartProps {
  vitals: VitalSigns[];
}

export function VitalsChart({ vitals }: VitalsChartProps) {
  if (vitals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No vital signs data available to display trends
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort vitals by date (most recent first)
  const sortedVitals = [...vitals].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  // Get the most recent and previous vital signs for trend calculation
  const mostRecent = sortedVitals[0];
  const previous = sortedVitals[1];

  // Helper function to calculate trend
  const getTrend = (current?: number, prev?: number) => {
    if (!current || !prev) return null;
    const diff = current - prev;
    if (Math.abs(diff) < 0.01) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  // Helper function to render trend icon
  const TrendIcon = ({ trend }: { trend: string | null }) => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Current Vitals Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Vital Signs</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last recorded: {format(parseISO(mostRecent.recordedAt), 'MMM dd, yyyy h:mm a')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Blood Pressure */}
            {mostRecent.bloodPressureSystolic && mostRecent.bloodPressureDiastolic && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">Blood Pressure</span>
                  </div>
                  <TrendIcon
                    trend={getTrend(
                      mostRecent.bloodPressureSystolic,
                      previous?.bloodPressureSystolic
                    )}
                  />
                </div>
                <p className="text-2xl font-bold">
                  {mostRecent.bloodPressureSystolic}/{mostRecent.bloodPressureDiastolic}
                </p>
                <p className="text-xs text-muted-foreground">mmHg</p>
              </div>
            )}

            {/* Heart Rate */}
            {mostRecent.heartRate && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <span className="text-sm font-medium">Heart Rate</span>
                  </div>
                  <TrendIcon trend={getTrend(mostRecent.heartRate, previous?.heartRate)} />
                </div>
                <p className="text-2xl font-bold">{mostRecent.heartRate}</p>
                <p className="text-xs text-muted-foreground">bpm</p>
              </div>
            )}

            {/* Temperature */}
            {mostRecent.temperature && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <TrendIcon trend={getTrend(mostRecent.temperature, previous?.temperature)} />
                </div>
                <p className="text-2xl font-bold">{mostRecent.temperature}°</p>
                <p className="text-xs text-muted-foreground">Fahrenheit</p>
              </div>
            )}

            {/* Oxygen Saturation */}
            {mostRecent.oxygenSaturation && (
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Oxygen Saturation</span>
                  </div>
                  <TrendIcon
                    trend={getTrend(mostRecent.oxygenSaturation, previous?.oxygenSaturation)}
                  />
                </div>
                <p className="text-2xl font-bold">{mostRecent.oxygenSaturation}%</p>
                <p className="text-xs text-muted-foreground">SpO2</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historical Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Date</th>
                  {sortedVitals.some((v) => v.bloodPressureSystolic) && (
                    <th className="text-left py-3 px-2 font-medium">BP (mmHg)</th>
                  )}
                  {sortedVitals.some((v) => v.heartRate) && (
                    <th className="text-left py-3 px-2 font-medium">HR (bpm)</th>
                  )}
                  {sortedVitals.some((v) => v.temperature) && (
                    <th className="text-left py-3 px-2 font-medium">Temp (°F)</th>
                  )}
                  {sortedVitals.some((v) => v.oxygenSaturation) && (
                    <th className="text-left py-3 px-2 font-medium">SpO2 (%)</th>
                  )}
                  {sortedVitals.some((v) => v.respiratoryRate) && (
                    <th className="text-left py-3 px-2 font-medium">RR (/min)</th>
                  )}
                  {sortedVitals.some((v) => v.weight) && (
                    <th className="text-left py-3 px-2 font-medium">Weight (lbs)</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedVitals.map((vital) => (
                  <tr key={vital.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">
                      {format(parseISO(vital.recordedAt), 'MMM dd, yyyy')}
                    </td>
                    {sortedVitals.some((v) => v.bloodPressureSystolic) && (
                      <td className="py-3 px-2">
                        {vital.bloodPressureSystolic && vital.bloodPressureDiastolic
                          ? `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}`
                          : '-'}
                      </td>
                    )}
                    {sortedVitals.some((v) => v.heartRate) && (
                      <td className="py-3 px-2">{vital.heartRate || '-'}</td>
                    )}
                    {sortedVitals.some((v) => v.temperature) && (
                      <td className="py-3 px-2">{vital.temperature || '-'}</td>
                    )}
                    {sortedVitals.some((v) => v.oxygenSaturation) && (
                      <td className="py-3 px-2">{vital.oxygenSaturation || '-'}</td>
                    )}
                    {sortedVitals.some((v) => v.respiratoryRate) && (
                      <td className="py-3 px-2">{vital.respiratoryRate || '-'}</td>
                    )}
                    {sortedVitals.some((v) => v.weight) && (
                      <td className="py-3 px-2">{vital.weight || '-'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      {(mostRecent.weight || mostRecent.height || mostRecent.bmi || mostRecent.respiratoryRate) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {mostRecent.weight && (
                <div className="p-4 border rounded-lg space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Weight</span>
                  <p className="text-2xl font-bold">{mostRecent.weight}</p>
                  <p className="text-xs text-muted-foreground">lbs</p>
                </div>
              )}

              {mostRecent.height && (
                <div className="p-4 border rounded-lg space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Height</span>
                  <p className="text-2xl font-bold">{mostRecent.height}</p>
                  <p className="text-xs text-muted-foreground">inches</p>
                </div>
              )}

              {mostRecent.bmi && (
                <div className="p-4 border rounded-lg space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">BMI</span>
                  <p className="text-2xl font-bold">{mostRecent.bmi}</p>
                  <p className="text-xs text-muted-foreground">kg/m²</p>
                </div>
              )}

              {mostRecent.respiratoryRate && (
                <div className="p-4 border rounded-lg space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Respiratory Rate
                  </span>
                  <p className="text-2xl font-bold">{mostRecent.respiratoryRate}</p>
                  <p className="text-xs text-muted-foreground">breaths/min</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
