# PhonePe Payment Integration (SDK v2)

Complete payment system for appointment bookings using PhonePe Ionic/Capacitor SDK.

## Architecture

### Backend (Go)
- `phonepe_payment_handler.go` - OAuth token management, order creation, status checks
- `migrations/020_add_payment_orders.sql` - Payment orders and refunds tables

### Frontend (Next.js + Capacitor)
- `lib/services/phonepe-sdk.ts` - Native SDK wrapper
- `lib/hooks/use-phonepe.ts` - React hook for payments
- `app/api/payment/create-order/route.ts` - Create order API
- `app/api/payment/status/[merchantOrderId]/route.ts` - Check status API
- `app/payment/callback/page.tsx` - Payment result page

## Payment Flow

### 1. Initialize SDK (App Startup)
```typescript
// Automatically done in usePhonePe hook
const { isNative, isInitialized } = usePhonePe();
```

### 2. Initiate Payment
```typescript
const { initiatePayment, paymentState } = usePhonePe();

const result = await initiatePayment({
  amount: 500, // In rupees
  doctorId: 'doctor-uuid',
  appointmentDate: '2024-12-10',
  appointmentTime: '10:00:00',
  consultationType: 'in-person',
  patientName: 'John Doe',
  patientPhone: '9876543210',
  patientEmail: 'john@example.com',
  orgId: 'org-uuid'
});

if (result.success) {
  if (result.nativeResult) {
    // Native SDK handled payment
    if (result.nativeResult.status === 'SUCCESS') {
      // Verify on backend
      await pollForStatus(result.merchantOrderId);
    }
  } else if (result.redirectUrl) {
    // Web flow - redirect to PhonePe
    window.location.href = result.redirectUrl;
  }
}
```

### 3. Check Payment Status
```typescript
const { checkStatus, pollForStatus } = usePhonePe();

// Single check
const status = await checkStatus(merchantOrderId);

// Poll until terminal state
const result = await pollForStatus(merchantOrderId);
if (result.state === 'COMPLETED') {
  // Payment successful
}
```

## API Endpoints

### Create Order
```
POST /api/payment/create-order
{
  "amount": 50000,           // In paise
  "doctor_id": "uuid",
  "appointment_date": "2024-12-10",
  "appointment_time": "10:00:00",
  "consultation_type": "in-person",
  "patient_name": "John Doe",
  "patient_phone": "9876543210",
  "org_id": "uuid"
}

Response:
{
  "success": true,
  "merchant_order_id": "APT_xxx",
  "order_id": "OMO_xxx",
  "token": "order_token",
  "sdk_payload": "{...}",
  "appointment_data": {...}
}
```

### Check Status
```
GET /api/payment/status/{merchantOrderId}?details=true&errorContext=true

Response:
{
  "orderId": "OMO_xxx",
  "state": "COMPLETED",
  "amount": 50000,
  "paymentDetails": [...]
}
```

### Initiate Refund
```
POST /api/payment/refund
{
  "merchant_order_id": "APT_xxx",
  "amount": 50000,
  "reason": "Appointment cancelled"
}
```

## Native SDK Setup

### Android
Add to `android/app/build.gradle`:
```gradle
repositories {
  maven { url "https://phonepe.mycloudrepo.io/public/repositories/phonepe-intentsdk-android" }
}
```

### iOS
Add to `Info.plist`:
```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>ppemerchantsdkv1</string>
  <string>ppemerchantsdkv2</string>
  <string>ppemerchantsdkv3</string>
  <string>paytmmp</string>
  <string>gpay</string>
</array>
```

## Environment Variables
```env
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_ENVIRONMENT=PRODUCTION  # or SANDBOX

# Frontend
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=your_merchant_id
NEXT_PUBLIC_PHONEPE_ENVIRONMENT=PRODUCTION
NEXT_PUBLIC_IOS_URL_SCHEME=yourappscheme
```

## Webhook Events
Configure webhook URL: `https://yourdomain.com/api/payment/webhook`

Events:
- `checkout.order.completed` - Payment successful
- `checkout.order.failed` - Payment failed
- `pg.refund.completed` - Refund successful
- `pg.refund.failed` - Refund failed

## Order States
- `PENDING` - Payment in progress
- `COMPLETED` - Payment successful
- `FAILED` - Payment failed

## Important Notes

1. **Amount**: Always in paise (₹500 = 50000 paise)
2. **SDK vs Web**: Native apps use SDK, web uses redirect
3. **Status Verification**: Always verify status on backend after SDK returns
4. **Webhook**: Primary source of truth for payment status
5. **Refunds**: Can only refund completed payments
