# Licensing System

> **Offline-first license verification with Ed25519 cryptographic signatures.**

No "phone home" required for daily use. Device-based activation with cryptographic proof of purchase.

## Architecture

```
┌──────────────┐    Purchase     ┌──────────────┐
│    User      │ ───────────────►│    Stripe    │
│              │                 │   Checkout   │
└──────────────┘                 └──────┬───────┘
                                        │
                               Webhook  │
                                        ▼
┌──────────────┐   Issue Token  ┌──────────────┐
│   Obsidian   │ ◄──────────────│    Worker    │
│    Plugin    │                │   (BullMQ)   │
└──────┬───────┘                └──────────────┘
       │                               │
       │ Verify (offline)              │ Sign (Ed25519)
       ▼                               ▼
┌──────────────┐                ┌──────────────┐
│  Public Key  │                │ Private Key  │
│  (embedded)  │                │  (env only)  │
└──────────────┘                └──────────────┘
```

## License Flow

| Step | Action | Component |
|------|--------|-----------|
| 1 | User purchases Pro via Stripe | Web → Stripe |
| 2 | Stripe sends webhook | Stripe → API |
| 3 | Worker creates license token | Worker |
| 4 | Token signed with Ed25519 private key | Worker |
| 5 | License emailed to customer | Worker → Email |
| 6 | User activates in plugin | Plugin |
| 7 | Plugin verifies signature locally | Plugin |

## Token Structure

```json
{
  "v": 1,
  "sub": "user_uuid",
  "dev": "device_fingerprint",
  "iat": 1705968000,
  "exp": 1737590400,
  "features": ["4k-streaming", "batch-sync"],
  "maxDevices": 3
}
```

| Field | Type | Description |
|-------|------|-------------|
| `v` | number | Key version (for rotation) |
| `sub` | string | User/subscription ID |
| `dev` | string | Device fingerprint (SHA-256) |
| `iat` | number | Issued at (Unix timestamp) |
| `exp` | number | Expires at (Unix timestamp) |
| `features` | array | Enabled premium features |
| `maxDevices` | number | Maximum concurrent activations |

## Security Model

| Component | Location | Access |
|-----------|----------|--------|
| Private Key | Server ENV only | Never in code, never in logs |
| Public Key | Embedded in plugin | Shipped with each release |
| Token | User's device | Base64-encoded, not encrypted |

### Why This Works

- **Tamper-proof** — Changing any byte invalidates the signature
- **Offline verification** — No network required after activation
- **Key rotation** — Version field allows gradual key updates
- **No DRM** — Trust-based system for legitimate users

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/license/activate` | Activate license on new device |
| POST | `/api/v1/license/verify` | Verify token validity |
| POST | `/api/v1/license/deactivate` | Release device slot |
| GET | `/api/v1/license/status` | Check subscription status |

## Grace Period

When a license expires, users get a **7-day grace period**:

```
Day 0-7:    Warning banner, full functionality
Day 8-14:   Degraded mode (sync disabled)
Day 15+:    Read-only mode
```

## Key Rotation

1. Generate new Ed25519 keypair
2. Set `LICENSE_KEY_VERSION=2` in environment
3. Deploy new version
4. Plugin accepts both v1 and v2 signatures during transition
5. After 30 days, remove v1 public key from plugin

---

## Testing Strategies

### Unit Tests

Test license verification logic in isolation:

```typescript
// apps/plugin/license.test.ts
import { verifyLicense } from './license';
import * as ed from '@noble/ed25519';

describe('License Verification', () => {
  it('should verify valid license token', async () => {
    const token = 'eyJ2IjoxLCJzdWIiOiJ1c2VyXzEyMyJ9.c2lnbmF0dXJl';
    const result = await verifyLicense(token, PUBLIC_KEY);
    expect(result.valid).toBe(true);
  });

  it('should reject tampered token', async () => {
    const token = 'eyJ2IjoxLCJzdWIiOiJoYWNrZWQifQ==.c2lnbmF0dXJl';
    const result = await verifyLicense(token, PUBLIC_KEY);
    expect(result.valid).toBe(false);
  });

  it('should reject expired license', async () => {
    const token = createToken({ exp: Date.now() - 86400000 }); // Yesterday
    const result = await verifyLicense(token, PUBLIC_KEY);
    expect(result.error).toBe('EXPIRED');
  });
});
```

---

### Integration Tests

Test full activation flow:

```typescript
// apps/api/src/routes/license.test.ts
import { test } from 'vitest';
import { build } from '../app';

