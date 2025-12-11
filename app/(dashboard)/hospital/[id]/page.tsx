'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, MapPin, Phone, Clock, Star, ChevronRight, Loader2, Calendar, Users, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  specialty: string;
  qualification?: string;
  experience?: number;
  rating?: number;
  image?: string;
  available_slots?: string[];
  consultation_fee?: number;
}

interface Hospital {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  rating?: number;
  total_reviews?: number;
  image?: string;
  specialties?: string[];
  facilities?: string[];
  timings?: string;
  doctors?: Doctor[];
}

export default function HospitalPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.id as string;

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/hospitals/${hospitalId}`);
        setHospital(data.hospital || data);
        
        // Fetch doctors for this hospital
        const doctorsData = await api.get('/doctors/search', { hospital_id: hospitalId, limit: 50 });
        setDoctors(doctorsData.doctors || []);
      } catch (error) {
        console.error('Failed to fetch hospital:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hospitalId) {
      fetchHospital();
    }
  }, [hospitalId]);

  // Get unique specialties from doctors
  const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];

  // Filter doctors by specialty
  const filteredDoctors = selectedSpecialty
    ? doctors.filter(d => d.specialty === selectedSpecialty)
    : doctors;

  if (loading) {
    return (
      <div className="min-h-screen pb-24 p-4 space-y-4">
        <SkeletonCard className="h-48 rounded-3xl" />
        <SkeletonCard className="h-24 rounded-2xl" />
        <SkeletonCard className="h-32 rounded-2xl" />
        <SkeletonCard className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen pb-24 p-4 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Hospital not found</h3>
          <p className="text-sm text-gray-500 mb-4">The hospital you're looking for doesn't exist</p>
          <Button onClick={() => router.back()} variant="outline" className="rounded-full">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hospital Header Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-xl mb-1">{hospital.name}</h1>
              {hospital.address && (
                <p className="text-blue-100 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {hospital.address}{hospital.city && `, ${hospital.city}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {hospital.rating && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                <span className="font-semibold text-sm">{hospital.rating}</span>
                {hospital.total_reviews && (
                  <span className="text-blue-100 text-xs">({hospital.total_reviews})</span>
                )}
              </div>
            )}
            {hospital.timings && (
              <div className="flex items-center gap-1 text-blue-100 text-sm">
                <Clock className="h-4 w-4" />
                {hospital.timings}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {hospital.phone && (
            <a href={`tel:${hospital.phone}`}>
              <Button variant="outline" className="w-full rounded-2xl h-14 justify-start gap-3">
                <div className="p-2 bg-green-50 rounded-xl">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500">Call</p>
                  <p className="text-sm font-semibold text-gray-900">Hospital</p>
                </div>
              </Button>
            </a>
          )}
          <Link href={`/search?hospital=${hospitalId}`}>
            <Button variant="outline" className="w-full rounded-2xl h-14 justify-start gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500">Book</p>
                <p className="text-sm font-semibold text-gray-900">Appointment</p>
              </div>
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{doctors.length}</p>
            <p className="text-xs text-gray-500">Doctors</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
            <Stethoscope className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{specialties.length}</p>
            <p className="text-xs text-gray-500">Specialties</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
            <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{hospital.rating || 'N/A'}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
        </div>

        {/* Specialties Filter */}
        {specialties.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Specialties</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => setSelectedSpecialty(null)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  !selectedSpecialty
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                All ({doctors.length})
              </button>
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                    selectedSpecialty === specialty
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {specialty} ({doctors.filter(d => d.specialty === specialty).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Doctors List */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">
            {selectedSpecialty ? `${selectedSpecialty} Doctors` : 'All Doctors'} ({filteredDoctors.length})
          </h2>

          {filteredDoctors.length > 0 ? (
            <div className="space-y-3">
              {filteredDoctors.map((doctor) => (
                <Link key={doctor.id} href={`/search/${doctor.id}`}>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={doctor.image} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                          {(doctor.firstName || doctor.name)?.[0] || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          Dr. {doctor.firstName || doctor.name} {doctor.lastName || ''}
                        </h3>
                        <p className="text-sm text-blue-600">{doctor.specialty}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {doctor.experience && (
                            <span className="text-xs text-gray-500">{doctor.experience} yrs exp</span>
                          )}
                          {doctor.rating && (
                            <span className="text-xs text-gray-500 flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {doctor.rating}
                            </span>
                          )}
                          {doctor.consultation_fee && (
                            <span className="text-xs font-medium text-green-600">₹{doctor.consultation_fee}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Stethoscope className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No doctors found</p>
            </div>
          )}
        </div>

        {/* Facilities */}
        {hospital.facilities && hospital.facilities.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Facilities</h2>
            <div className="flex flex-wrap gap-2">
              {hospital.facilities.map((facility, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
