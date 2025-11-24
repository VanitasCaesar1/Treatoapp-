import crypto from 'crypto';
import axios from 'axios';

export interface PaymentRequest {
    amount: number;
    userId: string;
    merchantTransactionId: string;
    redirectUrl: string;
    callbackUrl: string;
    mobileNumber?: string;
}

export const initiatePayment = async ({
    amount,
    userId,
    merchantTransactionId,
    redirectUrl,
    callbackUrl,
    mobileNumber
}: PaymentRequest) => {
    try {
        const merchantId = process.env.PHONEPE_MERCHANT_ID;
        const clientSecret = process.env.PHONEPE_CLIENT_SECRET; // This is the Salt Key
        const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
        const environment = process.env.PHONEPE_ENVIRONMENT || 'UAT'; // UAT or PRODUCTION

        if (!merchantId || !clientSecret) {
            throw new Error('PhonePe credentials not configured');
        }

        const apiEndpoints: Record<string, string> = {
            UAT: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
            PRODUCTION: 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
        };

        const apiUrl = apiEndpoints[environment] || apiEndpoints.UAT;

        const payload = {
            merchantId,
            merchantTransactionId,
            merchantUserId: userId,
            amount: Math.round(amount * 100), // Amount in paise
            redirectUrl,
            redirectMode: 'REDIRECT',
            callbackUrl,
            mobileNumber,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const stringToSign = base64Payload + '/pg/v1/pay' + clientSecret;
        const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex');
        const xVerify = `${checksum}###${saltIndex}`;

        const response = await axios.post(apiUrl, {
            request: base64Payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
            }
        });

        return response.data;

    } catch (error: any) {
        console.error('PhonePe Initiation Error:', error.response?.data || error.message);
        throw error;
    }
};

export const checkPaymentStatus = async (merchantTransactionId: string) => {
    try {
        const merchantId = process.env.PHONEPE_MERCHANT_ID;
        const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
        const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
        const environment = process.env.PHONEPE_ENVIRONMENT || 'UAT';

        if (!merchantId || !clientSecret) {
            throw new Error('PhonePe credentials not configured');
        }

        const apiEndpoints: Record<string, string> = {
            UAT: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
            PRODUCTION: 'https://api.phonepe.com/apis/hermes'
        };

        const baseUrl = apiEndpoints[environment] || apiEndpoints.UAT;
        const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;

        const stringToSign = endpoint + clientSecret;
        const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex');
        const xVerify = `${checksum}###${saltIndex}`;

        const response = await axios.get(`${baseUrl}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify,
                'X-MERCHANT-ID': merchantId,
            }
        });

        return response.data;

    } catch (error: any) {
        console.error('PhonePe Status Error:', error.response?.data || error.message);
        throw error;
    }
};
