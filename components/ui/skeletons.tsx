/*
 * Skeleton Loading Components
 *
 * A generic gray box tells users nothing. A skeleton that looks
 * like the actual content sets expectations and feels faster.
 *
 * These skeletons match the actual component layouts, so users
 * know what to expect when content loads.
 *
 * Usage:
 *   {isLoading ? <AppointmentListSkeleton /> : <AppointmentList />}
 */
'use client';

import { cn } from '@/lib/utils';

/*
 * Base Skeleton - Animated placeholder
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

/*
 * AppointmentCardSkeleton - Single appointment card
 */
export function AppointmentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          {/* Name */}
          <Skeleton className="h-4 w-32 mb-2" />
          {/* Specialty */}
          <Skeleton className="h-3 w-24" />
        </div>
        {/* Time */}
        <div className="text-right">
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/*
 * AppointmentListSkeleton - List of appointment cards
 */
export function AppointmentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <AppointmentCardSkeleton key={i} />
      ))}
    </div>
  );
}

/*
 * DoctorCardSkeleton - Doctor profile card
 */
export function DoctorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-start gap-4">
        {/* Photo */}
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1">
          {/* Name */}
          <Skeleton className="h-5 w-40 mb-2" />
          {/* Specialty */}
          <Skeleton className="h-4 w-32 mb-3" />
          {/* Rating & Experience */}
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        {/* Fee */}
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

/*
 * DoctorListSkeleton - List of doctor cards
 */
export function DoctorListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <DoctorCardSkeleton key={i} />
      ))}
    </div>
  );
}

/*
 * PatientCardSkeleton - Patient info card
 */
export function PatientCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          {/* Name */}
          <Skeleton className="h-4 w-36 mb-2" />
          {/* Details */}
          <div className="flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        {/* Action */}
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

/*
 * PatientListSkeleton - List of patient cards
 */
export function PatientListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <PatientCardSkeleton key={i} />
      ))}
    </div>
  );
}

/*
 * ProfileSkeleton - User profile page
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

/*
 * LabReportSkeleton - Lab report card
 */
export function LabReportSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          {/* Title */}
          <Skeleton className="h-4 w-48 mb-2" />
          {/* Date & Lab */}
          <div className="flex gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        {/* Download button */}
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

/*
 * LabReportListSkeleton - List of lab reports
 */
export function LabReportListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <LabReportSkeleton key={i} />
      ))}
    </div>
  );
}

/*
 * PrescriptionSkeleton - Prescription page
 */
export function PrescriptionSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Doctor & Patient */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="text-right">
          <Skeleton className="h-3 w-16 mb-2 ml-auto" />
          <Skeleton className="h-5 w-28 mb-1 ml-auto" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      </div>

      {/* Diagnosis */}
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* Medications */}
      <div>
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-6 h-6 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/*
 * TableSkeleton - Data table
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-gray-50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4 flex-1"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/*
 * ChatMessageSkeleton - Chat message
 */
export function ChatMessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className={cn('max-w-[70%]', isOwn && 'items-end')}>
        <Skeleton
          className={cn(
            'h-16 rounded-2xl',
            isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'
          )}
          style={{ width: `${150 + Math.random() * 100}px` }}
        />
        <Skeleton className="h-3 w-12 mt-1" />
      </div>
    </div>
  );
}

/*
 * ChatListSkeleton - List of chat messages
 */
export function ChatListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChatMessageSkeleton key={i} isOwn={i % 3 === 0} />
      ))}
    </div>
  );
}

/*
 * CardSkeleton - Generic card
 */
export function CardSkeleton({
  hasImage = false,
  lines = 3,
}: {
  hasImage?: boolean;
  lines?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {hasImage && <Skeleton className="h-40 w-full" />}
      <div className="p-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${70 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    </div>
  );
}
