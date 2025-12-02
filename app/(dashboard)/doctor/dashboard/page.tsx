'use client';

import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { redirect } from 'next/navigation';
import { Plus, Calendar, Users, FileText, TrendingUp, Clock, BarChart3, Stethoscope, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorDashboardPage() {
    const { isDoctor, loading } = useUserRoles();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
                    <Skeleton className="h-7 w-48" />
                </div>
                <div className="p-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-24 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!isDoctor) {
        redirect('/dashboard/dashboard');
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-xl flex items-center gap-2">
                            <Stethoscope className="h-6 w-6 text-green-600" />
                            Doctor Dashboard
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage your practice</p>
                    </div>
                    <Link href="/dashboard/dashboard">
                        <button className="text-sm text-medical-blue font-medium">
                            Patient View
                        </button>
                    </Link>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <span className="text-xs text-gray-500">Today</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                        <p className="text-sm text-gray-500">Appointments</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="h-8 w-8 text-green-600" />
                            <span className="text-xs text-gray-500">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">248</p>
                        <p className="text-sm text-gray-500">Patients</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <FileText className="h-8 w-8 text-purple-600" />
                            <span className="text-xs text-gray-500">Published</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">35</p>
                        <p className="text-sm text-gray-500">Posts</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                            <span className="text-xs text-gray-500">Average</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">4.8</p>
                        <p className="text-sm text-gray-500">Rating</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/doctor/create-post" className="block">
                            <Button className="w-full h-24 bg-gradient-to-br from-medical-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100">
                                <div className="text-center">
                                    <Plus className="h-7 w-7 mx-auto mb-2" />
                                    <p className="text-sm font-semibold">Create Post</p>
                                </div>
                            </Button>
                        </Link>

                        <Link href="/doctor/appointments" className="block">
                            <Button variant="outline" className="w-full h-24 border-2 rounded-2xl hover:bg-gray-50">
                                <div className="text-center">
                                    <Calendar className="h-7 w-7 mx-auto mb-2 text-blue-600" />
                                    <p className="text-sm font-semibold text-gray-700">Appointments</p>
                                </div>
                            </Button>
                        </Link>

                        <Link href="/doctor/schedule" className="block">
                            <Button variant="outline" className="w-full h-24 border-2 rounded-2xl hover:bg-gray-50">
                                <div className="text-center">
                                    <Clock className="h-7 w-7 mx-auto mb-2 text-green-600" />
                                    <p className="text-sm font-semibold text-gray-700">Schedule</p>
                                </div>
                            </Button>
                        </Link>

                        <Link href="/doctor/patients" className="block">
                            <Button variant="outline" className="w-full h-24 border-2 rounded-2xl hover:bg-gray-50">
                                <div className="text-center">
                                    <Users className="h-7 w-7 mx-auto mb-2 text-purple-600" />
                                    <p className="text-sm font-semibold text-gray-700">Patients</p>
                                </div>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-900">Today's Schedule</h2>
                        <Link href="/doctor/appointments" className="text-sm text-medical-blue font-medium">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {/* Mock appointments - replace with actual data */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900">Morning Appointments</p>
                                <p className="text-xs text-gray-500">5 patients scheduled</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-blue-600">9:00 AM</p>
                            </div>
                        </div>

                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500">No more appointments for today</p>
                        </div>
                    </div>
                </div>

                {/* Engagement Stats */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900">This Week</h2>
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Post Views</span>
                            <span className="font-semibold text-gray-900">2,450</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Post Likes</span>
                            <span className="font-semibold text-gray-900">342</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">New Followers</span>
                            <span className="font-semibold text-gray-900">28</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Comments</span>
                            <span className="font-semibold text-gray-900">156</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
