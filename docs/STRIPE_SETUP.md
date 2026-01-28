# Stripe Setup Guide

## Quick Setup (Test Mode)

### Step 1: Get Your API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Make sure you're in **Test Mode** (toggle at top right)
3. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Step 2: Configure Environment Variables

**API (`apps/api/.env`):**
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

**Web (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

### Step 3: Set Up Webhook (Local Testing)

Install Stripe CLI:
```bash
# Windows (Scoop)
scoop install stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Forward webhooks to local API:
```bash
stripe login
stripe listen --forward-to localhost:3011/api/v1/webhooks/stripe
```

Copy the webhook signing secret (`whsec_...`) to your API `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 4: Test the Integration

Trigger a test event:
```bash
stripe trigger checkout.session.completed
```

Check the API logs and worker logs to verify processing.

---

## Live Mode Setup

### Pre-Launch Checklist

#### 1. Stripe Account Configuration

**Business Details:**
- [ ] Legal entity: GmbH
- [ ] Company name: Fentrea GmbH
- [ ] Location: Switzerland, Canton Solothurn
- [ ] Support email: support@obsidian-nextcloud.media
- [ ] Website: https://obsidian-nextcloud.media

**Bank & Payouts:**
- [ ] Bank account: CH-IBAN configured
- [ ] Currency: CHF
- [ ] Payout schedule: Weekly
- [ ] Statement descriptor: FENTREA SOFTWARE

#### 2. Products & Pricing

**Product Setup:**
- [ ] Product name: Obsidian Nextcloud Media – Pro
- [ ] Type: Digital service
- [ ] Description: Offline-first media sync plugin for Obsidian & Nextcloud

**Pricing:**
- [ ] Monthly subscription configured
- [ ] Yearly subscription (optional discount)
- [ ] Cancellable anytime
- [ ] No trial period (not needed for low price)

#### 3. Tax Configuration

**Switzerland:**
- [ ] VAT registered: NO (below CHF 100k threshold)
- [ ] Invoice note: "No VAT charged according to Swiss VAT Act"

**EU / DACH:**
- [ ] Enable OSS (One-Stop-Shop)
- [ ] Stripe Tax: ON
- [ ] EU VAT calculated by customer location

#### 4. Legal & Checkout

**Required Links:**
- [ ] Terms of Service: /legal/terms
- [ ] Privacy Policy: /legal/privacy
- [ ] EULA: /legal/eula

**Invoices:**
- [ ] Logo uploaded
- [ ] Sender address: Fentrea GmbH, Murtenstrasse 116, 3202 Frauenkappelen, Switzerland

#### 5. Webhooks (Live Mode)

**Endpoint:**
- [ ] URL: `https://api.obsidian-nextcloud.media/api/v1/webhooks/stripe`
- [ ] Events configured:
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`

**Secrets:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

#### 6. Test Purchase (Simulation)

Before going live:
1. [ ] Set price temporarily to CHF/EUR 1.–
2. [ ] Complete test purchase
3. [ ] Verify invoice received (check email + spam)
4. [ ] Verify license email received
5. [ ] Activate plugin
6. [ ] Test offline functionality
7. [ ] Test refresh after 24h
8. [ ] Test cancellation
9. [ ] Verify revoked status
10. [ ] Reset price to production value

---

### Switch to Live Keys

1. Toggle to **Live Mode** in Stripe Dashboard
2. Get your live keys:
   - `pk_live_...`
   - `sk_live_...`
3. Create a **new webhook** for your production URL:
   - Endpoint: `https://api.your-domain.com/api/v1/webhooks/stripe`
   - Events: 
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
4. Copy the live webhook secret (`whsec_live_...`)

### Update Production Environment

```env
# API Production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Web Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Security Notes

⚠️ **Never commit API keys to git!**
- `.env` files are already in `.gitignore`
- Use environment variables in production (Docker, Vercel, etc.)
- Rotate keys immediately if accidentally exposed

⚠️ **Test Mode vs Live Mode:**
- Test keys (`pk_test_`, `sk_test_`) only work with test cards
- Live keys (`pk_live_`, `sk_live_`) process real payments
- Use test mode until you're ready for real transactions

---

## Webhook Events We Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create license, send confirmation |
| `invoice.payment_succeeded` | Extend/renew license |
| `invoice.payment_failed` | Mark license as payment_failed |
| `customer.subscription.deleted` | Revoke license |

---

## Troubleshooting

### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` matches the secret shown in Stripe CLI or Dashboard
- Make sure you're using the correct secret for test vs live mode

### "No such customer"
- The customer ID might be from a different Stripe account (test vs live)
- Clear test data and start fresh

### Webhooks not arriving
- Check Stripe Dashboard > Developers > Webhooks > Event logs
- Verify your API is running and accessible
- Check firewall/network settings

---

## Recovery & Fail Scenarios

### Payment Failed (Initial)

**Events:**
- `invoice.payment_failed`
- `checkout.session.async_payment_failed`

**System Response:**
- License NOT activated
- No grace period
- Status: `pending_payment`

**User Communication:**
- Stripe sends retry email automatically
- User can retry payment

**Support Response:**
> "Please check your payment details or try again."

---

### Payment Failed (Renewal)

**Event:**
- `invoice.payment_failed` (subscription renewal)

**System Response:**
- License remains active
- Grace period: 7 days
- Status: `grace`

**After 7 Days:**
- License → `revoked`
- Plugin switches to read-only mode

**Support Rule:**
> No manual extension without payment

---

### Subscription Cancelled

**Event:**
- `customer.subscription.deleted`

**System Response:**
- License deactivated immediately or at period end
- No further refreshes allowed
- Status: `revoked`

---

### Duplicate Webhook Events

**Problem:**
Stripe may send events multiple times

**Solution:**
✅ Already implemented via `PaymentEvent` table idempotency
- Worker marks as `skipped_idempotent`
- No duplicate processing

---

### Refund / Chargeback

**Events:**
- `charge.refunded`
- `charge.dispute.created`

**System Response:**
- License → `revoked`
- No re-activation without new purchase

**Support Rule:**
> Refund = License loss (clearly communicated in FAQ)

---

### System Recovery

| Situation | System Response |
|-----------|-----------------|
| Webhook down | Stripe retries automatically |
| Worker down | Queue buffers (BullMQ) |
| DB temporarily down | Grace period applies |
| Stripe API down | Plugin remains offline-capable |

**Note:** No manual panic fixes needed – system is resilient

---

### Monitoring Alerts

Set up alerts for:
- `onm_worker_stripe_events_failed_total > 0` for 5 min
- `onm_worker_queue_depth > 100` for 10 min
- Webhook errors in Stripe Dashboard

---

*Last updated: January 2026*
