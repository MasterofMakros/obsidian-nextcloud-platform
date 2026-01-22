# Stripe Integration

> **Payment processing with automatic license provisioning.**

Stripe Checkout for purchases, webhooks for lifecycle events, idempotent processing.

## Architecture

```
┌──────────────┐   Checkout    ┌──────────────┐
│     User     │ ─────────────►│    Stripe    │
│              │               │   Checkout   │
└──────────────┘               └──────┬───────┘
                                      │
                            Webhook   │  checkout.session.completed
                                      ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│     API      │ ────────────►│    Redis     │ ────────────►│    Worker    │
│   /webhook   │   Enqueue    │    Queue     │   Process    │   (BullMQ)   │
└──────────────┘              └──────────────┘              └──────┬───────┘
                                                                   │
                              ┌──────────────┐              ┌──────▼───────┐
                              │   License    │◄─────────────│  PostgreSQL  │
                              │   Created    │              │    + Redis   │
                              └──────────────┘              └──────────────┘
```

## Webhook Events

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` | `handleCheckoutCompleted` | Create license, send email |
| `customer.subscription.updated` | `handleSubscriptionUpdated` | Update license dates |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | Revoke license |
| `invoice.payment_failed` | `handlePaymentFailed` | Start grace period |
| `invoice.paid` | `handleInvoicePaid` | Extend subscription |

## Quick Start

### 1. Create Stripe Products

```bash
# In Stripe Dashboard > Products
# Create "Obsidian Nextcloud Media Pro"
# Add prices: Monthly ($7.90) and Yearly ($79)
```

### 2. Configure Webhook

```bash
# Stripe Dashboard > Developers > Webhooks
# Add endpoint: https://api.yourdomain.com/api/v1/stripe/webhook
# Select events:
#   - checkout.session.completed
#   - customer.subscription.updated
#   - customer.subscription.deleted
#   - invoice.payment_failed
#   - invoice.paid
```

### 3. Set Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
```

## Local Development

Use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3011/api/v1/stripe/webhook

# Copy the webhook secret (whsec_...) to .env
STRIPE_WEBHOOK_SECRET=whsec_...

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

## Idempotency

All webhook processing is idempotent:

```sql
-- PaymentEvent table tracks processed events
CREATE TABLE payment_events (
  id TEXT PRIMARY KEY,              -- Stripe event ID
  type TEXT NOT NULL,               -- Event type
  status TEXT DEFAULT 'PROCESSED',  -- PROCESSED | FAILED
  processed_at TIMESTAMP,
  payload JSONB
);
```

### Processing Flow

```
1. Receive webhook → Check signature (HMAC)
2. Query: SELECT id FROM payment_events WHERE id = ?
3. If exists → Return 200 (already processed)
4. If not → Process event → INSERT into payment_events
5. Return 200
```

**Result:** Stripe retries are handled gracefully. No duplicate licenses.

## Error Handling

| Error | Response | Stripe Behavior |
|-------|----------|-----------------|
| Invalid signature | 400 | No retry |
| Already processed | 200 | No retry |
| Processing error | 500 | Retry with backoff |
| Timeout (>30s) | 408 | Retry immediately |

## Testing

### Test Cards

| Number | Scenario |
|--------|----------|
| `4242424242424242` | Successful payment |
| `4000000000000341` | Attaching fails |
| `4000000000009995` | Payment declined |
| `4000002500003155` | Requires 3D Secure |

### Webhook Testing

```bash
# Trigger specific events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed

# Check logs
docker compose logs -f worker
```

## Production Checklist

- [ ] Live mode API keys configured
- [ ] Webhook endpoint registered (live mode)
- [ ] Webhook signature verification enabled
- [ ] All products and prices created
- [ ] Tax configuration (if applicable)
- [ ] Customer portal enabled
- [ ] Test purchase completed

---

**Detailed Setup:** See [STRIPE_SETUP.md](STRIPE_SETUP.md)  
**Live Checklist:** See [STRIPE_LIVE_CHECKLIST.md](STRIPE_LIVE_CHECKLIST.md)  
**Recovery Playbook:** See [STRIPE_RECOVERY_PLAYBOOK.md](STRIPE_RECOVERY_PLAYBOOK.md)
