'use client';

import { useState } from 'react';
import { X, Clock, Calendar, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { showToast } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image?: string;
  consultation_fee: number;
  rating?: number;
  review_count?: number;
}

interface TimeSlot {
  id: string;
  time: string;
  date: string;
  available: boolean;
}

interface QuickBookModalProps {
  doctor: Doctor;
  open: boolean;
  onClose: () => void;
  source?: 'feed' | 'profile' | 'explore' | 'post';
}

export function QuickBookModal({ doctor, open, onClose, source = 'profile' }: QuickBookModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([
    // Mock data - replace with API call
    { id: '1', time: '10:00 AM', date: 'Today', available: true },
    { id: '2', time: '11:30 AM', date: 'Today', available: true },
    { id: '3', time: '2:00 PM', date: 'Today', available: true },
    { id: '4', time: '4:30 PM', date: 'Today', available: false },
    { id: '5', time: '10:00 AM', date: 'Tomorrow', available: true },
    { id: '6', time: '3:00 PM', date: 'Tomorrow', available: true },
  ]);

  const platformFee = 20;
  const total = doctor.consultation_fee + platformFee;

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      setLoading(true);

      // Track booking source
      await api.post('/appointments/book', {
        doctor_id: doctor.id,
        slot_id: selectedSlot.id,
        source: source,
        amount: total,
      });

      showToast.success('Appointment booked successfully!', 'booking-success');
      onClose();

      // Redirect to appointments page
      setTimeout(() => {
        window.location.href = '/appointments';
      }, 1000);
    } catch (error: any) {
      console.error('Booking failed:', error);
      showToast.error(error.response?.data?.error || 'Failed to book appointment', 'booking-error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Book Appointment</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Doctor Summary */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Avatar className="h-14 w-14 ring-2 ring-white">
              <AvatarImage src={doctor.image} alt={doctor.name} />
              <AvatarFallback className="bg-medical-blue text-white text-lg">
                {doctor.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Dr. {doctor.name}</p>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
              {doctor.rating && (
                <p className="text-xs text-gray-600 mt-0.5">
                  ⭐ {doctor.rating} ({doctor.review_count || 0} reviews)
                </p>
              )}
            </div>
          </div>

          {/* Available Slots */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-medical-blue" />
              <p className="font-semibold text-gray-900">Select Time Slot</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && setSelectedSlot(slot)}
                  disabled={!slot.available}
                  className={cn(
                    'p-3 rounded-xl border-2 text-sm transition-all',
                    selectedSlot?.id === slot.id
                      ? 'border-medical-blue bg-blue-50 text-medical-blue'
                      : slot.available
                      ? 'border-gray-200 hover:border-gray-300 text-gray-700'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Clock className="h-3 w-3" />
                    {selectedSlot?.id === slot.id && (
                      <Check className="h-4 w-4 text-medical-blue" />
                    )}
                  </div>
                  <p className="font-semibold">{slot.time}</p>
                  <p className="text-xs opacity-75">{slot.date}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="font-semibold text-gray-900 mb-2">Payment Summary</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Consultation Fee</span>
                <span>₹{doctor.consultation_fee}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-blue-200">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-700 mb-1">Cancellation Policy</p>
            <p>Free cancellation up to 2 hours before appointment. Late cancellations will incur a ₹100 fee.</p>
          </div>

          {/* Book Button */}
          <Button
            onClick={handleBooking}
            disabled={!selectedSlot || loading}
            className="w-full bg-medical-blue hover:bg-blue-700 text-white h-12 rounded-xl font-semibold"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Booking...
              </>
            ) : (
              <>Confirm Booking - ₹{total}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
