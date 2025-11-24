'use client';

import React, { useState } from 'react';
import { Search, ArrowLeft, Pill, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock Data for Medicines
const MOCK_MEDICINES = [
    { id: 1, name: 'Paracetamol', generic: 'Acetaminophen', strength: '500mg', form: 'Tablet', manufacturer: 'HealthCare Inc.' },
    { id: 2, name: 'Amoxicillin', generic: 'Amoxicillin', strength: '250mg', form: 'Capsule', manufacturer: 'PharmaCorp' },
    { id: 3, name: 'Ibuprofen', generic: 'Ibuprofen', strength: '400mg', form: 'Tablet', manufacturer: 'PainRelief Ltd.' },
    { id: 4, name: 'Cetirizine', generic: 'Cetirizine Hydrochloride', strength: '10mg', form: 'Tablet', manufacturer: 'AllergyFree' },
    { id: 5, name: 'Metformin', generic: 'Metformin Hydrochloride', strength: '500mg', form: 'Tablet', manufacturer: 'DiabetesCare' },
];

export default function MedicineSearchPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState(MOCK_MEDICINES);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === '') {
            setResults(MOCK_MEDICINES);
        } else {
            const filtered = MOCK_MEDICINES.filter(med =>
                med.name.toLowerCase().includes(query.toLowerCase()) ||
                med.generic.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search medicines..."
                        className="pl-9 h-10 bg-gray-100 border-none rounded-full focus-visible:ring-0"
                    />
                </div>
            </div>

            <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Medicines</h2>

                <div className="space-y-3">
                    {results.map((med) => (
                        <div key={med.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-gray-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Pill className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{med.name}</h3>
                                    <p className="text-xs text-gray-500">{med.generic}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">{med.form}</span>
                                        <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">{med.strength}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                        </div>
                    ))}

                    {results.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No medicines found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
