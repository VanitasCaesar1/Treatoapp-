'use client';

import React from 'react';
import { Heart, Stethoscope, Brain, Eye, Baby, Bone, Activity, Pill, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/lib/hooks/use-haptics';

const categories = [
    { name: 'All', icon: Stethoscope },
    { name: 'General', icon: Activity },
    { name: 'Cardiology', icon: Heart },
    { name: 'Neurology', icon: Brain },
    { name: 'Orthopedics', icon: Bone },
    { name: 'Pediatrics', icon: Baby },
    { name: 'Ophthalmology', icon: Eye },
    { name: 'Dermatology', icon: Smile },
    { name: 'Psychiatry', icon: Brain },
];

interface CategoryBarProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function CategoryBar({ selectedCategory, onSelectCategory }: CategoryBarProps) {
    const { selectionChanged } = useHaptics();

    const handleSelect = (category: string) => {
        selectionChanged();
        onSelectCategory(category);
    };

    return (
        <div className="w-full bg-white pt-2 pb-4 sticky top-[110px] z-20">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex space-x-3 pr-4">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        const isSelected = selectedCategory === category.name;

                        return (
                            <button
                                key={category.name}
                                onClick={() => handleSelect(category.name)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap border",
                                    isSelected
                                        ? "bg-medical-blue text-white border-medical-blue shadow-md shadow-blue-100"
                                        : "bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-gray-500")} />
                                <span className="text-sm font-semibold">{category.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
