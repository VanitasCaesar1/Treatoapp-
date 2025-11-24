'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    value: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
}

export function StarRating({ value, onChange, readonly = false, size = 'md', showValue = false }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const handleClick = (rating: number) => {
        if (!readonly && onChange) {
            onChange(rating);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverValue || value) >= star;
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => !readonly && setHoverValue(star)}
                        onMouseLeave={() => !readonly && setHoverValue(0)}
                        disabled={readonly}
                        className={cn(
                            'transition-all',
                            !readonly && 'cursor-pointer hover:scale-110',
                            readonly && 'cursor-default'
                        )}
                    >
                        <Star
                            className={cn(
                                sizes[size],
                                'transition-colors',
                                isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            )}
                        />
                    </button>
                );
            })}
            {showValue && value > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-700">{value.toFixed(1)}</span>
            )}
        </div>
    );
}
