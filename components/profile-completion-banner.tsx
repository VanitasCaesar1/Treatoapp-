'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, User, Phone } from 'lucide-react';

interface ProfileCompletionBannerProps {
    completionPercent: number;
    missingFields?: string[];
    onCompleteProfile?: () => void;
    returnTo?: string;
}

export function ProfileCompletionBanner({
    completionPercent,
    missingFields = [],
    onCompleteProfile,
    returnTo
}: ProfileCompletionBannerProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onCompleteProfile) {
            onCompleteProfile();
        } else {
            const url = returnTo ? `/profile?returnTo=${encodeURIComponent(returnTo)}` : '/profile';
            router.push(url);
        }
    };

    // Only show if profile is incomplete
    if (completionPercent >= 100) return null;

    return (
        <Card className="p-4 bg-amber-50 border-amber-200 mb-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-amber-900 mb-1">
                        Complete Your Profile
                    </h3>
                    <p className="text-sm text-amber-700 mb-3">
                        {completionPercent}% complete. {missingFields.length > 0 && (
                            <>Missing: {missingFields.join(', ')}</>
                        )}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-amber-200 rounded-full h-2 mb-3">
                        <div
                            className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionPercent}%` }}
                        />
                    </div>

                    <Button
                        onClick={handleClick}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        Complete Profile
                    </Button>
                </div>
            </div>
        </Card>
    );
}
