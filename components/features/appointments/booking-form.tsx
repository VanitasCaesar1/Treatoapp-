'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimeSlotPicker } from './time-slot-picker';
import { useCreateAppointment } from '@/lib/hooks/use-appointments';
import { useDoctorSchedules } from '@/lib/hooks/use-doctors';
import { ConsultationType } from '@/lib/types/appointment';
import { DoctorSchedule } from '@/lib/types/doctor';
import { toast } from 'react-hot-toast';
import { Calendar, Video, Phone, MapPin } from 'lucide-react';

interface BookingFormProps {
  doctorId: string;
  doctorName: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function BookingForm({ doctorId, doctorName }: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [consultationType, setConsultationType] = useState<ConsultationType>('video');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const { data: schedules, isLoading: schedulesLoading } = useDoctorSchedules(doctorId);
  const { mutate: createAppointment, isPending } = useCreateAppointment({
    onSuccess: (data) => {
      toast.success('Appointment booked successfully!');
      router.push(`/appointments/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to book appointment');
    },
  });

  // Generate time slots based on selected date and doctor's schedule
  useEffect(() => {
    if (!selectedDate || !schedules) {
      setAvailableSlots([]);
      return;
    }

    const dayOfWeek = selectedDate.getDay();
    const schedule = schedules.find(
      (s: DoctorSchedule) => s.dayOfWeek === dayOfWeek && s.isAvailable
    );

    if (!schedule) {
      setAvailableSlots([]);
      return;
    }

    // Generate time slots based on schedule
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    const slotDuration = schedule.slotDuration || 30;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      
      // For demo purposes, mark some slots as unavailable randomly
      // In production, this would come from the backend
      const available = Math.random() > 0.3;
      
      slots.push({
        time: timeString,
        available,
      });

      currentMinute += slotDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    setAvailableSlots(slots);
  }, [selectedDate, schedules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the appointment');
      return;
    }

    const appointmentDate = selectedDate.toISOString().split('T')[0];

    createAppointment({
      doctorId,
      appointmentDate,
      appointmentTime: selectedTime,
      duration: 30,
      consultationType,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Appointment booking form">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>
            Booking appointment with {doctorName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consultation-type">Consultation Type</Label>
            <Select
              value={consultationType}
              onValueChange={(value) => setConsultationType(value as ConsultationType)}
            >
              <SelectTrigger id="consultation-type" aria-label="Select consultation type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" aria-hidden="true" />
                    Video Consultation
                  </div>
                </SelectItem>
                <SelectItem value="in-person">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    In-Person Visit
                  </div>
                </SelectItem>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    Phone Call
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit *</Label>
            <Input
              id="reason"
              placeholder="e.g., Annual checkup, Follow-up consultation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              aria-required="true"
              aria-invalid={!reason.trim() ? 'true' : 'false'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional information for the doctor"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-describedby="notes-description"
            />
            <p id="notes-description" className="sr-only">
              Optional field for any additional information you want to share with the doctor
            </p>
          </div>
        </CardContent>
      </Card>

      <TimeSlotPicker
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        availableSlots={availableSlots}
        isLoading={schedulesLoading}
      />

      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending || !selectedDate || !selectedTime}
          className="w-full sm:w-auto"
          aria-label={isPending ? 'Booking appointment...' : 'Book appointment'}
        >
          {isPending ? 'Booking...' : 'Book Appointment'}
        </Button>
      </div>
    </form>
  );
}
