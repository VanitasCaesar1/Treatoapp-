'use client';

import React from 'react';
import { MapPin, Phone, Clock, Star, Shield, ArrowLeft, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';

// Mock Data
const HOSPITAL = {
    id: '1',
    name: 'City General Hospital',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b9a44fd?auto=format&fit=crop&q=80&w=1000',
    address: '123 Medical Center Dr, New York, NY 10001',
    rating: 4.8,
    reviews: 1240,
    phone: '+1 (555) 123-4567',
    hours: 'Open 24 Hours',
    description: 'City General Hospital is a premier medical facility dedicated to providing compassionate, high-quality care. With state-of-the-art technology and a team of world-class specialists, we are committed to your health and well-being.',
    facilities: ['24/7 Emergency', 'ICU', 'Laboratory', 'Pharmacy', 'Radiology', 'Cafeteria'],
    doctors: [
        { id: '1', name: 'Dr. Sarah Wilson', specialty: 'Cardiologist', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300', rating: 4.9 },
        { id: '2', name: 'Dr. James Chen', specialty: 'Dermatologist', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300', rating: 4.7 },
        { id: '3', name: 'Dr. Emily Parker', specialty: 'Pediatrician', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300', rating: 4.8 },
    ]
};

export default function HospitalProfilePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80">
                <img src={HOSPITAL.image} alt={HOSPITAL.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-900" />
                    </button>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                        <Share className="w-4 h-4 text-gray-900" />
                    </button>
                </div>
            </div>

            <div className="px-6 py-6 -mt-6 bg-white rounded-t-3xl relative">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{HOSPITAL.name}</h1>
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-black text-black" />
                            <span className="font-semibold">{HOSPITAL.rating}</span>
                            <span className="text-gray-500">({HOSPITAL.reviews} reviews)</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Info Section */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-gray-600">
                            <MapPin className="w-5 h-5 mt-0.5" />
                            <p>{HOSPITAL.address}</p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Clock className="w-5 h-5" />
                            <p>{HOSPITAL.hours}</p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Phone className="w-5 h-5" />
                            <p>{HOSPITAL.phone}</p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Description */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">About</h2>
                        <p className="text-gray-600 leading-relaxed">{HOSPITAL.description}</p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Facilities */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Facilities</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {HOSPITAL.facilities.map((facility, index) => (
                                <div key={index} className="flex items-center gap-2 text-gray-600">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{facility}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Doctors */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Our Doctors</h2>
                            <Link href="/search" className="text-sm font-semibold underline">See all</Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                            {HOSPITAL.doctors.map((doctor) => (
                                <Link key={doctor.id} href={`/doctor/${doctor.id}`} className="flex-shrink-0 w-40">
                                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                                        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">{doctor.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{doctor.specialty}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-gray-200 font-semibold">
                        Get Directions
                    </Button>
                    <Button className="flex-1 h-12 rounded-xl bg-airbnb-red hover:bg-[#D90B3E] text-white font-semibold">
                        Call Hospital
                    </Button>
                </div>
            </div>
        </div>
    );
}
