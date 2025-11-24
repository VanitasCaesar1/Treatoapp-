'use client';

import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FloatingLabelInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label: string;
    error?: string;
    success?: boolean;
    helperText?: string;
    containerClassName?: string;
}

export function FloatingLabelInput({
    label,
    error,
    success,
    helperText,
    containerClassName,
    className,
    type = 'text',
    ...props
}: FloatingLabelInputProps) {
    const id = useId();
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = !!props.value || !!props.defaultValue;
    const isFloating = isFocused || hasValue;

    return (
        <div className={cn('relative', containerClassName)}>
            {/* Input Container */}
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    className={cn(
                        'peer w-full h-14 px-4 pt-6 pb-2',
                        'bg-white border-2 rounded-airbnb',
                        'text-base text-gray-900 placeholder-transparent',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-0',
                        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                        // Default state
                        !error && !success && 'border-gray-300 focus:border-medical-blue',
                        // Error state
                        error && 'border-red-500 focus:border-red-500',
                        // Success state
                        success && 'border-green-500',
                        className
                    )}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {/* Floating Label */}
                <label
                    htmlFor={id}
                    className={cn(
                        'absolute left-4 transition-all duration-200 pointer-events-none',
                        'text-gray-600',
                        // Floating state
                        isFloating
                            ? 'top-2 text-xs font-medium'
                            : 'top-1/2 -translate-y-1/2 text-base',
                        // Focus state
                        isFocused && !error && !success && 'text-medical-blue',
                        // Error state
                        error && 'text-red-500',
                        // Success state
                        success && 'text-green-600'
                    )}
                >
                    {label}
                </label>

                {/* Success/Error Icon */}
                <AnimatePresence>
                    {(success || error) && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            {success && (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}
                            {error && (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Helper/Error Text */}
            <AnimatePresence mode="wait">
                {(error || helperText) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <p
                            className={cn(
                                'text-sm mt-1.5 ml-1',
                                error ? 'text-red-500' : 'text-gray-500'
                            )}
                        >
                            {error || helperText}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Floating Label Textarea
export interface FloatingLabelTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    helperText?: string;
    containerClassName?: string;
}

export function FloatingLabelTextarea({
    label,
    error,
    helperText,
    containerClassName,
    className,
    ...props
}: FloatingLabelTextareaProps) {
    const id = useId();
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = !!props.value || !!props.defaultValue;
    const isFloating = isFocused || hasValue;

    return (
        <div className={cn('relative', containerClassName)}>
            <div className="relative">
                <textarea
                    id={id}
                    className={cn(
                        'peer w-full min-h-[120px] px-4 pt-6 pb-2',
                        'bg-white border-2 rounded-airbnb',
                        'text-base text-gray-900 placeholder-transparent',
                        'transition-all duration-200 resize-none',
                        'focus:outline-none focus:ring-0',
                        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                        !error && 'border-gray-300 focus:border-medical-blue',
                        error && 'border-red-500 focus:border-red-500',
                        className
                    )}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                <label
                    htmlFor={id}
                    className={cn(
                        'absolute left-4 transition-all duration-200 pointer-events-none',
                        'text-gray-600',
                        isFloating
                            ? 'top-2 text-xs font-medium'
                            : 'top-6 text-base',
                        isFocused && !error && 'text-medical-blue',
                        error && 'text-red-500'
                    )}
                >
                    {label}
                </label>
            </div>

            <AnimatePresence mode="wait">
                {(error || helperText) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <p
                            className={cn(
                                'text-sm mt-1.5 ml-1',
                                error ? 'text-red-500' : 'text-gray-500'
                            )}
                        >
                            {error || helperText}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
