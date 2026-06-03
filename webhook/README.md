# PureFlow Webhook Handler

Cloudflare Worker that receives Stripe payment webhooks and sends
fulfillment email notifications for each completed order.

## Setup

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Set your secrets:
   ```bash
   wrangler secret put STRIPE_WEBHOOK_SECRET
   # Paste the signing secret from Stripe Dashboard → Webhooks

   wrangler secret put NOTIFICATION_EMAIL
   # Paste your email address (you'll get order notifications here)
   ```

3. Deploy:
   ```bash
   wrangler deploy
   ```
   Copy the resulting URL (e.g. https://pureflow-webhook.YOUR-NAME.workers.dev)

4. Register webhook in Stripe:
   - Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL: your Cloudflare Workers URL
   - Events: `checkout.session.completed`
   - Copy the Signing secret → paste into wrangler secret

## How It Works

Stripe Payment → Checkout Session Completed → Worker receives event
→ Verifies Stripe signature → Sends fulfillment email to you
→ You log into Waterdrop portal and place the order
