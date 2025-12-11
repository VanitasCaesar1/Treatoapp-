'use client';

import Link from 'next/link';
import { Star, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Doctor } from '@/lib/types/doctor';
import { useHaptics } from '@/lib/hooks/use-haptics';

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const { medium, selectionChanged } = useHaptics();
  const fullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Unknown Doctor';
  const initials = `${doctor.firstName?.[0] || ''}${doctor.lastName?.[0] || ''}`.toUpperCase() || 'DR';

  // Handle different field names from backend
  const specialty = doctor.specialty || (doctor.specialization && doctor.specialization[0]) || 'General';
  const experience = doctor.experience || doctor.years_of_experience || doctor.yearsOfExperience || 0;
  const profileImage = doctor.profileImage || doctor.profile_image;
  const rating = doctor.rating || 0;
  const price = doctor.price;
  const distance = (doctor as any).distance;

  // Use actual availability data from backend if available
  // available_slots_today comes from the search API
  const availableSlotsToday = (doctor as any).available_slots_today ?? (doctor as any).availableSlotsToday;
  const nextAvailableDate = (doctor as any).next_available_date ?? (doctor as any).nextAvailableDate;
  const isAvailableToday = availableSlotsToday !== undefined ? availableSlotsToday > 0 : (doctor as any).is_available_today;

  const handleBookPress = (e: React.MouseEvent) => {
    e.preventDefault();
    medium();
    window.location.href = `/book-appointment/${doctor.id}`;
  };

  return (
    <Link href={`/doctor/${doctor.id}`} className="block group">
      <div
        className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all duration-200 relative overflow-hidden"
        role="article"
        aria-label={`Doctor profile for ${fullName}`}
        onClick={() => selectionChanged()}
      >
        {/* Top Badge Section */}
        <div className="flex justify-between items-start mb-3">
          {isAvailableToday ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide border border-green-100">
              <Clock className="h-3 w-3" />
              {availableSlotsToday ? `${availableSlotsToday} slots today` : 'Available Today'}
            </span>
          ) : nextAvailableDate ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide border border-amber-100">
              <Clock className="h-3 w-3" />
              Next: {new Date(nextAvailableDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wide border border-gray-100">
              <Clock className="h-3 w-3" />
              Check Availability
            </span>
          )}

          {rating >= 4.8 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-bold uppercase tracking-wide border border-yellow-100">
              <ShieldCheck className="h-3 w-3" />
              Top Rated
            </span>
          )}
        </div>

        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-20 w-20 rounded-2xl ring-4 ring-gray-50 shadow-sm group-hover:ring-blue-50 transition-all">
              <AvatarImage src={profileImage} alt={`${fullName}'s profile picture`} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-medical-blue font-bold text-xl rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 truncate pr-2">
              {fullName}
            </h3>
            <p className="text-medical-blue font-medium text-sm mb-2">{specialty}</p>

            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium flex-wrap">
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-gray-900">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
              </div>

              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>

              <span>{experience} yrs exp</span>

              {distance !== undefined && (
                <>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <Navigation className="h-3 w-3" />
                    {distance < 1 
                      ? `${Math.round(distance * 1000)}m`
                      : `${distance} km`
                    }
                  </span>
                </>
              )}

              {!distance && doctor.location && (
                <>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="truncate max-w-[80px]">{doctor.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-400 font-medium">
            {price ? (
              <>
                Starts from <span className="text-gray-900 font-bold text-sm">₹{price}</span>
              </>
            ) : (
              <span className="text-gray-500 font-medium text-sm">Fee on Request</span>
            )}
          </div>
          <Button
            size="sm"
            className="rounded-full px-6 bg-medical-blue hover:bg-medical-blue-dark shadow-md shadow-blue-100 font-semibold h-9"
            onClick={handleBookPress}
          >
            Book Appointment
          </Button>
        </div>
      </div>
    </Link>
  );
}
