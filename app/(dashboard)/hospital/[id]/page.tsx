'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Star, Navigation, Building2, Users, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function HospitalDetailPage() {
    const params = useParams();
    const hospitalId = params.id as string;
    const [hospital, setHospital] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (hospitalId) {
            fetchHospitalDetails();
        }
    }, [hospitalId]);

    const fetchHospitalDetails = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/hospitals/${hospitalId}`);
            setHospital(data);
        } catch (error) {
            console.error('Failed to fetch hospital details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/dashboard">
                            <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                        </Link>
                        <Skeleton className="h-6 w-48" />
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-1">Hospital not found</h3>
                    <p className="text-sm text-gray-500 mb-4">The hospital you're looking for doesn't exist</p>
                    <Link href="/dashboard/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/dashboard">
                        <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="font-bold text-gray-900 text-lg">Hospital Details</h1>
                        <p className="text-xs text-gray-500">View information and services</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Hospital Header */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">{hospital.name}</h2>
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-gray-700">4.5</span>
                                <span className="text-xs text-gray-500">(248 reviews)</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p>{hospital.address}</p>
                            </div>
                            {hospital.distance && (
                                <p className="text-xs text-green-600 font-medium mt-1">
                                    {hospital.distance.toFixed(1)} km away
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-medical-blue" />
                        Contact Information
                    </h3>
                    <div className="space-y-3">
                        {hospital.phone && (
                            <a
                                href={`tel:${hospital.phone}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                            >
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-medical-blue">
                                        {hospital.phone}
                                    </p>
                                </div>
                            </a>
                        )}
                        {hospital.email && (
                            <a
                                href={`mailto:${hospital.email}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                            >
                                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-medical-blue">
                                        {hospital.email}
                                    </p>
                                </div>
                            </a>
                        )}
                        {hospital.website && (
                            <a
                                href={hospital.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                            >
                                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                                    <Globe className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Website</p>
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-medical-blue truncate">
                                        {hospital.website}
                                    </p>
                                </div>
                            </a>
                        )}
                    </div>
                </div>

                {/* Facilities & Services */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-medical-blue" />
                        Facilities & Services
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {['Emergency Care', 'ICU', 'Surgery', 'Diagnostics', 'Pharmacy', 'Ambulance'].map(
                            (facility) => (
                                <div
                                    key={facility}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-gray-50"
                                >
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <p className="text-sm text-gray-700">{facility}</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Visiting Hours */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-medical-blue" />
                        Visiting Hours
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Monday - Friday</span>
                            <span className="text-sm font-semibold text-gray-900">10:00 AM - 8:00 PM</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Saturday - Sunday</span>
                            <span className="text-sm font-semibold text-gray-900">10:00 AM - 6:00 PM</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-medical-blue hover:bg-blue-700 text-white rounded-xl h-12">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Hospital
                    </Button>
                    <Button
                        variant="outline"
                        className="border-medical-blue text-medical-blue hover:bg-blue-50 rounded-xl h-12"
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                    </Button>
                </div>
            </div>
        </div>
    );
}
