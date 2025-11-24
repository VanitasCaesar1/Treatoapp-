'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'skeleton rounded-lg bg-gray-200',
                className
            )}
        />
    );
}

export function AppointmentCardSkeleton() {
    return (
        <div className="bg-white rounded-airbnb-xl p-5 border border-gray-100 shadow-airbnb-card">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-8 w-48 mb-1" />
                    <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full mt-4 rounded-xl" />
        </div>
    );
}

export function DoctorCardSkeleton() {
    return (
        <div className="bg-white rounded-airbnb-lg border border-gray-100 shadow-airbnb-card overflow-hidden">
            <div className="flex gap-4 p-4">
                <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
            <div className="px-4 pb-4 flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
        </div>
    );
}

export function QuickActionSkeleton() {
    return (
        <div className="bg-white rounded-airbnb-lg p-4 border border-gray-100 shadow-airbnb-card">
            <Skeleton className="h-12 w-12 rounded-xl mb-3" />
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
        </div>
    );
}

export function ListItemSkeleton() {
    return (
        <div className="bg-white rounded-airbnb-lg p-4 border border-gray-100 shadow-airbnb-card">
            <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    );
}

export function SearchBarSkeleton() {
    return (
        <Skeleton className="h-12 w-full rounded-full" />
    );
}

export function CategoryChipSkeleton() {
    return (
        <Skeleton className="h-10 w-24 rounded-full flex-shrink-0" />
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 px-4 pt-4">
            {/* Quick Actions Grid Skeleton */}
            <div className="grid grid-cols-2 gap-3">
                <QuickActionSkeleton />
                <QuickActionSkeleton />
                <QuickActionSkeleton />
                <QuickActionSkeleton />
            </div>

            {/* Upcoming Appointment Skeleton */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <AppointmentCardSkeleton />
            </div>

            {/* Health Tips Skeleton */}
            <div>
                <Skeleton className="h-6 w-28 mb-3" />
                <div className="bg-white rounded-airbnb-lg p-5 border border-gray-100 shadow-airbnb-card">
                    <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-full mb-1" />
                            <Skeleton className="h-3 w-5/6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SearchPageSkeleton() {
    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <SearchBarSkeleton />

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                <CategoryChipSkeleton />
                <CategoryChipSkeleton />
                <CategoryChipSkeleton />
                <CategoryChipSkeleton />
                <CategoryChipSkeleton />
            </div>

            {/* Doctor Cards */}
            <div className="space-y-3">
                <DoctorCardSkeleton />
                <DoctorCardSkeleton />
                <DoctorCardSkeleton />
                <DoctorCardSkeleton />
            </div>
        </div>
    );
}
