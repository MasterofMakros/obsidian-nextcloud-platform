# API Specification

> **Complete API specification for the Obsidian Nextcloud Media Platform.**

**Version:** 1.0.0  
**Base URL:** `/api/v1/`  
**Last Updated:** 2026-01-29

---

## 🎯 Overview

This document describes all public API endpoints for the platform. All endpoints are prefixed with `/api/v1/` unless otherwise noted.

### Authentication

- **License Endpoints:** License key in request body
- **Stripe Webhook:** Signature validation
- **AI Gateway:** Bearer token

### Content-Type

All requests and responses use `application/json`.

---

## 🏥 Health & Observability

### GET /health

Liveness probe for load balancers.

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- `200` - Service is alive

---

### GET /readyz

Readiness probe with dependency checks.

**Response (Success):**
```json
{
  "status": "ready",
  "db": "ok",
  "redis": "ok"
}
```

**Response (Failure):**
```json
{
  "status": "not_ready",
  "db": "fail",
  "redis": "ok"
}
```

**Status Codes:**
- `200` - All dependencies healthy
- `503` - One or more dependencies failing

---

### GET /metrics

Prometheus metrics endpoint.

**Response:**
```
# HELP onm_api_http_requests_total Total HTTP requests
# TYPE onm_api_http_requests_total counter
onm_api_http_requests_total{method="GET",route="/health",status_code="200"} 42

# HELP onm_api_http_request_duration_seconds HTTP request duration
# TYPE onm_api_http_request_duration_seconds histogram
onm_api_http_request_duration_seconds_bucket{le="0.01"} 35
...
```

**Status Codes:**
- `200` - Metrics available

---

## 🔑 Licensing

### POST /license/activate

Activate a license on a new device.

**Rate Limit:** 20 requests per minute

