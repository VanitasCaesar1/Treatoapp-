'use client';

import React from 'react';
import { ArrowLeft, Download, Printer, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

// Mock Data
const PRESCRIPTION = {
    id: 'RX123456',
    date: '2024-03-15',
    doctor: {
        name: 'Dr. Sarah Wilson',
        specialty: 'Cardiologist',
        regNo: 'REG-88291',
        hospital: 'City General Hospital'
    },
    patient: {
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        id: 'P-99281'
    },
    diagnosis: 'Mild Hypertension',
    vitals: {
        bp: '130/85',
        pulse: '78',
        weight: '70kg'
    },
    medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: '1-0-0 (Morning)', duration: '30 days', instructions: 'Take after breakfast' },
        { name: 'Atorvastatin', dosage: '10mg', frequency: '0-0-1 (Night)', duration: '30 days', instructions: 'Take before bed' }
    ],
    advice: [
        'Reduce salt intake',
        'Daily 30 min walk',
        'Follow up after 1 month'
    ]
};

export default function PrescriptionPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="font-semibold text-gray-900">Prescription</h1>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="bg-white rounded-none md:rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-2xl mx-auto">
                    {/* Hospital Header */}
                    <div className="text-center border-b border-gray-100 pb-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{PRESCRIPTION.doctor.hospital}</h2>
                        <p className="text-sm text-gray-500">123 Medical Center Dr, New York, NY</p>
                    </div>

                    {/* Doctor & Patient Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Doctor</p>
                            <p className="font-semibold text-gray-900">{PRESCRIPTION.doctor.name}</p>
                            <p className="text-sm text-gray-500">{PRESCRIPTION.doctor.specialty}</p>
                            <p className="text-xs text-gray-400 mt-1">Reg: {PRESCRIPTION.doctor.regNo}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Patient</p>
                            <p className="font-semibold text-gray-900">{PRESCRIPTION.patient.name}</p>
                            <p className="text-sm text-gray-500">{PRESCRIPTION.patient.age} Y / {PRESCRIPTION.patient.gender}</p>
                            <p className="text-xs text-gray-400 mt-1">ID: {PRESCRIPTION.patient.id}</p>
                        </div>
                    </div>

                    {/* Vitals & Diagnosis */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-8">
                        <div className="grid grid-cols-3 gap-4 mb-4 border-b border-gray-200 pb-4">
                            <div>
                                <p className="text-xs text-gray-500">BP</p>
                                <p className="font-medium text-gray-900">{PRESCRIPTION.vitals.bp}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Pulse</p>
                                <p className="font-medium text-gray-900">{PRESCRIPTION.vitals.pulse}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Weight</p>
                                <p className="font-medium text-gray-900">{PRESCRIPTION.vitals.weight}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Diagnosis</p>
                            <p className="font-semibold text-gray-900">{PRESCRIPTION.diagnosis}</p>
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center gap-2">
                            <span className="text-xl">Rx</span> Medications
                        </h3>
                        <div className="space-y-4">
                            {PRESCRIPTION.medications.map((med, index) => (
                                <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-semibold text-gray-900">{med.name} <span className="text-sm font-normal text-gray-500">({med.dosage})</span></p>
                                        <p className="text-sm text-gray-600 mt-0.5">{med.instructions}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">{med.frequency}</p>
                                        <p className="text-xs text-gray-500">{med.duration}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advice */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Advice</h3>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {PRESCRIPTION.advice.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-end pt-8 mt-8 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                            Date: {PRESCRIPTION.date}<br />
                            ID: {PRESCRIPTION.id}
                        </div>
                        <div className="text-center">
                            <div className="h-12 w-32 mb-2 flex items-end justify-center">
                                <span className="font-dancing-script text-xl text-gray-400">Signature</span>
                            </div>
                            <p className="text-xs font-medium text-gray-900">{PRESCRIPTION.doctor.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 md:hidden">
                <Button className="w-full h-12 rounded-xl bg-black text-white font-semibold gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                </Button>
            </div>
        </div>
    );
}
