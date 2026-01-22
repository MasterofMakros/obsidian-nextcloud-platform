# obsidian-nextcloud-media – Commercial Platform

![Status: Commercial Grade](https://img.shields.io/badge/Status-Commercial%20Grade-green) ![Release: v1.0.0](https://img.shields.io/badge/Release-v1.0.0--commercial-blue)

A premium, privacy-first solution for syncing and streaming media between **Obsidian** and **Nextcloud**.

## Overview

This monorepo contains the complete commercial platform (Backend, Web, Plugin).
**Status:** `v1.0.0-commercial` (Stable, Hardened)

- **Plugin**: Obsidian plugin with offline-first Ed25519 licensing.
- **Web**: Next.js marketing and management portal.
- **API**: Hardened Fastify backend for license issuance and management.
- **Worker**: Idempotent event processor for Stripe payments.

## Key Capabilities

- **Privacy-First License**: No "phone home" required for daily use. Offline verification.
- **Security**: Rate-limited, hardened API with strict CORS and Headers.
- **Observability**: Prometheus metrics and structured JSON logging.
- **Operations**: Immutable GHCR builds and reproducible staging deployments.

## Documentation

- **Operations**: [DEPLOYMENT.md](docs/DEPLOYMENT.md) (Runbooks, Rollbacks)
- **Licensing**: [LICENSING.md](docs/LICENSING.md) (Protocol Spec)
- **Observability**: [OBSERVABILITY.md](docs/OBSERVABILITY.md) (Metrics & Logs)
- **Stripe**: [STRIPE.md](docs/STRIPE.md) (Webhook Lifecycle)

## Getting Started

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for infrastructure setup.

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run Tests (Unit, Integration, E2E)
pnpm test
```

## Structure

- `apps/plugin`: The Obsidian Plugin.
- `apps/web`: The Website (Landing, Pricing, Dashboard).
- `apps/api`: Backend API.
- `apps/worker`: Background Job Worker.
- `packages/`: Shared libraries (`db`, `design-tokens`, `config`).