**Request:**
```json
{
  "licenseKey": "ONM-PRO-XXXX-XXXX-XXXX",
  "deviceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Request Schema:**
```typescript
{
  licenseKey: string (min 10 chars)
  deviceId: string (UUID format)
}
```

**Response (Success):**
```json
{
  "token": "eyJ2IjoxLCJzdWIiOiJ1c2VyXzEyMyJ9.c2lnbmF0dXJl",
  "expiresAt": "2026-12-31T23:59:59Z",
  "features": ["4k-streaming", "batch-sync"],
  "maxDevices": 3
}
```

**Response (Error - Invalid Key):**
```json
{
  "error": "Invalid license key"
}
```

**Response (Error - Device Limit):**
```json
{
  "error": "Device limit reached",
  "maxDevices": 3,
  "activeDevices": 3
}
```

**Status Codes:**
- `200` - Activation successful
- `400` - Invalid input
- `401` - Invalid license key
- `403` - Device limit reached or license revoked
- `429` - Rate limit exceeded

---

### POST /license/refresh

Refresh an existing license token.

**Rate Limit:** 120 requests per minute

**Request:**
```json
{
  "token": "eyJ2IjoxLCJzdWIiOiJ1c2VyXzEyMyJ9.c2lnbmF0dXJl",
  "deviceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Success):**
```json
{
  "token": "eyJ2IjoxLCJzdWIiOiJ1c2VyXzEyMyJ9.c2lnbmF0dXJl",
  "expiresAt": "2026-12-31T23:59:59Z",
  "features": ["4k-streaming", "batch-sync"],
  "maxDevices": 3
}
```

**Response (Grace Period):**
```json
{
  "token": "eyJ2IjoxLCJzdWIiOiJ1c2VyXzEyMyJ9.c2lnbmF0dXJl",
  "expiresAt": "2026-01-15T23:59:59Z",
  "graceEndsAt": "2026-01-22T23:59:59Z",
  "features": ["4k-streaming", "batch-sync"],
  "maxDevices": 3,
  "warning": "License expired, grace period active"
}
```

**Status Codes:**
- `200` - Refresh successful
- `400` - Invalid input
- `401` - Invalid or expired token
- `403` - License revoked
- `429` - Rate limit exceeded

---

### POST /license/verify

Verify a license token's validity.

**Rate Limit:** Standard API limits

**Request:**
```json
{
  "token": "eyJ2IjoxLCJzdWIiOiJ1c2VyXzEyMyJ9.c2lnbmF0dXJl"
}
```

**Response (Success):**
```json
{
  "valid": true,
  "licenseId": "lic_123456",
  "status": "ACTIVE",
  "plan": "PRO",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

**Response (Expired):**
```json
{
  "valid": false,
  "error": "EXPIRED",
  "expiredAt": "2026-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200` - Verification complete
- `400` - Invalid input

---

### POST /license/deactivate

Remove a device from a license.

**Rate Limit:** Standard API limits

**Request:**
```json
{
  "licenseKey": "ONM-PRO-XXXX-XXXX-XXXX",
  "deviceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Device deactivated successfully"
}
```

**Status Codes:**
- `200` - Deactivation successful
- `400` - Invalid input
- `401` - Invalid license key
- `404` - Device not found

---

### GET /license/status

Check subscription status (requires authentication).

**Response:**
```json
{
  "licenseId": "lic_123456",
  "status": "ACTIVE",
  "plan": "PRO",
  "expiresAt": "2026-12-31T23:59:59Z",
  "features": ["4k-streaming", "batch-sync"],
  "activeDevices": 2,
  "maxDevices": 3
}
```

**Status Codes:**
- `200` - Status retrieved
- `401` - Not authenticated

---

## 💳 Stripe Webhooks

### POST /stripe/webhook

Receive and process Stripe webhook events.

**Rate Limit:** 300 requests per minute

**Authentication:** Stripe signature validation

**Events Handled:**

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create license, send confirmation |
| `invoice.payment_succeeded` | Extend/renew license |
| `invoice.payment_failed` | Mark license as payment_failed |
| `customer.subscription.deleted` | Revoke license |

**Request Headers:**
```
Stripe-Signature: t=1234567890,v1=signature...
```

**Request Body:**
```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_1234567890",
      "customer_email": "user@example.com",
      ...
    }
  }
}
```

**Response (Success):**
```json
{
  "received": true
}
```

**Response (Invalid Signature):**
```json
{
  "error": "Invalid signature"
}
```

**Response (Unsupported Event):**
```json
{
  "received": true,
  "note": "Event type not processed"
}
```

**Status Codes:**
- `200` - Webhook received and processed
- `400` - Invalid payload
- `401` - Invalid signature

---

## 🤖 AI Gateway

### POST /v1/agent/run

Execute AI tasks for support automation.

**Base URL:** `/v1/` (not `/api/v1/`)

**Authentication:** Bearer token

**Rate Limit:** Configured per deployment

**Request:**
```json
{
  "task": "issue_intake",
  "input": {
    "email_subject": "License activation failed",
    "email_body": "I'm getting an error when trying to activate..."
  }
}
```

**Tasks:**

| Task | Description |
|------|-------------|
| `issue_intake` | Classify support emails |
| `analysis` | Root-cause analysis |
| `fix_proposal` | Generate fix patches |

**Response (issue_intake):**
```json
{
  "type": "bug",
  "severity": "major",
  "area": "licensing",
  "summary": "License activation failure",
  "repro_steps": "User attempts to activate license...",
  "confidence": 0.85,
  "suggested_labels": ["bug", "licensing", "activation"]
}
```

**Response (analysis):**
```json
{
  "analysis_md": "## Root Cause\n\nThe issue is caused by...",
  "risk": "medium",
  "confidence": 0.78
}
```

**Response (fix_proposal):**
```json
{
  "analysis_md": "## Analysis\n\nThe bug is in...",
  "risk": "low",
  "confidence": 0.92,
  "patch_unified_diff": "--- a/file.ts\n+++ b/file.ts\n...",
  "pr_title": "Fix: License activation edge case",
  "pr_body": "This PR fixes..."
}
```

**Status Codes:**
- `200` - Task completed
- `400` - Invalid request
- `401` - Unauthorized
- `422` - Schema validation failed

---

## ⚠️ Error Responses

### Standard Error Format

All errors follow this structure:

```json
{
  "error": "Error code or message",
  "details": ["Additional context"],
  "requestId": "req_123456"
}
```

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| `400` | `Invalid input` | Request body validation failed |
| `401` | `Unauthorized` | Authentication required |
| `403` | `Forbidden` | Permission denied |
| `404` | `Not found` | Resource doesn't exist |
| `429` | `Rate limit exceeded` | Too many requests |
| `500` | `Internal error` | Server error |

### Rate Limit Response

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "limit": 20,
  "window": "1m"
}
```

---

## 📊 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/health` | 1000 | 1 minute |
| `/readyz` | 1000 | 1 minute |
| `/metrics` | 100 | 1 minute |
| `/license/activate` | 20 | 1 minute |
| `/license/refresh` | 120 | 1 minute |
| `/license/verify` | 1000 | 1 minute |
| `/license/deactivate` | 100 | 1 minute |
| `/stripe/webhook` | 300 | 1 minute |
| `/v1/agent/run` | Configurable | - |

---

## 🔗 OpenAPI Specification

Full OpenAPI 3.0 specification: `docs/openapi-licensing-v1.yaml`

---

<div align="center">

**Built with ❤️ and ☕ by Fentrea GmbH** 🇨🇭

*Swiss engineering. Privacy first. Always.*

</div>
