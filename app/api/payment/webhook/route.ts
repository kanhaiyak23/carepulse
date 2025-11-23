import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-cashfree-signature');

    // Verify webhook signature
    const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    if (!CASHFREE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify signature (Cashfree webhook signature verification)
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', CASHFREE_SECRET_KEY)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Handle payment webhook events
    const { type, data } = body;

    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { order, payment } = data;
      
      // Here you would update your database to mark user as premium
      // For example, update user subscription status in Appwrite
      console.log('Payment successful:', {
        orderId: order.order_id,
        orderAmount: order.order_amount,
        paymentId: payment.cf_payment_id,
        paymentStatus: payment.payment_status,
      });

      // TODO: Update user subscription status in your database
      // await updateUserSubscription(order.customer_details.customer_id, true);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

