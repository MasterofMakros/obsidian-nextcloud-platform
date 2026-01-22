# v1.0.0-commercial Release Notes

**Commercial Release / Production-Ready**

This release marks the first stable, commercial-grade version of the obsidian-nextcloud-platform backend. It incoporates hardened security, full observability, and a robust event-driven architecture for licensing.

## 🚀 Key Features

### Security (P1-5)
- **API Hardening**: Strict, Redis-backed Rate Limiting per route (Activate, Refresh, Webhook).
- **CORS Allowlist**: Strict origin checks (env-driven).
- **Security Headers**: `nosniff`, `DENY` frames, `no-referrer`, optional HSTS.
- **Licensing**: Offline-first Ed25519-based license tokens with grace period support.

### Observability (P1-4)
- **Prometheus Metrics**: Full instrumentation for API (`http_requests_total`) and Worker (`jobs_processed_total`, `queue_lag`).
- **Structured Logging**: JSON logging via Pino with sensitive data redaction (PII, tokens).
- **Health Checks**: `/health` (liveness) and `/readyz` (readiness with deep DB/Redis checks).

### Operations (P2)
- **Deployment**: Single-command Staging deployment via `docker compose` + Traefik.
- **CI/CD**: Reproducible, immutable builds via GHCR (`.github/workflows/docker-build.yml`).
- **Runbooks**: Comprehensive `DEPLOYMENT.md` covering rollbacks, key rotation, and smoke testing.

## 🛡️ Changelog
- **API**: Implemented Fastify server with dependency injection.
- **Worker**: Implemented BullMQ worker for idempotent Stripe webhook processing.
- **Docs**: Added `DEPLOYMENT.md`, `OBSERVABILITY.md`, `LICENSING.md`.
- **Infra**: Docker Compose for dev and stage environments.

## 📦 Artifacts
- API Image: `ghcr.io/masterofmakros/obsidian-nextcloud-platform/api:v1.0.0`
- Worker Image: `ghcr.io/masterofmakros/obsidian-nextcloud-platform/worker:v1.0.0`
