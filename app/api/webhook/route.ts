// import { NextResponse } from 'next/server';
// import { verifyMomoSignature, verifyVNPaySignature } from '@/lib/paymentUltils';
// import { updateOrderStatus } from '@/lib/orderUtils';

// export async function POST(request: Request) {
//   const rawBody = await request.text();
//   const headers = request.headers;

//   try {
//     let paymentProvider: 'momo' | 'vnpay';
//     let isValid: boolean;
//     let paymentData: any;

//     // Determine payment provider and verify signature
//     if (headers.get('x-momo-signature')) {
//       paymentProvider = 'momo';
//       isValid = verifyMomoSignature(rawBody, headers.get('x-momo-signature') as string);
//       paymentData = JSON.parse(rawBody);
//     } else if (request.url.includes('vnp_')) {
//       paymentProvider = 'vnpay';
//       const urlParams = new URLSearchParams(request.url.split('?')[1]);
//       isValid = verifyVNPaySignature(Object.fromEntries(urlParams));
//       paymentData = Object.fromEntries(urlParams);
//     } else {
//       throw new Error('Unknown payment provider');
//     }

//     if (!isValid) {
//       return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
//     }

//     // Process the payment
//     let orderId: string;
//     let status: 'success' | 'failure';

//     if (paymentProvider === 'momo') {
//       orderId = paymentData.orderId;
//       status = paymentData.resultCode === '0' ? 'success' : 'failure';
//     } else {
//       orderId = paymentData.vnp_TxnRef;
//       status = paymentData.vnp_ResponseCode === '00' ? 'success' : 'failure';
//     }

//     // Update order status in your database
//     await updateOrderStatus(orderId, status);

//     return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
//   } catch (error) {
//     console.error('Webhook processing error:', error);
//     return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 });
//   }
// }