'use client';

import React from 'react';
import { Search, MapPin, Building2, Stethoscope, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SearchResult {
    id: string;
    type: 'doctor' | 'hospital';
    name: string;
    subtitle: string;
    image?: string;
    distance?: number;
    rating?: number;
}

interface SearchResultsDropdownProps {
    results: {
        doctors: any[];
        hospitals: any[];
    };
    onSelect: () => void;
    query: string;
}

export function SearchResultsDropdown({ results, onSelect, query }: SearchResultsDropdownProps) {
    const doctors = results.doctors || [];
    const hospitals = results.hospitals || [];
    const hasResults = doctors.length > 0 || hospitals.length > 0;

    if (!hasResults) {
        return (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-50">
                <div className="text-center">
                    <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No results found for "{query}"</p>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
            {/* Doctors Section */}
            {doctors.length > 0 && (
                <div className="p-3 border-b border-gray-50">
                    <div className="flex items-center gap-2 px-2 mb-2">
                        <Stethoscope className="h-4 w-4 text-gray-400" />
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Doctors</h3>
                    </div>
                    <div className="space-y-1">
                        {doctors.slice(0, 3).map((doctor: any) => (
                            <Link
                                key={doctor.id}
                                href={`/search/${doctor.id}`}
                                onClick={onSelect}
                                className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-gray-100">
                                        <AvatarImage src={doctor.profileImage || doctor.image} />
                                        <AvatarFallback className="bg-blue-50 text-blue-600 text-sm font-semibold">
                                            {doctor.firstName?.[0] || doctor.name?.[0] || 'D'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            Dr. {doctor.firstName} {doctor.lastName || doctor.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{doctor.specialty}</p>
                                    </div>
                                    {doctor.distance && (
                                        <span className="text-xs text-gray-400">{doctor.distance.toFixed(1)} km</span>
                                    )}
                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Hospitals Section */}
            {hospitals.length > 0 && (
                <div className="p-3">
                    <div className="flex items-center gap-2 px-2 mb-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hospitals</h3>
                    </div>
                    <div className="space-y-1">
                        {hospitals.slice(0, 3).map((hospital: any) => (
                            <Link
                                key={hospital.id}
                                href={`/hospital/${hospital.id}`}
                                onClick={onSelect}
                                className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                                        <Building2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {hospital.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{hospital.address}</p>
                                    </div>
                                    {hospital.distance && (
                                        <span className="text-xs text-gray-400">{hospital.distance.toFixed(1)} km</span>
                                    )}
                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* View All Link */}
            <div className="p-3 border-t border-gray-50">
                <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={onSelect}
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-medical-blue hover:text-blue-700 transition-colors"
                >
                    View all results
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
