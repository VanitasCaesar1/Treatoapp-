import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star } from 'lucide-react';
import Link from 'next/link';

interface DoctorCardProps {
    doctor: {
        id: string;
        name: string;
        specialty: string;
        qualification: string;
        hospitalName: string;
        hospitalId?: string;
        orgId?: string;
        image?: string;
        slotDuration: number;
        location?: string;
    };
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
    const orgId = doctor.hospitalId || doctor.orgId;
    const bookingUrl = orgId
        ? `/book-appointment/${doctor.id}?org_id=${orgId}`
        : `/book-appointment/${doctor.id}`;

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex items-start gap-3">
                <Avatar className="h-16 w-16 border-2 border-gray-100">
                    <AvatarImage src={doctor.image} alt={doctor.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                        {doctor.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{doctor.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{doctor.specialty}</p>
                    <p className="text-xs text-gray-500 truncate">{doctor.qualification}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{doctor.hospitalName}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{doctor.slotDuration} min</span>
                </div>
                <Link href={bookingUrl} className="w-full ml-4">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        Book Now
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default DoctorCard;
