'use client';

import { Star, MapPin, Award, GraduationCap, Languages, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Doctor } from '@/lib/types/doctor';

interface DoctorProfileHeaderProps {
  doctor: Doctor;
}

export function DoctorProfileHeader({ doctor }: DoctorProfileHeaderProps) {
  const fullName = `${doctor.firstName} ${doctor.lastName}`;
  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="h-32 w-32">
            <AvatarImage src={doctor.profileImage} alt={fullName} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">{fullName}</h1>
              <p className="text-xl text-muted-foreground">{doctor.specialty}</p>
            </div>

            {doctor.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">
                    {doctor.rating.toFixed(1)}
                  </span>
                </div>
                {doctor.reviewCount && (
                  <span className="text-muted-foreground">
                    ({doctor.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {doctor.subSpecialties?.map((subspecialty) => (
                <Badge key={subspecialty} variant="secondary">
                  {subspecialty}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-2">
                <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.yearsOfExperience} years
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">License</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.licenseNumber}
                  </p>
                </div>
              </div>

              {doctor.languages && doctor.languages.length > 0 && (
                <div className="flex items-start gap-2">
                  <Languages className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Languages</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.languages.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {doctor.hospitalAffiliations && doctor.hospitalAffiliations.length > 0 && (
                <div className="flex items-start gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Hospital Affiliations</p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.hospitalAffiliations.slice(0, 2).join(', ')}
                      {doctor.hospitalAffiliations.length > 2 &&
                        ` +${doctor.hospitalAffiliations.length - 2} more`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {doctor.bio && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-muted-foreground">{doctor.bio}</p>
          </div>
        )}

        {doctor.education && doctor.education.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-3">Education</h2>
            <ul className="space-y-2">
              {doctor.education.map((edu, index) => (
                <li key={index} className="flex items-start gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="text-sm">{edu}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
