"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Organization {
    organization_id: string;
    org_id?: string;
    org_name?: string;
    name?: string;
    hospital_name?: string;
    location?: string;
    hospital_location?: string;
    hospital_address?: string;
    available_slots_count: number;
    total_slots_count: number;
}

interface LocationPickerProps {
    organizations: Organization[];
    selectedOrgId: string | null;
    onSelect: (orgId: string) => void;
}

export function LocationPicker({ organizations, selectedOrgId, onSelect }: LocationPickerProps) {
    if (organizations.length === 0) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                    <p className="text-center text-red-800 font-medium">
                        This doctor is not currently available for appointments
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Auto-select if only one location
    React.useEffect(() => {
        if (organizations.length === 1 && !selectedOrgId) {
            onSelect(organizations[0].organization_id);
        }
    }, [organizations, selectedOrgId, onSelect]);

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Select Location
            </h3>

            <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
                <p className="text-sm text-gray-500 mb-4 font-medium">
                    This doctor works at {organizations.length} locations. Choose where you'd like to book.
                </p>

                <div className="space-y-3">
                    {organizations.map((org) => (
                        <button
                            key={org.organization_id}
                            onClick={() => onSelect(org.organization_id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${selectedOrgId === org.organization_id
                                    ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600/20'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex justify-between items-start gap-4 relative z-10">
                                <div className="flex-1">
                                    {/* Organization Name */}
                                    <div className="font-bold text-gray-900 mb-1.5 text-base tracking-tight group-hover:text-blue-700 transition-colors">
                                        {org.hospital_name || org.name || org.organization_id}
                                    </div>

                                    {/* Location */}
                                    {(org.hospital_location || org.location) && (
                                        <div className="text-sm text-gray-500 flex items-center gap-1.5 mb-2.5 font-medium">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            {org.hospital_location || org.location}
                                        </div>
                                    )}

                                    {/* Slots Availability */}
                                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        {org.available_slots_count} slots available
                                    </div>
                                </div>

                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors mt-1 ${selectedOrgId === org.organization_id
                                        ? 'border-blue-600 bg-blue-600'
                                        : 'border-gray-300 group-hover:border-blue-400'
                                    }`}>
                                    {selectedOrgId === org.organization_id && (
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
