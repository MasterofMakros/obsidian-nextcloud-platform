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

**Specification:** [openapi-licensing-v1.yaml](openapi-licensing-v1.yaml)