test('POST /license/activate', async () => {
  const app = await build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/license/activate',
    payload: {
      licenseKey: 'test-pro-license-key',
      deviceFingerprint: 'device-123'
    }
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({
    token: expect.stringMatching(/^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/),
    expiresAt: expect.any(Number)
  });
});
```

---

### E2E Tests

Test in real Obsidian environment:

```typescript
// Manual E2E checklist:
// 1. Purchase Pro license via Stripe checkout
// 2. Receive license key via email
// 3. Activate in Obsidian plugin settings
// 4. Verify premium features unlock
// 5. Test on second device (within limit)
// 6. Test device limit enforcement
// 7. Deactivate device, verify slot freed
```

---

### Security Tests

Test cryptographic verification:

```bash
# Test 1: Verify signature with correct public key
node -e "
const ed = require('@noble/ed25519');
const token = 'your-license-token';
const [payload, sig] = token.split('.');
const isValid = await ed.verify(
  Buffer.from(sig, 'base64'),
  Buffer.from(payload, 'base64'),
  PUBKEY
);
console.log('Valid:', isValid);
"

# Test 2: Reject tampered token
# (Manually modify payload, verify signature fails)

# Test 3: Test key rotation
# (Verify old and new keys both work during transition)
```

---

## Troubleshooting Guide

### Issue 1: "Invalid License Key" Error

**Symptoms:**
```
Error: License activation failed: INVALID_KEY
```

**Possible Causes:**
1. Typo in license key
2. License not yet issued (Stripe webhook not processed)
3. License revoked or expired

**Diagnosis:**
```bash
# Check if license exists in database
docker compose exec api sh -c '
psql $DATABASE_URL -c "
SELECT id, status, public_key, created_at
FROM licenses
WHERE public_key LIKE '\''%partial-key%'\'';
"
'
```

**Solutions:**
- **If not found:** Check worker processed Stripe webhook
  ```bash
  docker compose logs worker | grep "checkout.session.completed"
  ```
- **If status = REVOKED:** Contact support for reactivation
- **If status = EXPIRED:** Renew subscription

---

### Issue 2: "Device Limit Reached" Error

**Symptoms:**
```
Error: Cannot activate license: MAX_DEVICES_REACHED
```

**Cause:** User trying to activate on 4th device (Pro = 3 devices)

**Solution for Users:**
1. Deactivate unused device:
   - Open Obsidian plugin settings
   - Click "Deactivate License"
   - Activate on new device

**Solution for Admins:**
```bash
# View active devices for license
docker compose exec api sh -c '
psql $DATABASE_URL -c "
SELECT device_id_hashes, array_length(device_id_hashes, 1) as active_count
FROM licenses
WHERE id = '\''license-uuid'\'';
"
'

# Manually remove device (emergency only!)
# Update licenses SET device_id_hashes = array_remove(device_id_hashes, 'device-hash');
```

---

### Issue 3: "Signature Verification Failed"

**Symptoms:**
```
Error: License signature invalid
```

**Possible Causes:**
1. Wrong public key embedded in plugin
2. Token corrupted during copy/paste
3. Key rotation mismatch

**Diagnosis:**
```bash
# Verify public key in plugin code
grep "PUBLIC_KEY" apps/plugin/license.ts

# Compare with server's public key
echo $LICENSE_PUBLIC_KEY_B64 | base64 -d | xxd
```

**Solutions:**
- **Key mismatch:** Rebuild plugin with correct public key
- **Token corrupted:** Copy token again (avoid line breaks!)
- **Key rotation issue:** Ensure plugin accepts both old and new keys during transition

---

### Issue 4: License Expires Immediately After Activation

**Symptoms:**
```
License activated but shows "Expired" after 1 minute
```

**Cause:** Clock skew between server and client

**Diagnosis:**
```bash
# Check server time
docker compose exec api date +%s

# Check client time
date +%s

# Difference should be < 300 seconds
```

**Solution:**
```bash
# Sync server time (if on VPS)
sudo ntpdate pool.ntp.org

