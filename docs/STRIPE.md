# Stripe Integration

The backend (`apps/worker`) processes Stripe events asynchronously to ensure high availability and idempotency.

## Webhook Configuration
1. Go to Stripe Dashboard > Developers > Webhooks.
2. Add Endpoint: `https://your-api-domain.com/api/v1/webhooks/stripe`.
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`

## Local Development
To test webhooks locally, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

Copy the printed webhook signing secret (`whsec_...`) to your `.env` as `STRIPE_WEBHOOK_SECRET`.

## Idempotency
We use the `PaymentEvent` database table to track processed events by their unique `id` from Stripe. If an event is retried by Stripe, the worker will detect it as `PROCESSED` and skip it.
