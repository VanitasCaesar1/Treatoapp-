"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, X } from "lucide-react";

export function KYCBanner() {
    const router = useRouter();
    const [kycStatus, setKycStatus] = useState<any>(null);
    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if banner was dismissed
        const isDismissed = localStorage.getItem("kyc_banner_dismissed");
        if (isDismissed) {
            setDismissed(true);
            setLoading(false);
            return;
        }

        // Fetch KYC status
        fetch("/api/kyc/status")
            .then((res) => res.json())
            .then((data) => {
                setKycStatus(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem("kyc_banner_dismissed", "true");
    };

    if (loading || dismissed) return null;

    // Don't show if already verified
    if (kycStatus?.status === "verified") return null;

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-100 opacity-20" />
            <div className="absolute right-12 top-8 h-16 w-16 rounded-full bg-indigo-100 opacity-20" />

            <CardContent className="pt-6 relative">
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                            Complete KYC for Insurance Claims
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Verify your identity with Aadhaar and PAN to enable cashless insurance and faster appointments
                        </p>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => router.push("/kyc/verify")}
                                className="bg-blue-600 hover:bg-blue-700"
                                size="sm"
                            >
                                Start Verification
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>

                            {kycStatus?.aadhaar_verified && !kycStatus?.pan_verified && (
                                <span className="text-xs text-green-600 font-medium">
                                    ✓ Aadhaar verified
                                </span>
                            )}
                            {!kycStatus?.aadhaar_verified && kycStatus?.pan_verified && (
                                <span className="text-xs text-green-600 font-medium">
                                    ✓ PAN verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
