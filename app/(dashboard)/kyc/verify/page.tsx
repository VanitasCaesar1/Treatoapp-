"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Upload, CheckCircle, AlertCircle, FileText, CreditCard } from "lucide-react";
import { KYCStatusBadge } from "@/components/kyc/KYCStatusBadge";
import { toast } from "sonner";

export default function KYCVerifyPage() {
    const router = useRouter();
    const [kycStatus, setKycStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Aadhaar state
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
    const [shareCode, setShareCode] = useState("");

    // PAN state
    const [panNumber, setPanNumber] = useState("");
    const [panName, setPanName] = useState("");
    const [panDOB, setPanDOB] = useState("");

    useEffect(() => {
        fetchKYCStatus();
    }, []);

    const fetchKYCStatus = async () => {
        try {
            const response = await fetch("/api/kyc/status");
            const data = await response.json();
            setKycStatus(data);
        } catch (error) {
            console.error("Failed to fetch KYC status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAadhaarUpload = async () => {
        if (!aadhaarFile || !shareCode) {
            toast.error("Please select Aadhaar XML file and enter share code");
            return;
        }

        setUploading(true);
        try {
            // Read file as base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = btoa(e.target?.result as string);

                const response = await fetch("/api/kyc/aadhaar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        xml_data: base64Data,
                        share_code: shareCode,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    toast.success("Aadhaar verified successfully!");
                    fetchKYCStatus();
                    setAadhaarFile(null);
                    setShareCode("");
                } else {
                    toast.error(data.error || "Aadhaar verification failed");
                }
            };
            reader.readAsText(aadhaarFile);
        } catch (error) {
            toast.error("Failed to upload Aadhaar");
        } finally {
            setUploading(false);
        }
    };

    const handlePANUpload = async () => {
        if (!panNumber || !panName || !panDOB) {
            toast.error("Please fill all PAN details");
            return;
        }

        // Validate PAN format
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
        if (!panRegex.test(panNumber.toUpperCase())) {
            toast.error("Invalid PAN format. Should be ABCDE1234F");
            return;
        }

        setUploading(true);
        try {
            const response = await fetch("/api/kyc/pan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pan_number: panNumber.toUpperCase(),
                    pan_name: panName,
                    pan_dob: panDOB,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("PAN submitted for verification!");
                fetchKYCStatus();
                setPanNumber("");
                setPanName("");
                setPanDOB("");
            } else {
                toast.error(data.error || "Failed to submit PAN");
            }
        } catch (error) {
            toast.error("Failed to upload PAN");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    const isVerified = kycStatus?.status === "verified";
    const aadhaarVerified = kycStatus?.aadhaar_verified || false;
    const panVerified = kycStatus?.pan_verified || false;

    return (
        <div className="container mx-auto p-4 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">KYC Verification</h1>
                    <p className="text-muted-foreground mt-1">
                        Complete your identity verification for insurance claims
                    </p>
                </div>
                <KYCStatusBadge status={kycStatus?.status || "not_started"} />
            </div>

            {/* Benefits Banner */}
            {!isVerified && (
                <Alert className="bg-blue-50 border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                        Complete KYC to enable cashless insurance claims and faster appointment bookings
                    </AlertDescription>
                </Alert>
            )}

            {/* Insurance Ready Banner */}
            {isVerified && (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900 font-medium">
                        🎉 You're verified and ready for insurance claims!
                    </AlertDescription>
                </Alert>
            )}

            {/* Verification Tabs */}
            <Tabs defaultValue="aadhaar" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="aadhaar" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Aadhaar Verification
                        {aadhaarVerified && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </TabsTrigger>
                    <TabsTrigger value="pan" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        PAN Verification
                        {panVerified && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </TabsTrigger>
                </TabsList>

                {/* Aadhaar Tab */}
                <TabsContent value="aadhaar">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aadhaar Verification (Offline)</CardTitle>
                            <CardDescription>
                                Download your Aadhaar XML from UIDAI and upload it here for instant verification
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {aadhaarVerified ? (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-900">
                                        Aadhaar verified successfully!
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                        <h4 className="font-semibold text-sm">How to download Aadhaar XML:</h4>
                                        <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                                            <li>Visit <a href="https://myaadhaar.uidai.gov.in/" target="_blank" className="text-blue-600 underline">myaadhaar.uidai.gov.in</a></li>
                                            <li>Select "Download Aadhaar" → "Offline eKYC"</li>
                                            <li>Enter Aadhaar number and generate OTP</li>
                                            <li>Download the XML file and remember the password</li>
                                        </ol>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="aadhaar-file">Upload Aadhaar XML File</Label>
                                            <Input
                                                id="aadhaar-file"
                                                type="file"
                                                accept=".xml"
                                                onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                                                className="mt-1.5"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="share-code">Share Code (Password)</Label>
                                            <Input
                                                id="share-code"
                                                type="password"
                                                placeholder="Enter the 4-digit password"
                                                value={shareCode}
                                                onChange={(e) => setShareCode(e.target.value)}
                                                className="mt-1.5"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleAadhaarUpload}
                                            disabled={!aadhaarFile || !shareCode || uploading}
                                            className="w-full"
                                        >
                                            {uploading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Verify Aadhaar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PAN Tab */}
                <TabsContent value="pan">
                    <Card>
                        <CardHeader>
                            <CardTitle>PAN Verification</CardTitle>
                            <CardDescription>
                                Enter your PAN details for manual verification
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {panVerified ? (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-900">
                                        PAN verified successfully!
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="pan-number">PAN Number</Label>
                                        <Input
                                            id="pan-number"
                                            type="text"
                                            placeholder="ABCDE1234F"
                                            value={panNumber}
                                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                            maxLength={10}
                                            className="mt-1.5 uppercase"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="pan-name">Name as per PAN</Label>
                                        <Input
                                            id="pan-name"
                                            type="text"
                                            placeholder="Full Name"
                                            value={panName}
                                            onChange={(e) => setPanName(e.target.value)}
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="pan-dob">Date of Birth</Label>
                                        <Input
                                            id="pan-dob"
                                            type="date"
                                            value={panDOB}
                                            onChange={(e) => setPanDOB(e.target.value)}
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">
                                            Your PAN will be verified manually by our team within 24-48 hours
                                        </AlertDescription>
                                    </Alert>

                                    <Button
                                        onClick={handlePANUpload}
                                        disabled={!panNumber || !panName || !panDOB || uploading}
                                        className="w-full"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Submit PAN
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Progress Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Verification Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Aadhaar Verification</span>
                            {aadhaarVerified ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">PAN Verification</span>
                            {panVerified ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm font-medium">Insurance Ready</span>
                            {aadhaarVerified && panVerified ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
