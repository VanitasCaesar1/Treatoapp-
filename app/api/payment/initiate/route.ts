
import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import crypto from 'crypto';
import axios from 'axios';

// PhonePe Configuration (matching Treato's env vars)
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'M22BJQJ3KCQLO';
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || ''; // This is the Salt Key
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_ENVIRONMENT = process.env.PHONEPE_ENVIRONMENT || 'PRODUCTION';

export async function POST(request: Request) {
    try {
        // Get authenticated user
        const { user, accessToken } = await withAuth({ ensureSignedIn: true });

        if (!user || !accessToken) {
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
            duration = 30
        } = body;

        // Validate required fields
        if (!amount || !doctorId || !appointmentDate || !appointmentTime) {
            return NextResponse.json({
                error: 'Missing required fields: amount, doctorId, appointmentDate, appointmentTime'
            }, { status: 400 });
        }

        if (!PHONEPE_CLIENT_SECRET) {
            console.error('PhonePe Client Secret not configured');
            return NextResponse.json({
                error: 'Payment gateway not configured'
            }, { status: 500 });
        }

        const merchantTransactionId = `APT_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirectUrl = `${baseUrl}/payment/success?txnId=${merchantTransactionId}`;
        const callbackUrl = `${baseUrl}/api/payment/callback`;

        // Production API endpoint (correct endpoint)
        const apiUrl = PHONEPE_ENVIRONMENT === 'PRODUCTION'
            ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
            : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay';

        // Clean PhonePe payload - NO metaInfo (not supported)
        const payload = {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId,
            merchantUserId: user.id,
            amount: Math.round(amount * 100), // Convert to paise
            redirectUrl,
            redirectMode: 'POST',
            callbackUrl,
            mobileNumber: patientPhone,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        console.log('Creating PhonePe payment:', {
            merchantTransactionId,
            amount: amount,
            amountInPaise: payload.amount,
            userId: user.id,
            environment: PHONEPE_ENVIRONMENT,
            apiUrl
        });

        // Store appointment data in localStorage (frontend will save this)
        // The callback will retrieve this data and create the appointment
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

        // Base64 encode payload
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

        // Create checksum: base64Payload + endpoint + clientSecret (Salt Key)
        const stringToSign = base64Payload + '/pg/v1/pay' + PHONEPE_CLIENT_SECRET;
        const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex');
        const xVerify = `${checksum}###${PHONEPE_SALT_INDEX}`;

        console.log('Payment request details:', {
            payloadSize: base64Payload.length,
            hasChecksum: !!checksum,
            merchantId: PHONEPE_MERCHANT_ID
        });

        const response = await axios.post(apiUrl, {
            request: base64Payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
            }
        });

        console.log('PhonePe Response:', {
            success: response.data?.success,
            code: response.data?.code,
            message: response.data?.message
        });

        if (response.data && response.data.success) {
            const redirectInfo = response.data.data?.instrumentResponse?.redirectInfo;

            if (!redirectInfo || !redirectInfo.url) {
                console.error('No redirect URL in response:', response.data);
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
                appointmentData // Return to frontend to store in localStorage
            });
        } else {
            console.error('Payment initiation failed:', response.data);
            return NextResponse.json({
                success: false,
                error: response.data?.message || 'Payment initiation failed',
                code: response.data?.code
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Payment API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        return NextResponse.json({
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to initiate payment',
            details: error.response?.data
        }, { status: 500 });
    }
}
