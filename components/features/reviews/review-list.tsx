'use client';

import React, { useState, useEffect } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Review {
    id: string;
    rating: number;
    comment: string;
    is_anonymous: boolean;
    created_at: string;
    patient_name?: string;
    patient_avatar?: string;
}

interface ReviewListProps {
    doctorId: string;
    refreshTrigger?: number;
}

export function ReviewList({ doctorId, refreshTrigger = 0 }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, [doctorId, refreshTrigger]);

    const fetchReviews = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/doctors/${doctorId}/reviews?limit=20`);
            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();
            setReviews(data.reviews || []);
        } catch (err: any) {
            console.error('Error fetching reviews:', err);
            setError(err.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-medical-blue" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserCircle2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No Reviews Yet</h3>
                <p className="text-gray-500 text-sm">Be the first to review this doctor</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review, index) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border-2 border-gray-100">
                            {!review.is_anonymous && review.patient_avatar ? (
                                <AvatarImage src={review.patient_avatar} alt={review.patient_name} />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-medical-blue font-semibold">
                                {review.is_anonymous ? '?' : review.patient_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {review.is_anonymous ? 'Anonymous' : review.patient_name || 'Patient'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(review.created_at), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                                <StarRating value={review.rating} readonly size="sm" />
                            </div>

                            {review.comment && (
                                <p className="text-gray-700 text-sm leading-relaxed mt-3">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
