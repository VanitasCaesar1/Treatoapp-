'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, FileText, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import toast from 'react-hot-toast';

interface LabReportUploaderProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  diagnosisId?: string;
  appointmentId?: string;
  onSuccess?: (report: any) => void;
}

export function LabReportUploader({
  open,
  onClose,
  patientId,
  diagnosisId,
  appointmentId,
  onSuccess,
}: LabReportUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reportName, setReportName] = useState('');
  const [testName, setTestName] = useState('');
  const [labName, setLabName] = useState('');
  const [testDate, setTestDate] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNative = Capacitor.isNativePlatform();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReportName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleCameraCapture = async () => {
    if (!isNative) {
      // Fallback for web - open file picker with camera
      fileInputRef.current?.click();
      return;
    }

    try {
      const photo = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (photo.base64String) {
        // Convert base64 to File
        const byteString = atob(photo.base64String);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: `image/${photo.format}` });
        const capturedFile = new File([blob], `lab_report_${Date.now()}.${photo.format}`, {
          type: `image/${photo.format}`,
        });

        setFile(capturedFile);
        setReportName(`Lab Report ${new Date().toLocaleDateString()}`);
        setPreview(`data:image/${photo.format};base64,${photo.base64String}`);
      }
    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        console.error('Camera error:', error);
        toast.error('Failed to capture photo');
      }
    }
  };

  const handleGallerySelect = async () => {
    if (!isNative) {
      fileInputRef.current?.click();
      return;
    }

    try {
      const photo = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });

      if (photo.base64String) {
        const byteString = atob(photo.base64String);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: `image/${photo.format}` });
        const selectedFile = new File([blob], `lab_report_${Date.now()}.${photo.format}`, {
          type: `image/${photo.format}`,
        });

        setFile(selectedFile);
        setReportName(`Lab Report ${new Date().toLocaleDateString()}`);
        setPreview(`data:image/${photo.format};base64,${photo.base64String}`);
      }
    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        console.error('Gallery error:', error);
        toast.error('Failed to select photo');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patient_id', patientId);
      formData.append('report_name', reportName || file.name);
      formData.append('report_type', 'lab_test');
      if (diagnosisId) formData.append('diagnosis_id', diagnosisId);
      if (appointmentId) formData.append('appointment_id', appointmentId);
      if (testName) formData.append('test_name', testName);
      if (labName) formData.append('lab_name', labName);
      if (testDate) formData.append('test_date', testDate);
      if (notes) formData.append('notes', notes);

      const response = await fetch('/api/lab-reports', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      toast.success('Lab report uploaded successfully');
      onSuccess?.(data);
      handleClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload lab report');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setReportName('');
    setTestName('');
    setLabName('');
    setTestDate('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Lab Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* File Selection */}
          {!file ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCameraCapture}
                  className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="h-8 w-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Take Photo</span>
                </button>
                <button
                  onClick={handleGallerySelect}
                  className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Upload File</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                capture={isNative ? 'environment' : undefined}
              />
              <p className="text-xs text-center text-gray-500">
                Supports images and PDF files up to 20MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <Input
                  placeholder="Report Name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="h-11 rounded-xl"
                />
                <Input
                  placeholder="Test Name (e.g., CBC, Lipid Profile)"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="h-11 rounded-xl"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Lab Name"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                  <Input
                    type="date"
                    placeholder="Test Date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <Input
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Upload Report
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
