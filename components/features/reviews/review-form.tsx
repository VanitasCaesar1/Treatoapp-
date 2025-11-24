'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewFormProps {
    doctorId: string;
    doctorName: string;
    appointmentId?: string;
    onSuccess?: () => void;
}

export function ReviewForm({ doctorId, doctorName, appointmentId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/api/doctors/${doctorId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating,
                    comment: comment || null,
                    appointmentId,
                    isAnonymous,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit review');
            }

            setSubmitted(true);
            toast.success('Review submitted successfully!');

            // Reset form after slight delay
            setTimeout(() => {
                setRating(0);
                setComment('');
                setIsAnonymous(false);
                setSubmitted(false);
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {submitted ? (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
                >
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Thank You!</h3>
                    <p className="text-gray-600 text-sm">Your review has been submitted successfully.</p>
                </motion.div>
            ) : (
                <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5"
                >
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">How was your experience with {doctorName}?</h3>
                        <p className="text-sm text-gray-500">Your feedback helps others make better decisions</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Rating *</label>
                        <div className="flex items-center gap-2">
                            <StarRating value={rating} onChange={setRating} size="lg" />
                            {rating > 0 && (
                                <span className="text-sm text-gray-600 ml-2">
                                    {rating === 5 && 'Excellent!'}
                                    {rating === 4 && 'Great!'}
                                    {rating === 3 && 'Good'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 1 && 'Poor'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Your Review (Optional)</label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share details of your experience..."
                            className="min-h-[100px] rounded-xl resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="anonymous"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-medical-blue focus:ring-medical-blue"
                        />
                        <label htmlFor="anonymous" className="text-sm text-gray-600">
                            Post anonymously
                        </label>
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="w-full bg-medical-blue hover:bg-blue-700 text-white h-12 text-base font-semibold rounded-xl"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Review'
                        )}
                    </Button>
                </motion.form>
            )}
        </AnimatePresence>
    );
}