# Or configure NTP
sudo systemctl enable systemd-timesyncd
sudo systemctl start systemd-timesyncd
```

---

### Issue 5: Grace Period Not Working

**Symptoms:**
- License expired 3 days ago
- User still has full access (should be in grace period)

**Cause:** Plugin not checking expiration correctly

**Diagnosis:**
```typescript
// In plugin code, verify expiration check:
const now = Math.floor(Date.now() / 1000);
const isExpired = license.exp < now;
const inGracePeriod = license.graceEndsAt && license.graceEndsAt > now;
```

**Solution:**
- Update plugin logic to handle grace period
- Ensure `graceEndsAt` field populated in token

---

### Issue 6: Webhook Creates Multiple Licenses

**Symptoms:**
- User receives 2-3 license keys after single purchase
- Database shows duplicate licenses for same user

**Cause:** Stripe webhook retry (idempotency not working)

**Diagnosis:**
```bash
# Check for duplicate payment events
docker compose exec api sh -c '
psql $DATABASE_URL -c "
SELECT stripe_id, status, COUNT(*)
FROM payment_events
GROUP BY stripe_id, status
HAVING COUNT(*) > 1;
"
'
```

**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check worker processes events idempotently (see `stripeProcessor.ts`)
- Add unique constraint on `payment_events.stripe_id`

---

### Issue 7: Ed25519 Performance Issues

**Symptoms:**
- License activation takes > 2 seconds
- High CPU usage during signature verification

**Cause:** Ed25519 operations in tight loop or wrong implementation

**Diagnosis:**
```bash
# Profile signature operations
node --prof apps/plugin/main.js
node --prof-process isolate-*.log
```

**Solutions:**
- Cache public key (don't re-parse on each verification)
- Use `@noble/ed25519` (already using ✅)
- Avoid verifying expired tokens (check timestamp first)

**Optimized verification:**
```typescript
// Fast path: Check expiration before expensive signature verification
if (payload.exp < Math.floor(Date.now() / 1000)) {
  return { valid: false, error: 'EXPIRED' };
}

// Only verify signature if not expired
const isValid = await ed.verify(signature, message, publicKey);
```

---

## Code Examples

### Generating License Keys (Server-Side)

```typescript
import * as ed from '@noble/ed25519';
import { randomBytes } from 'crypto';

async function generateLicense(userId: string, plan: 'FREE' | 'PRO' | 'LIFETIME') {
  // 1. Generate license key (random 256-bit value)
  const licenseKey = randomBytes(32).toString('hex');

  // 2. Hash for storage
  const hashedKey = await hashLicenseKey(licenseKey);

  // 3. Create database record
  const license = await prisma.license.create({
    data: {
      userId,
      hashedKey,
      publicKey: licenseKey, // Store plaintext for user
      planType: plan,
      status: 'ACTIVE',
      expiresAt: plan === 'LIFETIME' ? null : addYears(new Date(), 1),
      deviceIdHashes: []
    }
  });

  // 4. Return license key to user (via email)
  return licenseKey;
}
```

---

### Activating License (Client-Side)

```typescript
import * as ed from '@noble/ed25519';

async function activateLicense(licenseKey: string, deviceId: string) {
  // 1. Call activation endpoint
  const response = await fetch('/api/v1/license/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      licenseKey,
      deviceFingerprint: deviceId
    })
  });

  if (!response.ok) {
    throw new Error('Activation failed');
  }

  // 2. Receive signed token
  const { token } = await response.json();

  // 3. Verify signature offline
  const [payloadB64, signatureB64] = token.split('.');
  const payload = JSON.parse(atob(payloadB64));
  const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
  const message = new TextEncoder().encode(payloadB64);

  const isValid = await ed.verify(signature, message, PUBLIC_KEY);

  if (!isValid) {
    throw new Error('Invalid signature');
  }

  // 4. Cache token locally
  await this.app.vault.adapter.write('.obsidian/license.token', token);

  return payload;
}
```

---

### Verifying License (Offline)

```typescript
async function verifyLicenseOffline(token: string): Promise<boolean> {
  try {
    // 1. Parse token
    const [payloadB64, signatureB64] = token.split('.');
    const payload = JSON.parse(atob(payloadB64));

    // 2. Check expiration (fast path)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Check grace period
      if (!payload.graceEndsAt || payload.graceEndsAt < now) {
        return false; // Fully expired
      }
    }

    // 3. Verify signature
    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    const message = new TextEncoder().encode(payloadB64);

    const publicKey = getPublicKeyForVersion(payload.v);
    const isValid = await ed.verify(signature, message, publicKey);

    return isValid;
  } catch (err) {
    console.error('License verification failed:', err);
    return false;
  }
}
```

---

**Specification:** [openapi-licensing-v1.yaml](openapi-licensing-v1.yaml)
