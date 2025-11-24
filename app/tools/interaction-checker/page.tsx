'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, AlertOctagon, CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InteractionCheckerPage() {
    const router = useRouter();
    const [medications, setMedications] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [result, setResult] = useState<null | { safe: boolean, message: string }>(null);

    const handleAdd = () => {
        if (searchQuery && !medications.includes(searchQuery)) {
            setMedications([...medications, searchQuery]);
            setSearchQuery('');
            setResult(null); // Reset result when list changes
        }
    };

    const handleRemove = (med: string) => {
        setMedications(medications.filter(m => m !== med));
        setResult(null);
    };

    const checkInteractions = () => {
        // Mock logic for demonstration
        const meds = medications.map(m => m.toLowerCase());

        if (meds.includes('aspirin') && meds.includes('warfarin')) {
            setResult({
                safe: false,
                message: 'Major Interaction: Aspirin increases the risk of bleeding when taken with Warfarin.'
            });
        } else if (meds.includes('ibuprofen') && meds.includes('aspirin')) {
            setResult({
                safe: false,
                message: 'Moderate Interaction: Ibuprofen may reduce the heart-protective effects of Aspirin.'
            });
        } else {
            setResult({
                safe: true,
                message: 'No known interactions found between these medications.'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="font-semibold text-gray-900">Interaction Checker</h1>
            </div>

            <div className="p-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Add medications to check for potential interactions.
                    </p>

                    <div className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter medication name"
                                className="pl-9 bg-gray-50 border-gray-200"
                            />
                        </div>
                        <Button onClick={handleAdd} className="bg-black text-white w-10 p-0 rounded-lg">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {medications.map((med) => (
                            <div key={med} className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium text-gray-700">
                                {med}
                                <button onClick={() => handleRemove(med)} className="hover:text-red-500">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {medications.length === 0 && (
                            <span className="text-sm text-gray-400 italic">No medications added yet</span>
                        )}
                    </div>

                    <Button
                        onClick={checkInteractions}
                        disabled={medications.length < 2}
                        className="w-full h-12 rounded-xl bg-airbnb-red hover:bg-[#D90B3E] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Check Interactions
                    </Button>
                </div>

                {result && (
                    <div className={`p-6 rounded-2xl border ${result.safe ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                        } animate-in fade-in slide-in-from-bottom-4`}>
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${result.safe ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {result.safe ? <CheckCircle2 className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg mb-1 ${result.safe ? 'text-green-900' : 'text-red-900'
                                    }`}>
                                    {result.safe ? 'Safe to use' : 'Interaction Detected'}
                                </h3>
                                <p className={`text-sm leading-relaxed ${result.safe ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                    {result.message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
