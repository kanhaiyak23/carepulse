import { NextRequest, NextResponse } from 'next/server';
import { getServerBaseUrl, ensureHttps } from '@/lib/payment-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, customerName, customerEmail, customerPhone, userId } = body;

    // Validate required fields
    if (!amount || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Cashfree credentials from environment variables
    const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
    const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const CASHFREE_ENV = process.env.CASHFREE_ENV || 'sandbox';

    // Validate credentials
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      console.error('Cashfree credentials missing:', {
        hasAppId: !!CASHFREE_APP_ID,
        hasSecretKey: !!CASHFREE_SECRET_KEY,
      });
      return NextResponse.json(
        { 
          error: 'Cashfree credentials not configured',
          message: 'Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in your .env.local file'
        },
        { status: 500 }
      );
    }

    // Check for environment mismatch
    const isProductionKey = CASHFREE_SECRET_KEY.includes('_prod_');
    const isSandboxKey = CASHFREE_SECRET_KEY.includes('_test_') || CASHFREE_SECRET_KEY.includes('_sandbox_');
    
    if (CASHFREE_ENV === 'sandbox' && isProductionKey) {
      console.error('Environment mismatch: Using production credentials with sandbox environment');
      return NextResponse.json(
        { 
          error: 'Environment Mismatch',
          message: 'You are using PRODUCTION credentials (cfsk_ma_prod_...) with SANDBOX environment. Please either: 1) Change CASHFREE_ENV to "production", OR 2) Get sandbox/test credentials from Cashfree dashboard and update CASHFREE_SECRET_KEY'
        },
        { status: 400 }
      );
    }
    
    if (CASHFREE_ENV === 'production' && isSandboxKey) {
      console.error('Environment mismatch: Using sandbox credentials with production environment');
      return NextResponse.json(
        { 
          error: 'Environment Mismatch',
          message: 'You are using SANDBOX credentials with PRODUCTION environment. Please use production credentials for production environment.'
        },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get base URL - automatically handles production (HTTPS) vs development (HTTP)
    const baseUrl = getServerBaseUrl();
    // Include userId in return URL if provided
    const returnUrlParams = userId 
      ? `order_id={order_id}&userId=${userId}`
      : `order_id={order_id}`;
    const returnUrl = ensureHttps(`${baseUrl}/payment/success?${returnUrlParams}`);
    const notifyUrl = ensureHttps(`${baseUrl}/api/payment/webhook`);

    // Create payment order with Cashfree
    // Note: For sandbox, use test credentials from Cashfree dashboard
    const cashfreeUrl = CASHFREE_ENV === 'production' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';
    
    console.log('Creating Cashfree order:', {
      url: cashfreeUrl,
      env: CASHFREE_ENV,
      orderId: orderId,
      baseUrl: baseUrl,
      returnUrl: returnUrl,
      notifyUrl: notifyUrl,
    });

    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: '12345677',
        customer_name: customerName || 'Customer',
        customer_email: customerEmail,
        customer_phone: customerPhone || '9999999999',
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
      },
    };

    const response = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: cashfreeUrl,
        hasAppId: !!CASHFREE_APP_ID,
        hasSecretKey: !!CASHFREE_SECRET_KEY,
        env: CASHFREE_ENV,
      });
      
      return NextResponse.json(
        { 
          error: data.message || data.error || 'Failed to create payment order',
          details: data,
          status: response.status 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      orderToken: data.order_token,
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

