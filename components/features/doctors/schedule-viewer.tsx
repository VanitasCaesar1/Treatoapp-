'use client';

import { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoctorSchedule, ConsultationFee } from '@/lib/types/doctor';

interface ScheduleViewerProps {
  schedules: DoctorSchedule[];
  fees?: ConsultationFee[];
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function ScheduleViewer({ schedules, fees }: ScheduleViewerProps) {
  const schedulesByDay = useMemo(() => {
    const grouped: Record<number, DoctorSchedule[]> = {};
    schedules.forEach((schedule) => {
      if (!grouped[schedule.dayOfWeek]) {
        grouped[schedule.dayOfWeek] = [];
      }
      grouped[schedule.dayOfWeek].push(schedule);
    });
    return grouped;
  }, [schedules]);

  const formatTime = (time: string) => {
    // Assuming time is in HH:MM format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No schedule information available
            </p>
          ) : (
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day, index) => {
                const daySchedules = schedulesByDay[index] || [];
                const hasSchedule = daySchedules.length > 0;

                return (
                  <div
                    key={day}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="w-28 font-medium text-sm">{day}</div>
                    <div className="flex-1">
                      {hasSchedule ? (
                        <div className="space-y-2">
                          {daySchedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {formatTime(schedule.startTime)} -{' '}
                                {formatTime(schedule.endTime)}
                              </span>
                              <Badge
                                variant={
                                  schedule.isAvailable ? 'default' : 'secondary'
                                }
                                className="ml-2"
                              >
                                {schedule.isAvailable ? 'Available' : 'Unavailable'}
                              </Badge>
                              <span className="text-muted-foreground">
                                ({schedule.slotDuration} min slots)
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Not available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {fees && fees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Consultation Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fees.map((fee) => (
                <div
                  key={fee.id}
                  className="flex justify-between items-center pb-3 border-b last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium capitalize">
                    {fee.consultationType.replace('-', ' ')}
                  </span>
                  <span className="text-lg font-semibold">
                    {fee.currency} {fee.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
