# Obsidian Nextcloud Media Platform

> Privacy-first media sync platform with offline Ed25519 licensing. Production-ready architecture for bridging Obsidian and Nextcloud.

A full-stack, production-ready solution with **offline-first licensing**, **Ed25519 cryptographic signatures**, and **zero "phone home" requirements**. Your data stays on your devices—period.

## Prerequisites

- **Node.js 18+** with [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- **Docker** and **Docker Compose** (for PostgreSQL and Redis)
- **Git** (optional, for cloning)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/MasterofMakros/obsidian-nextcloud-platform.git
cd obsidian-nextcloud-platform
pnpm install
```

### 2. Start Infrastructure

```bash
docker compose up -d postgres redis
```

This spins up PostgreSQL and Redis in the background.

### 3. Start Development Services

Open three terminals:

```bash
# Terminal 1: API Server
pnpm --filter api run dev
# → http://localhost:3011

# Terminal 2: Background Worker
pnpm --filter worker run dev
# → http://localhost:9110/metrics

# Terminal 3: Web Frontend
pnpm --filter web run dev
# → http://localhost:3010
```

### 4. Open the App

Navigate to **http://localhost:3010** and you're live!

> 💡 **Pro Tip:** API docs available at `http://localhost:3011/docs`

## Architecture

```
┌─────────────────┐                      ┌─────────────────┐
│   Next.js 14    │                      │  Obsidian Plugin│
│   Port 3010     │                      │  (Offline ED25519
└────────┬────────┘                      │   Verification) │
         │                              └─────────────────┘
         │ HTTP/JSON                              │
         ▼                                        │
┌─────────────────┐                      ┌────────┴────────┐
│   Traefik RP    │                      │   Fastify API   │
│   HTTPS/TLS     │◄────────────────────►│   Port 3011     │
└─────────────────┘                      └────────┬────────┘
                                                  │
         ┌────────────────────────────────────────┤
         │                                        │
┌────────▼────────┐                      ┌────────▼────────┐
│  BullMQ Worker  │                      │   AI Gateway    │
│   Port 9110     │                      │   Port 8081     │
└────────┬────────┘                      └─────────────────┘
         │
         │ Queue/Cache
         ▼
┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │     │      Redis      │
│   Port 5432     │     │    Port 6379    │
│  (License Data) │     │  (Job Queue)    │
└─────────────────┘     └─────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, CSS Modules |
| API Backend | Fastify, TypeScript, Zod |
| Background Jobs | BullMQ, Redis |
| Database | PostgreSQL 15, Prisma |
| Authentication | ED25519 Signatures (offline) |
| Payments | Stripe Checkout |
| Observability | Prometheus, Pino |

### Project Structure

```
obsidian-nextcloud-platform/
├── apps/
│   ├── api/                    # Fastify API
│   │   ├── src/routes/         # API endpoints (max 250 lines)
│   │   ├── src/plugins/        # Fastify plugins
│   │   └── src/lib/            # Business logic
│   ├── web/                    # Next.js 14
│   │   ├── app/                # App Router
│   │   ├── components/         # React components
│   │   └── e2e/                # Playwright tests
│   ├── worker/                 # BullMQ processor
│   ├── gateway/                # AI/n8n integration
│   └── plugin/                 # Obsidian plugin
├── packages/
│   ├── db/                     # Prisma schema & client
│   └── design-tokens/          # Shared CSS variables
├── infra/
│   └── docker-compose.yml      # Local development
└── docs/                       # Documentation
```

## Features

- **Offline-First Licensing** — ED25519 signatures verified locally. No internet needed for daily use.
- **Swiss-Engineered Privacy** — Your media stays on YOUR devices. Zero data collection.
- **Stripe Integration** — Subscription management with automatic license provisioning. Idempotent webhooks.
- **Production-Ready Security** — Rate limiting, CORS, security headers, Zod validation.
- **Full Observability** — Prometheus metrics, structured JSON logging, health checks.
- **Modern Tech Stack** — Next.js 14, Fastify, TypeScript, Prisma, BullMQ.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/readyz` | Readiness probe |
| GET | `/metrics` | Prometheus metrics |
| POST | `/api/v1/license/activate` | Activate license |
| POST | `/api/v1/license/verify` | Verify license |
| POST | `/api/v1/license/refresh` | Refresh token |
| POST | `/stripe/webhook` | Stripe webhooks |

Full API documentation at `http://localhost:3011/docs` when backend is running.

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI | Push, PR | Lint & Typecheck |
| Deploy | Push | Docker build & push to GHCR |
| E2E Tests | PR, Manual | Playwright E2E tests |
| Integration | Daily, Manual | Full test suite with Docker |

## Testing

```bash
# Run all tests
pnpm test

# Test specific services
pnpm --filter api run test         # API unit tests
pnpm --filter worker run test      # Worker unit tests
pnpm --filter web run test:e2e     # E2E tests with Playwright

# Check coverage
pnpm test:coverage
```

**Coverage Requirements:**
- API/Worker: 80% statements, 75% branches
- Database: 70% statements
- Web: 60% statements

## Development Standards

### File Size Limit
**Maximum 250 lines per file.**

```bash
# Check file sizes
find apps/ packages/ -name "*.ts" -o -name "*.tsx" | \
  xargs wc -l | sort -n | tail -20
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `license-validator.ts` |
| Components | PascalCase | `LicenseCard.tsx` |
| Functions | camelCase | `validateLicense()` |
| Constants | UPPER_SNAKE_CASE | `MAX_DEVICE_COUNT` |
| Types | PascalCase | `interface LicenseConfig` |

### Verification Commands

```bash
# Code quality
pnpm -r run lint
pnpm -r run typecheck

# Check file sizes
find apps/ -name "*.ts" | xargs wc -l | awk '$1 > 250'

# Security scan
pnpm audit
```

## Documentation

| Document | Content |
|----------|---------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture & data flows |
| [API-SPEC.md](docs/API-SPEC.md) | API endpoints & OpenAPI spec |
| [COLE_MEDIN_STYLE.md](docs/COLE_MEDIN_STYLE.md) | Coding standards & best practices |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker deployment guide |
| [LICENSING.md](docs/LICENSING.md) | Ed25519 protocol & offline verification |
| [TESTING.md](docs/TESTING.md) | Test strategy & examples |

## Environment Variables

Copy `.env.example` in each app directory:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `REDIS_URL` | Yes | Redis connection |
| `STRIPE_SECRET_KEY` | Yes | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret |
| `ED25519_PRIVATE_KEY` | Yes | License signing key |

> ⚠️ Never commit `.env` files to version control.

## License

Proprietary Software — See [EULA](docs/legal/EULA.md)

---

<div align="center">

**Built with ❤️ and ☕ by Fentrea GmbH** 🇨🇭

*Swiss engineering. Privacy first. Always.*

</div>
