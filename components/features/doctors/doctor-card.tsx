'use client';

import Link from 'next/link';
import { Star, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Doctor } from '@/lib/types/doctor';

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const fullName = `${doctor.firstName} ${doctor.lastName}`;
  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`;

  return (
    <Card 
      className="hover:shadow-lg transition-shadow"
      role="article"
      aria-label={`Doctor profile for ${fullName}`}
    >
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctor.profileImage} alt={`${fullName}'s profile picture`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{fullName}</h3>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>

            {doctor.rating && (
              <div className="flex items-center gap-1 text-sm" role="group" aria-label="Doctor rating">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                <span className="font-medium" aria-label={`Rating: ${doctor.rating.toFixed(1)} out of 5 stars`}>
                  {doctor.rating.toFixed(1)}
                </span>
                {doctor.reviewCount && (
                  <span className="text-muted-foreground" aria-label={`Based on ${doctor.reviewCount} reviews`}>
                    ({doctor.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2" role="list" aria-label="Subspecialties">
              {doctor.subSpecialties?.slice(0, 2).map((subspecialty) => (
                <Badge key={subspecialty} variant="secondary" role="listitem">
                  {subspecialty}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>{doctor.yearsOfExperience} years experience</span>
              </div>
              {doctor.languages && doctor.languages.length > 0 && (
                <span aria-label={`Languages spoken: ${doctor.languages.join(', ')}`}>
                  • {doctor.languages.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href={`/doctors/${doctor.id}`} aria-label={`View full profile of ${fullName}`}>
            View Profile
          </Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/appointments/book?doctorId=${doctor.id}`} aria-label={`Book appointment with ${fullName}`}>
            Book Appointment
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
