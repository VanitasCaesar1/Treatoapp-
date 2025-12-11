'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Status = 'loading' | 'success' | 'failed' | 'pending';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [appointmentData, setAppointmentData] = useState<any>(null);

  const merchantOrderId = searchParams.get('merchantOrderId');

  useEffect(() => {
    async function verifyPayment() {
      if (!merchantOrderId) {
        setStatus('failed');
        setMessage('Missing order information');
        return;
      }

      // Get stored appointment data
      const storedData = localStorage.getItem('pendingPayment');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.merchantOrderId === merchantOrderId) {
            setAppointmentData(parsed.appointmentData);
          }
        } catch (e) {
          console.error('Failed to parse stored payment data');
        }
      }

      // Poll for payment status
      for (let i = 0; i < 10; i++) {
        try {
          const response = await fetch(
            `/api/payment/status/${merchantOrderId}?details=true&errorContext=true`
          );
          const data = await response.json();

          if (data.state === 'COMPLETED') {
            setStatus('success');
            setMessage('Payment successful! Your appointment has been booked.');
            localStorage.removeItem('pendingPayment');
            localStorage.removeItem('bookingIntent');
            return;
          }

          if (data.state === 'FAILED') {
            setStatus('failed');
            setMessage(data.errorContext?.description || 'Payment failed. Please try again.');
            return;
          }

          // Wait 3 seconds before next check
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error('Status check error:', error);
        }
      }

      // Timeout - still pending
      setStatus('pending');
      setMessage('Payment is being processed. You will receive a confirmation shortly.');
    }

    verifyPayment();
  }, [merchantOrderId]);

  const handleContinue = () => {
    if (status === 'success') {
      router.push('/appointments');
    } else {
      router.push('/');
    }
  };

  const handleRetry = () => {
    // Go back to booking page
    const bookingIntent = localStorage.getItem('bookingIntent');
    if (bookingIntent) {
      try {
        const data = JSON.parse(bookingIntent);
        router.push(`/book-appointment/${data.doctorId}?org_id=${data.orgId}`);
        return;
      } catch (e) {}
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-blue-600" />
            <h2 className="mt-6 text-xl font-bold text-gray-900">
              Verifying Payment...
            </h2>
            <p className="mt-2 text-gray-500">
              Please wait while we confirm your payment
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-green-800">
              Payment Successful!
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            
            {appointmentData && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Appointment Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Date: {appointmentData.appointment_date}</p>
                  <p>Time: {appointmentData.appointment_time}</p>
                  <p>Type: {appointmentData.consultation_type}</p>
                  <p>Amount: ₹{(appointmentData.amount / 100).toFixed(2)}</p>
                </div>
              </div>
            )}

            <Button className="mt-6 w-full" onClick={handleContinue}>
              View My Appointments
            </Button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-red-800">
              Payment Failed
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            
            <div className="mt-6 space-y-3">
              <Button className="w-full" onClick={handleRetry}>
                Try Again
              </Button>
              <Button variant="outline" className="w-full" onClick={handleContinue}>
                Go Home
              </Button>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-yellow-800">
              Payment Pending
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            
            <Button className="mt-6 w-full" onClick={handleContinue}>
              Go to Home
            </Button>
          </>
        )}

        {merchantOrderId && (
          <p className="mt-6 text-xs text-gray-400">
            Order ID: {merchantOrderId}
          </p>
        )}
      </div>
    </div>
  );
}
