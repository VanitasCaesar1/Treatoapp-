import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-auth';
import crypto from 'crypto';
import axios from 'axios';

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'M22BJQJ3KCQLO';
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || '';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_ENVIRONMENT = process.env.PHONEPE_ENVIRONMENT || 'PRODUCTION';

// API endpoints
const API_ENDPOINTS = {
  PRODUCTION: 'https://api.phonepe.com/apis/hermes/pg/v1/pay',
  SANDBOX: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'
};

export async function POST(request: NextRequest) {
  try {
    const { accessToken, user } = await withAuth(request);

    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationType = 'in-person',
      patientName,
      patientPhone,
      patientEmail,
      forMemberId,
      forMemberRelationship,
      reason,
      duration = 30,
      useNativeSDK = false
    } = body;

    if (!amount || !doctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json({
        error: 'Missing required fields: amount, doctorId, appointmentDate, appointmentTime'
      }, { status: 400 });
    }

    if (!PHONEPE_CLIENT_SECRET) {
      console.error('PhonePe Client Secret not configured');
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const merchantTransactionId = `APT_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/payment/success?txnId=${merchantTransactionId}`;
    const callbackUrl = `${baseUrl}/api/payment/callback`;

    const apiUrl = PHONEPE_ENVIRONMENT === 'PRODUCTION'
      ? API_ENDPOINTS.PRODUCTION
      : API_ENDPOINTS.SANDBOX;

    // For native SDK, we don't need PAY_PAGE - the SDK handles the UI
    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: user.id,
      amount: Math.round(amount * 100),
      redirectUrl,
      redirectMode: 'POST',
      callbackUrl,
      mobileNumber: patientPhone,
      paymentInstrument: useNativeSDK ? { type: 'UPI_INTENT' } : { type: 'PAY_PAGE' }
    };

    const appointmentData = {
      merchantTransactionId,
      userId: user.id,
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationType,
      patientName,
      patientPhone,
      patientEmail,
      forMemberId,
      forMemberRelationship,
      reason: reason || 'Consultation',
      duration,
      amount,
      timestamp: Date.now()
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToSign = base64Payload + '/pg/v1/pay' + PHONEPE_CLIENT_SECRET;
    const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex');
    const xVerify = `${checksum}###${PHONEPE_SALT_INDEX}`;

    // For native SDK, return the payload directly - SDK handles the API call
    if (useNativeSDK) {
      return NextResponse.json({
        success: true,
        merchantTransactionId,
        nativePayload: base64Payload, // SDK needs base64 encoded payload
        appointmentData
      });
    }

    // Web flow - call PhonePe API
    const response = await axios.post(apiUrl, { request: base64Payload }, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
      }
    });

    if (response.data && response.data.success) {
      const redirectInfo = response.data.data?.instrumentResponse?.redirectInfo;

      if (!redirectInfo || !redirectInfo.url) {
        return NextResponse.json({
          success: false,
          error: 'Invalid payment response - no redirect URL'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        url: redirectInfo.url,
        merchantTransactionId,
        redirectUrl: redirectInfo.url,
        appointmentData
      });
    } else {
      return NextResponse.json({
        success: false,
        error: response.data?.message || 'Payment initiation failed',
        code: response.data?.code
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment API Error:', error.response?.data || error.message);
    return NextResponse.json({
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to initiate payment',
    }, { status: 500 });
  }
}
