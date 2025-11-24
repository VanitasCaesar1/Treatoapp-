'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MapPin, Clock, Award, GraduationCap, Calendar, Loader2, ArrowLeft,
    Star, Share, ShieldCheck, Stethoscope, ChevronRight, ThumbsUp
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { ReviewList } from '@/components/features/reviews/review-list';

export default function DoctorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!params.id) return;
            try {
                const data = await api.get(`/doctors/${params.id}`);
                setDoctor(data);
            } catch (error) {
                console.error('Error fetching doctor profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-medical-blue" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <p className="text-gray-500 mb-4">Doctor not found</p>
                <Button onClick={() => router.back()} variant="outline">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Sticky Header */}
            <div className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3 flex items-center justify-between",
                scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
            )}>
                <button
                    onClick={() => router.back()}
                    className={cn(
                        "p-2 rounded-full transition-colors",
                        scrolled ? "hover:bg-gray-100 text-gray-700" : "bg-white/20 backdrop-blur-sm text-gray-900 hover:bg-white/30"
                    )}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <h1 className={cn(
                    "font-semibold text-gray-900 transition-opacity duration-300",
                    scrolled ? "opacity-100" : "opacity-0"
                )}>
                    Doctor Profile
                </h1>

                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: doctor.name,
                                text: `Check out ${doctor.name} on Patient App`,
                                url: window.location.href,
                            });
                        } else {
                            navigator.clipboard.writeText(window.location.href);
                        }
                    }}
                    className={cn(
                        "p-2 rounded-full transition-colors",
                        scrolled ? "hover:bg-gray-100 text-gray-700" : "bg-white/20 backdrop-blur-sm text-gray-900 hover:bg-white/30"
                    )}
                >
                    <Share className="w-5 h-5" />
                </button>
            </div>

            {/* Hero Section */}
            <div className="relative pt-24 pb-8 px-6 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 rounded-b-[2.5rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative mb-4"
                    >
                        <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-20 scale-110" />
                        <Avatar className="h-28 w-28 border-4 border-white shadow-xl shadow-blue-100/50">
                            <AvatarImage src={doctor.profile_pic} alt={doctor.name} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-medical-blue text-3xl font-bold">
                                {doctor.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-1 right-1 bg-green-500 border-2 border-white rounded-full p-1.5 shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{doctor.name}</h2>
                        <p className="text-medical-blue font-medium text-base mb-2">
                            {doctor.specialization?.primary}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-white/60 backdrop-blur-sm py-1 px-3 rounded-full border border-gray-100 w-fit mx-auto">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{doctor.location || 'Main Hospital'}</span>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-3 gap-3 w-full mt-8"
                    >
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-1">
                            <div className="bg-blue-50 p-2 rounded-full mb-1">
                                <Clock className="w-4 h-4 text-medical-blue" />
                            </div>
                            <span className="font-bold text-gray-900">{doctor.age}+ Yrs</span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Experience</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-1">
                            <div className="bg-yellow-50 p-2 rounded-full mb-1">
                                <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                            </div>
                            <span className="font-bold text-gray-900">4.9</span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Rating</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-1">
                            <div className="bg-green-50 p-2 rounded-full mb-1">
                                <ThumbsUp className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-bold text-gray-900">100+</span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Patients</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="px-4 mt-6">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full bg-white p-1 rounded-xl border border-gray-100 shadow-sm h-12 mb-6">
                        <TabsTrigger value="overview" className="flex-1 rounded-lg data-[state=active]:bg-medical-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Overview</TabsTrigger>
                        <TabsTrigger value="reviews" className="flex-1 rounded-lg data-[state=active]:bg-medical-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Reviews</TabsTrigger>
                        <TabsTrigger value="location" className="flex-1 rounded-lg data-[state=active]:bg-medical-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Location</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* About Section */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="bg-blue-100 p-1.5 rounded-lg">
                                    <Stethoscope className="w-4 h-4 text-medical-blue" />
                                </div>
                                About Doctor
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {doctor.about || `${doctor.name} is a highly skilled ${doctor.specialization?.primary} with over ${doctor.age} years of experience. Dedicated to providing comprehensive care with a patient-centric approach.`}
                            </p>
                        </div>

                        {/* Qualifications & Specialization */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <div className="bg-purple-100 p-1.5 rounded-lg">
                                        <GraduationCap className="w-4 h-4 text-purple-600" />
                                    </div>
                                    Qualification
                                </h3>
                                <p className="text-gray-600 text-sm font-medium ml-9">
                                    {doctor.qualification}
                                </p>
                            </div>

                            <div className="border-t border-gray-50 pt-4">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <div className="bg-orange-100 p-1.5 rounded-lg">
                                        <Award className="w-4 h-4 text-orange-600" />
                                    </div>
                                    Specialization
                                </h3>
                                <div className="flex flex-wrap gap-2 ml-9">
                                    <span className="bg-blue-50 text-medical-blue px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100">
                                        {doctor.specialization?.primary}
                                    </span>
                                    {doctor.specialization?.secondary?.map((spec: string, index: number) => (
                                        <span key={index} className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-100">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="bg-green-100 p-1.5 rounded-lg">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                Availability
                            </h3>
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                <span className="text-sm text-gray-600 font-medium">Slot Duration</span>
                                <span className="text-sm font-bold text-gray-900">{doctor.slot_duration} minutes</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        {/* Review List */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Reviews can only be submitted for completed appointments from your appointment history.
                            </p>
                        </div>

                        <ReviewList
                            doctorId={params.id as string}
                            refreshTrigger={0}
                        />
                    </TabsContent>

                    <TabsContent value="location" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="bg-red-100 p-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4 text-red-600" />
                                </div>
                                Clinic Location
                            </h3>

                            {/* Google Maps Embed */}
                            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'}&q=${encodeURIComponent(doctor.location || 'Main Hospital, Medical District')}`}
                                />
                            </div>

                            {/* Address Details */}
                            <div className="pt-2">
                                <p className="text-gray-900 font-semibold text-base mb-1">{doctor.location || 'Main Hospital'}</p>
                                <p className="text-gray-500 text-sm">
                                    {doctor.address || doctor.clinic_address || '123 Health Avenue, Medical District'}
                                </p>
                            </div>

                            {/* Get Directions Button */}
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.location || 'Main Hospital')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button variant="outline" className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Get Directions
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </a>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-md mx-auto flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Consultation Fee</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-gray-900">₹{doctor.consultation_fee || 500}</span>
                            <span className="text-xs text-gray-400 font-medium">/ visit</span>
                        </div>
                    </div>
                    <Link href={`/book-appointment/${params.id}${doctor.hospital_id || doctor.org_id ? `?org_id=${doctor.hospital_id || doctor.org_id}` : ''}`} className="flex-1">
                        <Button className="w-full bg-medical-blue hover:bg-blue-700 text-white h-12 text-base font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                            Book Now
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
