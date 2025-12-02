'use client';

import React, { useState } from 'react';
import { FlaskConical, Search, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const labTests = [
    {
        id: 1,
        name: 'Complete Blood Count (CBC)',
        description: 'Measures different components of blood',
        price: 299,
        duration: '24 hours',
        category: 'Blood Test',
    },
    {
        id: 2,
        name: 'Lipid Profile',
        description: 'Cholesterol and triglycerides test',
        price: 599,
        duration: '24 hours',
        category: 'Blood Test',
    },
    {
        id: 3,
        name: 'Thyroid Function Test',
        description: 'T3, T4, and TSH levels',
        price: 749,
        duration: '48 hours',
        category: 'Hormone Test',
    },
    {
        id: 4,
        name: 'HbA1c (Diabetes)',
        description: 'Blood sugar control test',
        price: 449,
        duration: '24 hours',
        category: 'Diabetes Test',
    },
    {
        id: 5,
        name: 'Liver Function Test (LFT)',
        description: 'Assess liver health',
        price: 699,
        duration: '24 hours',
        category: 'Organ Function',
    },
    {
        id: 6,
        name: 'Kidney Function Test (KFT)',
        description: 'Assess kidney health',
        price: 699,
        duration: '24 hours',
        category: 'Organ Function',
    },
    {
        id: 7,
        name: 'Vitamin D Test',
        description: 'Vitamin D levels',
        price: 899,
        duration: '48 hours',
        category: 'Vitamin Test',
    },
    {
        id: 8,
        name: 'Vitamin B12 Test',
        description: 'B12 deficiency test',
        price: 799,
        duration: '48 hours',
        category: 'Vitamin Test',
    },
];

export default function LabTestsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTests = labTests.filter((test) =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/dashboard">
                        <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-purple-600" />
                            Lab Tests
                        </h1>
                        <p className="text-xs text-gray-500">Book diagnostic tests at home</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tests..."
                        className="pl-10 h-12 rounded-2xl bg-white border-gray-200"
                    />
                </div>

                {/* Popular Categories */}
                <div>
                    <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Popular Categories</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {['Blood Test', 'Organ Function', 'Diabetes Test', 'Vitamin Test'].map((category) => (
                            <button
                                key={category}
                                className="bg-white p-3 rounded-2xl border border-gray-100 text-left hover:border-purple-200 hover:bg-purple-50 transition-colors group"
                            >
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-600">{category}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {labTests.filter((t) => t.category === category).length} tests
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lab Tests List */}
                <div>
                    <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">
                        All Tests ({filteredTests.length})
                    </h2>
                    <div className="space-y-3">
                        {filteredTests.map((test) => (
                            <div
                                key={test.id}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-sm">{test.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{test.description}</p>
                                    </div>
                                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                        {test.category}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-gray-400">Price</p>
                                            <p className="text-lg font-bold text-gray-900">₹{test.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Result in</p>
                                            <p className="text-sm font-semibold text-gray-700">{test.duration}</p>
                                        </div>
                                    </div>
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 h-9 text-sm">
                                        Book Now
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {filteredTests.length === 0 && (
                    <div className="text-center py-12">
                        <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-bold text-gray-900 mb-1">No tests found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your search</p>
                    </div>
                )}
            </div>
        </div>
    );
}
