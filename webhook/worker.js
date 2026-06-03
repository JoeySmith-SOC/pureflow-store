/**
 * PureFlow — Cloudflare Workers Webhook Handler
 * Listens for Stripe payment_intent.succeeded events
 * and forwards order details for Waterdrop fulfillment
 *
 * Deploy: wrangler deploy
 * Set secrets: wrangler secret put STRIPE_WEBHOOK_SECRET
 *              wrangler secret put NOTIFICATION_EMAIL
 */

const PRODUCT_MAP = {
  'STRIPE_PRICE_G3P800': {
    name: 'Waterdrop G3P800 Tankless RO System',
    sku: 'WD-G3P800',
    fulfillmentContact: 'christine.li@waterdropfilter.com'
  },
  'STRIPE_PRICE_G3P600': {
    name: 'Waterdrop G3P600 Tankless RO System',
    sku: 'WD-G3P600',
    fulfillmentContact: 'christine.li@waterdropfilter.com'
  },
  'STRIPE_PRICE_TSU': {
    name: 'Waterdrop TSU Ultrafiltration System',
    sku: 'WD-TSU',
    fulfillmentContact: 'christine.li@waterdropfilter.com'
  },
  'STRIPE_PRICE_X12': {
    name: 'Waterdrop X12 Flagship RO System',
    sku: 'WD-X12',
    fulfillmentContact: 'christine.li@waterdropfilter.com'
  },
};

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    // Verify Stripe webhook signature
    let event;
    try {
      event = await verifyStripeWebhook(body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await handleSuccessfulOrder(session, env);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function handleSuccessfulOrder(session, env) {
  const orderId = session.id;
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;
  const shippingAddress = session.shipping_details?.address;
  const amountTotal = (session.amount_total / 100).toFixed(2);

  // Build order summary
  const orderData = {
    orderId,
    customerEmail,
    customerName,
    shippingAddress,
    amountTotal,
    timestamp: new Date().toISOString(),
    lineItems: session.line_items?.data || [],
  };

  console.log('New PureFlow Order:', JSON.stringify(orderData, null, 2));

  // Send fulfillment notification email via MailChannels (free on Cloudflare Workers)
  await sendFulfillmentEmail(orderData, env);
}

async function sendFulfillmentEmail(order, env) {
  const addressStr = order.shippingAddress
    ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal_code}`
    : 'Address not provided';

  const emailBody = `
NEW PUREFLOW ORDER — Fulfillment Required

Order ID: ${order.orderId}
Date: ${order.timestamp}
Amount: $${order.amountTotal}

CUSTOMER:
Name: ${order.customerName}
Email: ${order.customerEmail}
Ship To: ${addressStr}

ACTION REQUIRED:
Please log into the Waterdrop dropship portal and place this order
for direct shipment to the customer at the address above.

Waterdrop Dropship Contact: christine.li@waterdropfilter.com
Waterdrop Portal: https://www.waterdropfilter.com/pages/dropship
  `.trim();

  // Using MailChannels — free transactional email on Cloudflare Workers
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: env.NOTIFICATION_EMAIL, name: 'PureFlow Orders' }],
      }],
      from: { email: 'orders@pureflowwater.com', name: 'PureFlow Order System' },
      subject: `New Order #${order.orderId.slice(-8)} — $${order.amountTotal} — ${order.customerName}`,
      content: [{ type: 'text/plain', value: emailBody }],
    }),
  });

  if (!response.ok) {
    console.error('Email send failed:', await response.text());
  } else {
    console.log('Fulfillment email sent for order', order.orderId);
  }
}

// Stripe webhook signature verification (Web Crypto API)
async function verifyStripeWebhook(payload, sigHeader, secret) {
  if (!sigHeader) throw new Error('No Stripe signature header');

  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [key, val] = part.split('=');
    acc[key] = val;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const signature = parts['v1'];

  if (!timestamp || !signature) throw new Error('Invalid signature format');

  // Check timestamp is within 5 minutes
  const tolerance = 300;
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > tolerance) {
    throw new Error('Webhook timestamp too old');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(signedPayload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const expectedSig = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  if (expectedSig !== signature) throw new Error('Signature mismatch');

  return JSON.parse(payload);
}
