'use client';

import { useState, useEffect, useCallback } from 'react';
import { PhonePeSDK, UpiApp, PhonePeTransactionResult } from '@/lib/services/phonepe-sdk';

interface PaymentRequest {
  amount: number; // In rupees
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  forMemberId?: string;
  forMemberRelationship?: string;
  reason?: string;
  duration?: number;
  orgId?: string;
}

interface PaymentState {
  loading: boolean;
  error: string | null;
  merchantOrderId: string | null;
  status: 'idle' | 'processing' | 'success' | 'failed' | 'interrupted';
}

// App URL scheme for iOS callback
const IOS_APP_SCHEMA = process.env.NEXT_PUBLIC_IOS_URL_SCHEME || 'treatoapp';

export function usePhonePe() {
  const [isNative, setIsNative] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');
  const [upiApps, setUpiApps] = useState<UpiApp[]>([]);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    loading: false,
    error: null,
    merchantOrderId: null,
    status: 'idle'
  });

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const native = PhonePeSDK.isNative();
      const currentPlatform = PhonePeSDK.getPlatform();
      
      setIsNative(native);
      setPlatform(currentPlatform);

      if (native) {
        // Generate a flow ID for tracking
        const flowId = `flow_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        const success = await PhonePeSDK.init({
          environment: process.env.NEXT_PUBLIC_PHONEPE_ENVIRONMENT === 'PRODUCTION' 
            ? 'PRODUCTION' 
            : 'SANDBOX',
          merchantId: process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID || '',
          flowId,
          enableLogging: process.env.NODE_ENV === 'development'
        });
        
        setIsInitialized(success);

        if (success) {
          const apps = await PhonePeSDK.getUpiApps();
          setUpiApps(apps);
        }
      }
    };

    init();
  }, []);

  /**
   * Initiate payment - handles both native SDK and web flows
   * Uses PhonePe SDK v2 with OAuth token flow
   */
  const initiatePayment = useCallback(async (request: PaymentRequest): Promise<{
    success: boolean;
    redirectUrl?: string;
    merchantOrderId?: string;
    error?: string;
    nativeResult?: PhonePeTransactionResult;
  }> => {
    setPaymentState({
      loading: true,
      error: null,
      merchantOrderId: null,
      status: 'processing'
    });

    try {
      // Call backend to create order and get SDK token
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(request.amount * 100), // Convert to paise
          doctor_id: request.doctorId,
          appointment_date: request.appointmentDate,
          appointment_time: request.appointmentTime,
          consultation_type: request.consultationType || 'in-person',
          patient_name: request.patientName,
          patient_phone: request.patientPhone,
          patient_email: request.patientEmail,
          for_member_id: request.forMemberId,
          org_id: request.orgId,
          reason: request.reason || 'Consultation',
          duration: request.duration || 30,
          use_native_sdk: isNative && isInitialized
        })
      });

      const data = await response.json();

      if (!data.success) {
        setPaymentState({
          loading: false,
          error: data.error || 'Payment initiation failed',
          merchantOrderId: null,
          status: 'failed'
        });
        return { success: false, error: data.error };
      }

      // Native flow - use SDK with order token
      if (isNative && isInitialized && data.sdk_payload) {
        const sdkPayload = JSON.parse(data.sdk_payload);
        
        const result = await PhonePeSDK.startTransaction(
          sdkPayload,
          platform === 'ios' ? IOS_APP_SCHEMA : undefined
        );

        const success = result.status === 'SUCCESS';
        const newStatus = result.status === 'SUCCESS' ? 'success' 
          : result.status === 'INTERRUPTED' ? 'interrupted' 
          : 'failed';

        setPaymentState({
          loading: false,
          error: success ? null : result.error || 'Payment failed',
          merchantOrderId: data.merchant_order_id,
          status: newStatus
        });

        return {
          success,
          merchantOrderId: data.merchant_order_id,
          error: result.error,
          nativeResult: result
        };
      }

      // Web flow - redirect to PhonePe checkout
      // For web, we need to redirect to PhonePe's hosted checkout
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/payment/callback?merchantOrderId=${data.merchant_order_id}`;
      
      setPaymentState({
        loading: false,
        error: null,
        merchantOrderId: data.merchant_order_id,
        status: 'processing'
      });

      // Store appointment data for callback
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingPayment', JSON.stringify({
          merchantOrderId: data.merchant_order_id,
          appointmentData: data.appointment_data,
          timestamp: Date.now()
        }));
      }

      return {
        success: true,
        redirectUrl,
        merchantOrderId: data.merchant_order_id
      };

    } catch (error: any) {
      const errorMsg = error.message || 'Payment failed';
      setPaymentState({
        loading: false,
        error: errorMsg,
        merchantOrderId: null,
        status: 'failed'
      });
      return { success: false, error: errorMsg };
    }
  }, [isNative, isInitialized, platform]);

  /**
   * Check payment status from backend
   */
  const checkStatus = useCallback(async (merchantOrderId: string): Promise<{
    success: boolean;
    state?: string;
    error?: string;
    paymentDetails?: any;
  }> => {
    try {
      const response = await fetch(`/api/payment/status/${merchantOrderId}`);
      const data = await response.json();
      
      return {
        success: response.ok,
        state: data.state,
        paymentDetails: data.paymentDetails,
        error: data.error
      };
    } catch {
      return { success: false, error: 'Failed to check status' };
    }
  }, []);

  /**
   * Poll for payment status (useful after SDK returns)
   */
  const pollForStatus = useCallback(async (
    merchantOrderId: string,
    maxAttempts = 10,
    intervalMs = 3000
  ): Promise<{ success: boolean; state: string }> => {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await checkStatus(merchantOrderId);
      
      if (result.state === 'COMPLETED') {
        setPaymentState(prev => ({ ...prev, status: 'success' }));
        return { success: true, state: 'COMPLETED' };
      }
      
      if (result.state === 'FAILED') {
        setPaymentState(prev => ({ ...prev, status: 'failed', error: result.error || null }));
        return { success: false, state: 'FAILED' };
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    return { success: false, state: 'TIMEOUT' };
  }, [checkStatus]);

  /**
   * Reset payment state
   */
  const resetState = useCallback(() => {
    setPaymentState({
      loading: false,
      error: null,
      merchantOrderId: null,
      status: 'idle'
    });
  }, []);

  return {
    isNative,
    isInitialized,
    platform,
    upiApps,
    paymentState,
    initiatePayment,
    checkStatus,
    pollForStatus,
    resetState
  };
}
