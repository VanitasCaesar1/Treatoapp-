
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

// PhonePe Configuration
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'M22BJQJ3KCQLO';
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || '';
const PHONEPE_ENVIRONMENT = process.env.PHONEPE_ENVIRONMENT || 'SANDBOX';

// PhonePe Status Check API endpoints
const PHONEPE_STATUS_ENDPOINTS = {
    UAT: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status',
    SANDBOX: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status',
    PRODUCTION: 'https://api.phonepe.com/apis/hermes/pg/v1/status'
};

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const transactionId = searchParams.get('transactionId');

        if (!transactionId) {
            return NextResponse.json({
                error: 'Transaction ID is required'
            }, { status: 400 });
        }

        // Construct status check URL
        const apiUrl = PHONEPE_STATUS_ENDPOINTS[PHONEPE_ENVIRONMENT as keyof typeof PHONEPE_STATUS_ENDPOINTS] || PHONEPE_STATUS_ENDPOINTS.PRODUCTION;
        const statusUrl = `${apiUrl}/${PHONEPE_MERCHANT_ID}/${transactionId}`;

        // Generate checksum for status check
        const checksumString = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}` + PHONEPE_CLIENT_SECRET;
        const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');
        const xVerifyHeader = `${checksum}###1`;

        console.log('Checking payment status:', {
            transactionId,
            url: statusUrl
        });

        // Make status check request
        const response = await axios.get(statusUrl, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerifyHeader,
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
                'accept': 'application/json'
            }
        });

        console.log('PhonePe status response:', {
            success: response.data?.success,
            code: response.data?.code,
            state: response.data?.data?.state
        });

        if (response.data && response.data.success) {
            return NextResponse.json({
                success: true,
                code: response.data.code,
                message: response.data.message,
                data: response.data.data
            });
        }

        return NextResponse.json({
            success: false,
            code: response.data?.code || 'PAYMENT_ERROR',
            message: response.data?.message || 'Payment verification failed'
        });

    } catch (error: any) {
        console.error('Payment verification error:', {
            message: error.message,
            response: error.response?.data
        });

        if (axios.isAxiosError(error) && error.response?.data) {
            return NextResponse.json({
                success: false,
                error: error.response.data.message || 'PhonePe API error',
                code: error.response.data.code || 'API_ERROR'
            }, { status: error.response.status || 400 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to verify payment',
            code: 'VERIFICATION_ERROR'
        }, { status: 500 });
    }
}
