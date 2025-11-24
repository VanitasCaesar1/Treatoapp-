'use client';

import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { BottomSheet } from './bottom-sheet';
import { cn } from '@/lib/utils';
import { useCapacitor } from '@/lib/capacitor';

export interface SelectMobileOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectMobileProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    options: SelectMobileOption[];
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

export function SelectMobile({
    label,
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    error,
    disabled,
    className,
}: SelectMobileProps) {
    const capacitor = useCapacitor();
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (optionValue: string) => {
        capacitor.lightHaptic();
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleOpen = () => {
        if (!disabled) {
            capacitor.lightHaptic();
            setIsOpen(true);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <div className={cn('relative', className)}>
                <button
                    type="button"
                    onClick={handleOpen}
                    disabled={disabled}
                    className={cn(
                        'w-full h-14 px-4 pt-6 pb-2 text-left',
                        'bg-white border-2 rounded-airbnb',
                        'transition-all duration-200 touch-target',
                        'focus:outline-none focus:ring-0',
                        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                        'active:scale-[0.99]',
                        !error && 'border-gray-300 focus:border-medical-blue',
                        error && 'border-red-500'
                    )}
                >
                    {/* Floating Label */}
                    <span className="absolute left-4 top-2 text-xs font-medium text-gray-600">
                        {label}
                    </span>

                    {/* Selected Value */}
                    <span
                        className={cn(
                            'block text-base truncate',
                            selectedOption ? 'text-gray-900' : 'text-gray-400'
                        )}
                    >
                        {selectedOption?.label || placeholder}
                    </span>

                    {/* Chevron Icon */}
                    <ChevronDown
                        className={cn(
                            'absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </button>

                {/* Error Message */}
                {error && (
                    <p className="text-sm text-red-500 mt-1.5 ml-1">{error}</p>
                )}
            </div>

            {/* BottomSheet with Options */}
            <BottomSheet
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={label}
                size="md"
            >
                <div className="space-y-1">
                    {options.map((option) => {
                        const isSelected = option.value === value;

                        return (
                            <button
                                key={option.value}
                                onClick={() => !option.disabled && handleSelect(option.value)}
                                disabled={option.disabled}
                                className={cn(
                                    'w-full flex items-center justify-between',
                                    'px-4 py-4 rounded-lg touch-target',
                                    'transition-all duration-200',
                                    'text-left',
                                    'active:scale-[0.98]',
                                    isSelected
                                        ? 'bg-medical-blue/10 text-medical-blue'
                                        : 'hover:bg-gray-50 text-gray-900',
                                    option.disabled && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <span className={cn(
                                    'text-base',
                                    isSelected && 'font-semibold'
                                )}>
                                    {option.label}
                                </span>

                                {isSelected && (
                                    <Check className="h-5 w-5 text-medical-blue" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </BottomSheet>
        </>
    );
}
