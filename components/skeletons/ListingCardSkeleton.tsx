import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function ListingCardSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {/* Image Skeleton */}
            <Skeleton className="aspect-square w-full rounded-xl" />

            {/* Content Skeleton */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-8 rounded-md" />
                </div>

                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-1/3 rounded-md" />

                <div className="flex items-baseline gap-1 mt-1">
                    <Skeleton className="h-5 w-16 rounded-md" />
                </div>
            </div>
        </div>
    );
}
