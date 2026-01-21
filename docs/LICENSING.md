# Licensing System

We use an **Offline-First** licensing model based on **Ed25519** digital signatures.

## Flow
1. **Purchase**: User buys "Pro" via Stripe.
2. **Issuance**: Worker detects purchase -> Generates a License Payload -> Signs it with Private Key.
3. **Delivery**: Signed Token (Base64 Payload + Signature) is emailed to user.
4. **Activation**: User enters license key (or simply the token) in the Plugin.
5. **Verification**: Plugin uses embedded **Public Key** to verify the signature locally.

## Token Payload
```json
{
  "userId": "uuid",
  "features": ["4k-streaming"],
  "expiresAt": 1735689600000 // Timestamp
}
```

## Security
- **Private Key**: Kept strictly on the backend (never in repo).
- **Public Key**: Hardcoded in the Plugin source (`license.ts`).
- **Tamper Proof**: Changing any byte in the payload invalidates the signature.
