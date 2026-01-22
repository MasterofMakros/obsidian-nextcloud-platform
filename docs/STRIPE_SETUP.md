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

- [ ] Stripe account fully verified (business info, bank account)
- [ ] Products created with proper names (no "test" in names)
- [ ] Prices configured (CHF, EUR)
- [ ] Tax settings configured (if applicable)
- [ ] Branding set (logo, colors, email templates)

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

*Last updated: January 2026*
