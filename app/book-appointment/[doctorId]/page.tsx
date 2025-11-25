'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { format, addDays, isSameDay, parseISO, getDay } from "date-fns";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Info, MapPin, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { ConsultationTypeSelector } from '@/components/consultation-type-selector';
import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import { FamilyMemberSelector } from '@/components/family-member-selector';
import { FamilyMember } from '@/lib/types/family-member';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationPicker } from '@/components/LocationPicker';
import toast from 'react-hot-toast';
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

function BookAppointmentContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orgId = searchParams.get('org_id');

    const [date, setDate] = useState<Date>(new Date());
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [doctor, setDoctor] = useState<any>(null);
    const [fees, setFees] = useState<any[]>([]);
    const [consultationType, setConsultationType] = useState<'in-person' | 'online'>('in-person');

    // Profile state
    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileCompletion, setProfileCompletion] = useState(100);

    // Family member state
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');

    // Organization state
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(orgId);
    const [loadingOrganizations, setLoadingOrganizations] = useState(false);

    // Generate next 14 days for horizontal calendar
    const nextDays = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

    const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style });
        }
    };

    // Fetch user profile and family members
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoadingProfile(true);
                const response = await fetch('/api/user/profile', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const profileData = await response.json();
                    setProfile(profileData);

                    // Access nested user object
                    const user = profileData.user || {};
                    const members = profileData.family_members || [];

                    const selfMember: FamilyMember = {
                        id: 'self',
                        name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Myself',
                        relationship: 'self',
                        email: user.email,
                        phone: user.mobile,
                    };

                    setFamilyMembers([selfMember, ...members]);
                    setSelectedMemberId('self');

                    // Check required fields from user object
                    const requiredFields = [
                        { key: 'first_name', value: user.first_name, label: 'Name' },
                        { key: 'mobile', value: user.mobile, label: 'Phone' },
                        { key: 'email', value: user.email, label: 'Email' }
                    ];

                    const filledFields = requiredFields.filter(field => field.value).length;
                    const completion = Math.round((filledFields / requiredFields.length) * 100);
                    setProfileCompletion(completion);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    // Fetch doctor details and fees
    useEffect(() => {
        const fetchDoctorAndFees = async () => {
            if (!params.doctorId) return;
            try {
                const [doctorData, feesData] = await Promise.all([
                    api.get(`/doctors/${params.doctorId}`),
                    api.get(`/doctors/${params.doctorId}/fees`).catch(() => ({ fees: [] }))
                ]);

                setDoctor(doctorData);
                const feesArray = Array.isArray(feesData) ? feesData : feesData.fees || [];
                setFees(feesArray);
            } catch (error) {
                console.error('Error fetching doctor details:', error);
                toast.error('Failed to load doctor details');
            }
        };
        fetchDoctorAndFees();
    }, [params.doctorId]);

    // Fetch organizations if org_id not in URL
    useEffect(() => {
        const fetchOrganizations = async () => {
            if (!params.doctorId) return;
            if (orgId) {
                // org_id already in URL, use it
                setSelectedOrgId(orgId);
                return;
            }

            setLoadingOrganizations(true);
            try {
                const response = await api.get(`/doctors/${params.doctorId}/organizations`);
                const orgs = response.organizations || [];
                setOrganizations(orgs);

                // Auto-select if only one organization
                if (orgs.length === 1) {
                    setSelectedOrgId(orgs[0].organization_id);
                }
            } catch (error) {
                console.error('Error fetching organizations:', error);
                toast.error('Failed to load locations');
            } finally {
                setLoadingOrganizations(false);
            }
        };
        fetchOrganizations();
    }, [params.doctorId, orgId]);

    // Fetch slots when date or orgId changes
    useEffect(() => {
        const fetchSlots = async () => {
            if (!date || !params.doctorId) return;

            // Use orgId from URL or selectedOrgId from state
            const effectiveOrgId = orgId || selectedOrgId;
            if (!effectiveOrgId) {
                console.warn('No organization selected, waiting...');
                return;
            }

            setLoadingSlots(true);
            setSlots([]);
            setSelectedSlot(null);

            try {
                const formattedDate = format(date, "yyyy-MM-dd");

                const queryParams = new URLSearchParams({
                    date: formattedDate,
                    org_id: effectiveOrgId
                });

                console.log('Fetching slots with:', { date: formattedDate, org_id: effectiveOrgId });

                const response = await api.get(`/doctors/${params.doctorId}/slots?${queryParams}`);

                console.log('Slots API full response:', response);

                // Handle different response formats
                let slotsData = response.available_slots || response.slots || response.data || [];

                // If response is directly an array
                if (Array.isArray(response) && !slotsData.length) {
                    slotsData = response;
                }

                console.log('Extracted slots data:', slotsData);

                let availableSlots: string[] = [];
                if (Array.isArray(slotsData)) {
                    availableSlots = slotsData
                        .filter((s: any) => {
                            if (typeof s === 'object') {
                                // Check both snake_case and camelCase
                                const isActive = s.is_active !== false && s.isActive !== false;
                                const isBooked = s.is_booked === true || s.isBooked === true;
                                return isActive && !isBooked;
                            }
                            return true;
                        })
                        .map((s: any) => {
                            if (typeof s === 'string') return s;

                            // Backend returns 'start_time', not 'slot_start_time'
                            let timeValue = s.start_time || s.slot_start_time || s.time || s.startTime;

                            // PostgreSQL time fields come as objects with Microseconds
                            if (timeValue && typeof timeValue === 'object') {
                                // Check if it has Microseconds property
                                if ('Microseconds' in timeValue || 'microseconds' in timeValue) {
                                    const microseconds = timeValue.Microseconds || timeValue.microseconds;
                                    // Convert microseconds to seconds
                                    const totalSeconds = Math.floor(microseconds / 1000000);
                                    const hours = Math.floor(totalSeconds / 3600);
                                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                                    const seconds = totalSeconds % 60;
                                    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                                }
                            }

                            // If it's already a string
                            if (timeValue && typeof timeValue === 'string') {
                                return timeValue;
                            }

                            console.warn('Could not extract time from slot:', s);
                            return '';
                        })
                        .filter(Boolean);
                }

                const uniqueSlots = [...new Set(availableSlots)].sort();
                console.log('Final processed slots:', uniqueSlots);
                console.log('Slots count:', uniqueSlots.length);

                if (uniqueSlots.length === 0) {
                    console.warn('No slots found after processing. Raw data was:', slotsData);
                    console.warn('Sample slot object:', slotsData[0]);
                }

                setSlots(uniqueSlots);
            } catch (error) {
                console.error('Error fetching slots:', error);
                toast.error('Failed to load available slots');
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [date, params.doctorId, orgId, selectedOrgId]);

    const handleDateSelect = (newDate: Date) => {
        triggerHaptic(ImpactStyle.Light);
        setDate(newDate);
    };

    const handleSlotSelect = (slot: string) => {
        triggerHaptic(ImpactStyle.Medium);
        setSelectedSlot(slot);
    };

    const handleBookAppointment = async () => {
        triggerHaptic(ImpactStyle.Heavy);
        if (!date || !selectedSlot || !doctor) return;

        // Check if profile is complete using nested user object
        const user = profile?.user || {};
        if (profileCompletion < 100 || !user.mobile) {
            toast.error('Please complete your profile before booking');
            const currentPath = `/book-appointment/${params.doctorId}${orgId ? `?org_id=${orgId}` : ''}`;
            router.push(`/profile?returnTo=${encodeURIComponent(currentPath)}`);
            return;
        }

        const selectedMember = familyMembers.find(m => m.id === selectedMemberId);
        if (!selectedMember) {
            toast.error('Please select who this appointment is for');
            return;
        }

        setSubmitting(true);
        try {
            const feeObj = fees.find((f: any) => {
                const feeType = f.type || f.consultation_type;
                return feeType === consultationType || (consultationType === 'in-person' && feeType === 'default');
            });
            const amount = feeObj?.amount || feeObj?.default_fees || doctor.consultation_fee || 500;

            const paymentResponse = await api.post('/payment/initiate', {
                amount,
                doctorId: params.doctorId,
                appointmentDate: format(date, 'yyyy-MM-dd'),
                appointmentTime: selectedSlot,
                consultationType: consultationType,
                duration: 30,
                reason: 'Consultation',
                patientName: selectedMember.name,
                patientPhone: selectedMember.phone || user.mobile,
                patientEmail: selectedMember.email || user.email,
                forMemberId: selectedMember.id === 'self' ? null : selectedMember.id,
                forMemberRelationship: selectedMember.relationship,
            });

            if (paymentResponse.success && (paymentResponse.url || paymentResponse.redirectUrl)) {
                // Save appointment data returned from API (includes merchantTransactionId)
                if (paymentResponse.appointmentData) {
                    localStorage.setItem('pendingAppointment', JSON.stringify(paymentResponse.appointmentData));
                } else {
                    // Fallback: create appointment data manually
                    localStorage.setItem('pendingAppointment', JSON.stringify({
                        merchantTransactionId: paymentResponse.merchantTransactionId,
                        userId: user.id,
                        doctorId: params.doctorId,
                        doctorName: doctor.name,
                        appointmentDate: format(date, 'yyyy-MM-dd'),
                        appointmentTime: selectedSlot,
                        consultationType: consultationType,
                        patientName: selectedMember.name,
                        patientPhone: selectedMember.phone || user.mobile,
                        patientEmail: selectedMember.email || user.email,
                        forMemberId: selectedMember.id === 'self' ? null : selectedMember.id,
                        forMemberRelationship: selectedMember.relationship,
                        amount,
                        timestamp: Date.now()
                    }));
                }

                // Redirect to PhonePe payment page
                window.location.href = paymentResponse.url || paymentResponse.redirectUrl;
            } else {
                throw new Error(paymentResponse.error || 'Payment initiation failed');
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            toast.error(error.response?.data?.error || error.message || 'Failed to initiate payment');
            setSubmitting(false);
        }
    };

    if (!doctor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium">Loading booking details...</p>
                </div>
            </div>
        );
    }

    const currentFee = fees.find((f: any) => {
        const feeType = f.type || f.consultation_type;
        return feeType === consultationType || (consultationType === 'in-person' && feeType === 'default');
    })?.amount || fees.find(f => f.default_fees)?.default_fees || doctor.consultation_fee || 500;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32 font-sans">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 px-4 py-4 flex items-center gap-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 -ml-2 hover:bg-gray-100/80 rounded-full active:bg-gray-200/80 transition-all duration-200 group"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-gray-900 text-lg tracking-tight">Book Appointment</h1>
                    <p className="text-xs text-gray-500 font-medium">Select a time slot</p>
                </div>
            </div>

            <div className="p-4 space-y-6 max-w-2xl mx-auto pt-6">
                {/* Profile Warning */}
                {!loadingProfile && profileCompletion < 100 && (
                    <ProfileCompletionBanner
                        completionPercent={profileCompletion}
                        missingFields={['Name', 'Phone', 'Email']}
                        returnTo={`/book-appointment/${params.doctorId}${orgId ? `?org_id=${orgId}` : ''}`}
                    />
                )}

                {/* Doctor Card */}
                <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
                    <div className="flex gap-5">
                        <div className="relative">
                            <Avatar className="h-20 w-20 rounded-2xl ring-4 ring-gray-50 shadow-sm flex-shrink-0">
                                <AvatarImage src={doctor.image || doctor.profileImage} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl font-bold rounded-2xl">
                                    {doctor.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                                98%
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 py-1">
                            <h2 className="font-bold text-gray-900 text-xl mb-1.5 truncate tracking-tight">{doctor.name}</h2>
                            <p className="text-sm text-gray-500 font-medium mb-3">{doctor.specialization?.primary || doctor.specialty}</p>

                            <div className="flex items-center gap-3 text-xs">
                                <span className="bg-blue-50/80 text-blue-700 px-3 py-1 rounded-full font-semibold border border-blue-100/50 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                                {doctor.years_of_experience > 0 && (
                                    <span className="text-gray-500 font-medium px-2">{doctor.years_of_experience}+ years exp</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Picker - Show if no org_id in URL */}
                {!orgId && organizations.length > 0 && (
                    <LocationPicker
                        organizations={organizations}
                        selectedOrgId={selectedOrgId}
                        onSelect={(id) => {
                            setSelectedOrgId(id);
                            // Update URL with selected org_id
                            const currentPath = window.location.pathname;
                            router.replace(`${currentPath}?org_id=${id}`);
                        }}
                    />
                )}

                {/* Loading state for organizations */}
                {!orgId && loadingOrganizations && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                        <p className="text-gray-600 mt-2">Loading locations...</p>
                    </div>
                )}

                {/* Who is this for? */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        Who is this appointment for?
                    </h3>
                    <div className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
                        <FamilyMemberSelector
                            members={familyMembers}
                            selectedId={selectedMemberId}
                            onChange={(id) => {
                                triggerHaptic(ImpactStyle.Light);
                                setSelectedMemberId(id);
                            }}
                            onAddMember={async (member) => {
                                // Add member to local state
                                const updatedMembers = [...familyMembers, member];
                                setFamilyMembers(updatedMembers);
                                setSelectedMemberId(member.id);

                                // Save to profile
                                try {
                                    const membersToSave = updatedMembers.filter(m => m.id !== 'self');
                                    await fetch('/api/user/profile', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        credentials: 'include',
                                        body: JSON.stringify({
                                            ...profile,
                                            family_members: membersToSave,
                                        }),
                                    });
                                    toast.success('Family member added!');
                                } catch (error) {
                                    console.error('Error saving family member:', error);
                                    toast.error('Added locally, but failed to save');
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Consultation Type */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg tracking-tight">Consultation Type</h3>
                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] border border-gray-100/60">
                        <ConsultationTypeSelector
                            value={consultationType}
                            onChange={(type) => {
                                triggerHaptic(ImpactStyle.Light);
                                setConsultationType(type);
                            }}
                            doctorSupportsVideo={doctor.supports_video_calls !== false}
                        />
                    </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2 tracking-tight">
                        <CalendarIcon className="w-5 h-5 text-gray-500" />
                        Select Date
                    </h3>
                    <div className="bg-white py-5 rounded-2xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] border border-gray-100/60 overflow-hidden">
                        <div className="overflow-x-auto hide-scrollbar">
                            <div className="flex gap-3 px-5 min-w-max">
                                {nextDays.map((d) => {
                                    const isSelected = isSameDay(d, date);
                                    const isToday = isSameDay(d, new Date());
                                    return (
                                        <button
                                            key={d.toISOString()}
                                            onClick={() => handleDateSelect(d)}
                                            className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 min-w-[72px] ${isSelected
                                                ? 'border-gray-900 bg-gray-900 text-white shadow-md scale-105'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            <span className={`text-[11px] font-semibold uppercase tracking-wide ${isSelected ? 'text-gray-200' : 'text-gray-500'
                                                }`}>
                                                {format(d, "EEE")}
                                            </span>
                                            <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {format(d, "d")}
                                            </span>
                                            <span className={`text-xs font-medium ${isSelected ? 'text-gray-200' : 'text-gray-600'
                                                }`}>
                                                {format(d, "MMM")}
                                            </span>
                                            {isToday && (
                                                <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600'
                                                    }`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2 tracking-tight">
                        <Clock className="w-5 h-5 text-gray-500" />
                        Select Time
                    </h3>
                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] border border-gray-100/60 min-h-[200px] flex items-center justify-center">
                        {loadingSlots ? (
                            <div className="grid grid-cols-3 gap-2.5 w-full">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : slots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 w-full">
                                {slots.map((slot) => {
                                    try {
                                        const [hours, minutes] = slot.split(':');
                                        const slotDate = new Date();
                                        slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                        const displayTime = format(slotDate, 'h:mm a');

                                        return (
                                            <button
                                                key={slot}
                                                onClick={() => handleSlotSelect(slot)}
                                                className={cn(
                                                    "py-3.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2",
                                                    selectedSlot === slot
                                                        ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                                                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:scale-105 active:scale-95"
                                                )}
                                            >
                                                {displayTime}
                                            </button>
                                        );
                                    } catch (e) {
                                        return null;
                                    }
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <Clock className="w-7 h-7 text-gray-400" />
                                </div>
                                <p className="text-gray-900 font-semibold mb-1">No slots available</p>
                                <p className="text-sm text-gray-500">Please select another date</p>
                            </div>
                        )}
                    </div>
                </div >
            </div >

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.08)] z-30">
                <div className="max-w-2xl mx-auto p-5 flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Consultation Fee</p>
                        <p className="text-3xl font-bold text-gray-900">₹{currentFee}</p>
                    </div>
                    <Button
                        className="flex-[1.2] bg-gray-900 hover:bg-gray-800 text-white h-14 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-none"
                        disabled={!date || !selectedSlot || submitting}
                        onClick={handleBookAppointment}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            'Continue to Pay'
                        )}
                    </Button>
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div >
    );
}

export default function BookAppointmentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium">Loading booking page...</p>
                </div>
            </div>
        }>
            <BookAppointmentContent />
        </Suspense>
    );
}
