'use client';

import React, { use, useEffect, useState } from 'react';
import { ArrowLeft, Download, Share2, Loader2, AlertCircle, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface PrescriptionData {
    id: string;
    date: string;
    doctor: {
        name: string;
        specialty: string;
        regNo: string;
        hospital: string;
        phone?: string;
    };
    patient: {
        name: string;
        age: number;
        gender: string;
        id: string;
    };
    diagnosis: string;
    vitals: {
        bp?: string;
        pulse?: string;
        weight?: string;
        temperature?: string;
        spo2?: string;
    };
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }>;
    advice: string[];
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function PrescriptionPage({ params }: PageProps) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/appointments/${unwrappedParams.id}/prescription`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch prescription');
                }

                const data = await response.json();
                setPrescription(data);
            } catch (err) {
                console.error('Error fetching prescription:', err);
                setError('Could not load prescription');
            } finally {
                setLoading(false);
            }
        };

        fetchPrescription();
    }, [unwrappedParams.id]);

    const handleDownloadPDF = async () => {
        if (!prescription) return;
        
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Medium });
        }
        
        setDownloading(true);
        try {
            // Fetch PDF from backend
            const response = await fetch(`/api/appointments/${unwrappedParams.id}/prescription/pdf`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const blob = await response.blob();
            const fileName = `prescription-${prescription.id}.pdf`;

            if (Capacitor.isNativePlatform()) {
                // Save to device on mobile
                const base64 = await blobToBase64(blob);
                await Filesystem.writeFile({
                    path: fileName,
                    data: base64,
                    directory: Directory.Documents,
                });
                
                // Share the file
                await Share.share({
                    title: `Prescription - ${prescription.id}`,
                    url: `file://${Directory.Documents}/${fileName}`,
                });
            } else {
                // Download on web
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Error downloading PDF:', err);
        } finally {
            setDownloading(false);
        }
    };

    const handleShare = async () => {
        if (!prescription) return;
        
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Light });
            await Share.share({
                title: `Prescription - ${prescription.id}`,
                text: `Prescription from Dr. ${prescription.doctor.name}`,
                url: window.location.href,
            });
        } else if (navigator.share) {
            try {
                await navigator.share({
                    title: `Prescription - ${prescription.id}`,
                    text: `Prescription from Dr. ${prescription.doctor.name}`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !prescription) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Prescription Not Found</h2>
                <p className="text-gray-500 mb-6">{error || 'Could not load prescription'}</p>
                <Button onClick={() => router.back()} variant="outline">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 print:pb-0 print:bg-white">
            {/* Header - hidden on print */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="font-semibold text-gray-900">Prescription</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="p-2 hover:bg-gray-100 rounded-full hidden md:block">
                        <Printer className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform">
                        <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="p-4 print:p-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-2xl mx-auto print:shadow-none print:border-0 print:max-w-none">
                    {/* Hospital Header */}
                    <div className="text-center border-b border-gray-100 pb-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{prescription.doctor.hospital}</h2>
                    </div>

                    {/* Doctor & Patient Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Doctor</p>
                            <p className="font-semibold text-gray-900">Dr. {prescription.doctor.name}</p>
                            <p className="text-sm text-gray-500">{prescription.doctor.specialty}</p>
                            <p className="text-xs text-gray-400 mt-1">Reg: {prescription.doctor.regNo}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Patient</p>
                            <p className="font-semibold text-gray-900">{prescription.patient.name}</p>
                            <p className="text-sm text-gray-500">{prescription.patient.age} Y / {prescription.patient.gender}</p>
                            <p className="text-xs text-gray-400 mt-1">ID: {prescription.patient.id}</p>
                        </div>
                    </div>

                    {/* Vitals & Diagnosis */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-8">
                        {prescription.vitals && Object.values(prescription.vitals).some(v => v) && (
                            <div className="grid grid-cols-3 gap-4 mb-4 border-b border-gray-200 pb-4">
                                {prescription.vitals.bp && (
                                    <div>
                                        <p className="text-xs text-gray-500">BP</p>
                                        <p className="font-medium text-gray-900">{prescription.vitals.bp}</p>
                                    </div>
                                )}
                                {prescription.vitals.pulse && (
                                    <div>
                                        <p className="text-xs text-gray-500">Pulse</p>
                                        <p className="font-medium text-gray-900">{prescription.vitals.pulse}</p>
                                    </div>
                                )}
                                {prescription.vitals.weight && (
                                    <div>
                                        <p className="text-xs text-gray-500">Weight</p>
                                        <p className="font-medium text-gray-900">{prescription.vitals.weight}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Diagnosis</p>
                            <p className="font-semibold text-gray-900">{prescription.diagnosis}</p>
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center gap-2">
                            <span className="text-xl">Rx</span> Medications
                        </h3>
                        <div className="space-y-4">
                            {prescription.medications.map((med, index) => (
                                <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-semibold text-gray-900">{med.name} <span className="text-sm font-normal text-gray-500">({med.dosage})</span></p>
                                        {med.instructions && <p className="text-sm text-gray-600 mt-0.5">{med.instructions}</p>}
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
                    {prescription.advice.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Advice</h3>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {prescription.advice.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-end pt-8 mt-8 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                            Date: {new Date(prescription.date).toLocaleDateString()}<br />
                            ID: {prescription.id}
                        </div>
                        <div className="text-center">
                            <div className="h-12 w-32 mb-2 flex items-end justify-center border-b border-gray-300">
                            </div>
                            <p className="text-xs font-medium text-gray-900">Dr. {prescription.doctor.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button - hidden on print */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 print:hidden safe-area-bottom">
                <Button 
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="w-full h-12 rounded-xl bg-black text-white font-semibold gap-2 active:scale-[0.98] transition-transform"
                >
                    {downloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {downloading ? 'Generating...' : 'Download PDF'}
                </Button>
            </div>
        </div>
    );
}

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
