
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Bell, Calendar, ChevronRight, Loader2, Pill, FlaskConical, Stethoscope, Video, Activity, Zap } from 'lucide-react';
import CategoryBar from '@/components/CategoryBar';
import { DoctorCard } from '@/components/features/doctors/doctor-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUserSession } from '@/lib/contexts/user-session-context';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh';

export default function DashboardPage() {
  const { user } = useUserSession();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock upcoming appointment (would come from API in real app)
  const upcomingAppointment = null;

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Filter by selected category/specialization
      const params: any = { limit: 20 };
      if (selectedCategory && selectedCategory !== 'All') {
        params.specialty = selectedCategory.toLowerCase();
      }

      const data = await api.get('/doctors/search', params);
      let doctorsList = data.doctors || [];

      // Fetch fees for each doctor (parallel)
      const doctorsWithFees = await Promise.all(
        doctorsList.map(async (doc: any) => {
          try {
            const feesData = await api.get(`/doctors/${doc.id || doc.doctor_id || doc.DoctorID}/fees`);

            // Handle different response formats
            let consultationFee = null;

            if (feesData.fees && Array.isArray(feesData.fees) && feesData.fees.length > 0) {
              // Find consultation fee
              const consultationFeeObj = feesData.fees.find((f: any) =>
                f.consultation_fee || f.amount || f.fee || f.default_fees
              );

              if (consultationFeeObj) {
                consultationFee = consultationFeeObj.consultation_fee
                  || consultationFeeObj.amount
                  || consultationFeeObj.fee
                  || consultationFeeObj.default_fees;
              }
            } else if (feesData.consultation_fee) {
              consultationFee = feesData.consultation_fee;
            } else if (feesData.amount) {
              consultationFee = feesData.amount;
            }

            return {
              ...doc,
              consultation_fee: consultationFee
            };
          } catch (e) {
            console.error(`Failed to fetch fees for doctor ${doc.id}:`, e);
            return {
              ...doc,
              consultation_fee: null
            };
          }
        })
      );

      const formattedDoctors = doctorsWithFees.map((doc: any) => ({
        id: doc.id || doc.doctor_id || doc.DoctorID,
        firstName: doc.firstName || doc.name?.split(' ')[0] || '',
        lastName: doc.lastName || doc.name?.split(' ').slice(1).join(' ') || '',
        specialty: doc.specialty || doc.Speciality || doc.specialization?.[0]?.name || 'General',
        qualification: doc.qualification || doc.Qualification,
        hospitalName: doc.hospital_name || doc.HospitalName || 'Hospital',
        location: doc.location || doc.city,
        profileImage: doc.image || doc.Image || doc.profileImage,
        rating: doc.rating || 4.8,
        price: doc.consultation_fee, // Don't use fallback - show null if unavailable
        experience: doc.years_of_experience || doc.experience || 5
      }));

      setDoctors(formattedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedCategory]);

  const { containerRef, isRefreshing } = usePullToRefresh({ onRefresh: fetchDoctors });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    { icon: FlaskConical, label: 'Lab Tests', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Pill, label: 'Medicines', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Video, label: 'Teleconsult', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Activity, label: 'Health', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const healthTips = [
    { title: 'Stay Hydrated', desc: 'Drink at least 8 glasses of water daily.', icon: '💧', color: 'bg-blue-100 text-blue-800' },
    { title: 'Sleep Well', desc: 'Aim for 7-8 hours of quality sleep.', icon: '😴', color: 'bg-indigo-100 text-indigo-800' },
    { title: 'Daily Walk', desc: '30 mins of walking improves heart health.', icon: '🚶', color: 'bg-green-100 text-green-800' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/30 pb-24 -mx-4">
      {/* Enhanced Header Section */}
      <div className="bg-white pb-4 pt-4 px-6 rounded-b-[2.5rem] shadow-sm border-b border-gray-100 relative overflow-hidden">
        {/* Subtle Background Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/50 to-purple-50/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">{getGreeting()},</p>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {user?.firstName ? `${user.firstName}` : 'Guest'}
                <span className="text-2xl animate-wave origin-bottom-right inline-block">👋</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/notifications">
                <button className="w-11 h-11 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all active:scale-95 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
              </Link>
              <Link href="/profile">
                <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm cursor-pointer active:scale-95 transition-transform">
                  <AvatarImage src={user?.profilePictureUrl || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-medical-blue to-blue-600 text-white font-bold">
                    {user?.firstName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>

          {/* Search Trigger */}
          <Link href="/search">
            <div className="relative mb-6 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-hover:text-medical-blue transition-colors" />
              </div>
              <div className="w-full h-14 rounded-2xl bg-gray-50/80 flex items-center px-12 text-gray-500 text-sm font-medium border border-gray-100 group-hover:bg-white group-hover:border-medical-blue/30 group-hover:shadow-md transition-all cursor-text">
                Search doctors, specialties, clinics...
              </div>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                  <MapPin className="h-4 w-4 text-medical-blue" />
                </div>
              </div>
            </div>
          </Link>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <button key={idx} className="flex flex-col items-center gap-2 group">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-active:scale-95 shadow-sm border border-transparent group-hover:border-gray-100", action.bg)}>
                  <action.icon className={cn("w-6 h-6", action.color)} />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pull to refresh indicator */}
      <div className={cn(
        "flex justify-center items-center h-8 overflow-hidden transition-all duration-300",
        isRefreshing ? "opacity-100 my-2" : "opacity-0 h-0 my-0"
      )}>
        <Loader2 className="h-5 w-5 animate-spin text-medical-blue" />
      </div>

      <main className="px-4 space-y-8 mt-6">
        {/* Health Tips Carousel */}
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              Health Tips
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
            {healthTips.map((tip, idx) => (
              <div key={idx} className="min-w-[240px] bg-white p-4 rounded-3xl border border-gray-100 shadow-sm snap-center">
                <div className="flex items-start justify-between mb-2">
                  <span className={cn("px-2 py-1 rounded-lg text-xs font-bold", tip.color)}>{tip.icon} Tips</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{tip.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-lg font-bold text-gray-900">Specialties</h2>
          </div>
          <CategoryBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Upcoming Appointment (Placeholder) */}
        {upcomingAppointment && (
          <div className="bg-gradient-to-r from-medical-blue to-blue-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Upcoming Appointment</p>
                <h3 className="font-bold text-lg">Dr. Sarah Smith</h3>
                <p className="text-blue-100 text-sm">Cardiologist</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm border border-white/5">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <p className="text-xs font-bold text-center leading-tight">12<br />OCT</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">09:30 AM</p>
                  <p className="text-xs text-blue-100">Wednesday</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="h-8 rounded-full text-xs font-bold bg-white text-medical-blue hover:bg-blue-50 border-0">
                Details
              </Button>
            </div>
          </div>
        )}

        {/* Top Doctors Header */}
        <div>
          <div className="flex items-center justify-between px-1 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Top Doctors</h2>
            <Link href="/search" className="text-sm font-semibold text-medical-blue hover:text-blue-700 flex items-center bg-blue-50 px-3 py-1 rounded-full">
              See All <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {/* Doctor List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} className="h-40 rounded-3xl" />
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
              <p className="text-sm text-gray-500">
                {selectedCategory !== 'All'
                  ? `No ${selectedCategory} specialists available`
                  : 'Try adjusting your filters'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

