'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Video, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsultationTypeSelectorProps {
    value: 'in-person' | 'online';
    onChange: (type: 'in-person' | 'online') => void;
    doctorSupportsVideo?: boolean;
}

export function ConsultationTypeSelector({
    value,
    onChange,
    doctorSupportsVideo = true
}: ConsultationTypeSelectorProps) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900">Consultation Type</label>

            <div className="grid grid-cols-2 gap-3">
                {/* In-Person Option */}
                <button
                    type="button"
                    onClick={() => onChange('in-person')}
                    className={cn(
                        "relative p-4 rounded-xl border-2 transition-all text-left",
                        value === 'in-person'
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                >
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            value === 'in-person' ? "bg-blue-100" : "bg-gray-100"
                        )}>
                            <Building2 className={cn(
                                "h-6 w-6",
                                value === 'in-person' ? "text-blue-600" : "text-gray-600"
                            )} />
                        </div>
                        <div>
                            <div className="font-semibold text-sm">In-Person</div>
                            <div className="text-xs text-gray-500">Visit clinic</div>
                        </div>
                    </div>
                    {value === 'in-person' && (
                        <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    )}
                </button>

                {/* Video Option */}
                <button
                    type="button"
                    onClick={() => onChange('online')}
                    disabled={!doctorSupportsVideo}
                    className={cn(
                        "relative p-4 rounded-xl border-2 transition-all text-left",
                        !doctorSupportsVideo && "opacity-50 cursor-not-allowed",
                        value === 'online'
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                >
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            value === 'online' ? "bg-blue-100" : "bg-gray-100"
                        )}>
                            <Video className={cn(
                                "h-6 w-6",
                                value === 'online' ? "text-blue-600" : "text-gray-600"
                            )} />
                        </div>
                        <div>
                            <div className="font-semibold text-sm">Video Call</div>
                            <div className="text-xs text-gray-500">
                                {doctorSupportsVideo ? 'Online consult' : 'Not available'}
                            </div>
                        </div>
                    </div>
                    {value === 'online' && (
                        <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    )}
                </button>
            </div>

            {value === 'online' && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Video className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                        You'll receive a video call link after payment. Join from appointments page.
                    </p>
                </div>
            )}
        </div>
    );
}
