# obsidian-nextcloud-media – kommerzielle Plattform

A premium, privacy-first solution for syncing and streaming media between **Obsidian** and **Nextcloud**.

## Overview

This monorepo contains the complete commercial platform:
- **Plugin**: Obsidian plugin with offline-first Ed25519 licensing.
- **Web**: Next.js marketing and management portal.
- **API**: Fastify backend for license issuance and management.
- **Worker**: Event processor for Stripe payments (Idempotent).

## Features

- **Privacy-First License**: No "phone home" required for daily use. Offline verification.
- **Premium Sync**: High-fidelity video streaming and image previews.
- **Secure**: End-to-End encrypted architecture.

## Getting Started

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for infrastructure setup.

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Structure

- `apps/plugin`: The Obsidian Plugin.
- `apps/web`: The Website (Landing, Pricing, Dashboard).
- `apps/api`: Backend API.
- `apps/worker`: Background Job Worker.
- `packages/`: Shared libraries (`db`, `design-tokens`, `config`).
