'use client';

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function SearchBar() {
    return (
        <div className="sticky top-0 z-40 bg-white pt-4 pb-2 px-4">
            <Link href="/search">
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full shadow-airbnb-card hover:shadow-airbnb transition-shadow p-3 pl-4 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <Search className="w-5 h-5 text-black stroke-[2.5px]" />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">Find a Doctor</span>
                            <span className="text-xs text-gray-500 truncate max-w-[200px]">Search by name, specialty or location</span>
                        </div>
                    </div>
                    <div className="p-2 border border-gray-200 rounded-full">
                        <SlidersHorizontal className="w-4 h-4 text-gray-900" />
                    </div>
                </div>
            </Link>
        </div>
    );
}
