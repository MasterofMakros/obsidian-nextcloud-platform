# System Architecture

> **Complete architecture documentation for the Obsidian Nextcloud Media Platform.**

**Version:** 1.0.0  
**Last Updated:** 2026-01-29

---

## 🎯 Overview

The Obsidian Nextcloud Media Platform is a **privacy-first media sync solution** that bridges Obsidian (note-taking) and Nextcloud (private cloud) with offline-first licensing via Ed25519 cryptographic signatures.

### Core Principles

1. **Privacy-First:** User data stays on their devices
2. **Offline-Capable:** Licenses verify locally without internet
3. **Production-Ready:** Security, observability, and testing built-in
4. **Swiss-Engineered:** Calm, technical, no marketing fluff

---

## 🏗️ System Components

### Frontend Layer

| Component | Port | Technology | Purpose |
|-----------|------|------------|---------|
| **Next.js Web App** | 3010 | Next.js 16.1.5, React 19.2.4 | Marketing, dashboard, Stripe checkout |
| **Obsidian Plugin** | - | TypeScript | Offline license verification, media sync |

### API Gateway Layer

| Component | Port | Technology | Purpose |
|-----------|------|------------|---------|
| **Traefik** | 80, 8080 | Traefik | Reverse proxy, HTTPS/TLS termination, automatic SSL |

### Backend Services

| Component | Port | Technology | Purpose |
|-----------|------|------------|---------|
| **Fastify API Server** | 3011 | Fastify 5.7.1 | License management, Stripe webhooks, health checks |
| **BullMQ Worker** | 9110 | BullMQ 5.67.1 | Async job processing, idempotent event handling |
| **AI Gateway** | 8081 | Fastify | n8n integration, support automation |

### Data Layer

| Component | Port | Technology | Purpose |
|-----------|------|------------|---------|
| **PostgreSQL** | 5432 | 16-alpine | User, License, PaymentEvent tables |
| **Redis** | 6379 | 7-alpine | Job queue, caching |

---

## 🔄 Data Flows

### 1. License Activation Flow

```
┌──────────────┐     POST /api/v1/license/activate     ┌──────────────┐
│   Obsidian   │ ───────────────────────────────────────│   Fastify    │
│    Plugin    │                                        │     API      │
└──────────────┘                                        └──────┬───────┘
                                                               │
                                                    ┌──────────┴──────────┐
                                                    │                     │
                                                    ▼                     ▼
                                          ┌──────────────┐    ┌──────────────┐
                                          │   Validate   │    │ Check Device │
                                          │ License Key  │    │    Limits    │
                                          └──────┬───────┘    └──────┬───────┘
                                                 │                   │
                                                 └─────────┬─────────┘
                                                           │
                                                           ▼
                                                 ┌──────────────────┐
                                                 │ Sign with Ed25519 │
                                                 │  Private Key      │
                                                 └────────┬─────────┘
                                                          │
                                                          ▼
                                               ┌──────────────────────┐
                                               │   Return Signed      │
                                               │   Token to Plugin    │
                                               └──────────┬───────────┘
                                                          │
                               ┌──────────────────────────┘
                               ▼
                    ┌────────────────────┐
                    │ Plugin Verifies    │
                    │ Signature Offline  │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Cache License      │
                    │ Locally            │
                    └────────────────────┘
```

### 2. Stripe Webhook Flow

```
┌──────────────┐           Webhook Event           ┌──────────────┐
│    Stripe    │ ───────────────────────────────────│   Fastify    │
│   Webhook    │                                    │     API      │
└──────────────┘                                    └──────┬───────┘
                                                           │
                                                           ▼
                                               ┌──────────────────────┐
                                               │ Validate Webhook     │
                                               │ Signature            │
                                               └──────────┬───────────┘
                                                          │
                                                          ▼
                                               ┌──────────────────────┐
                                               │ Enqueue Job to       │
                                               │ Redis (BullMQ)       │
                                               └──────────┬───────────┘
                                                          │
                                                          ▼
                                               ┌──────────────────────┐
                                               │ BullMQ Worker        │
                                               │ Picks Up Job         │
                                               └──────────┬───────────┘
                                                          │
                               ┌──────────────────────────┼──────────────────────────┐
                               │                          │                          │
                               ▼                          ▼                          ▼
                    ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
                    │ Idempotency      │     │ Create/Update    │     │ Update           │
                    │ Check            │     │ User & License   │     │ Metrics          │
                    │ (PaymentEvent)   │     │ in PostgreSQL    │     │                  │
                    └──────────────────┘     └──────────────────┘     └──────────────────┘
```

### 3. AI Gateway Flow (n8n Integration)

```
┌──────────────┐           POST /v1/agent/run          ┌──────────────┐
│     n8n      │ ───────────────────────────────────────│ AI Gateway   │
│   Workflow   │              Bearer Token             │  (Port 8081) │
└──────────────┘                                        └──────┬───────┘
                                                               │
                                                    ┌──────────┴──────────┐
                                                    │                     │
                                                    ▼                     ▼
                                          ┌──────────────┐    ┌──────────────┐
                                          │ issue_intake │    │  analysis    │
                                          │              │    │              │
                                          └──────────────┘    └──────────────┘
                                                               │
                                                               ▼
                                                    ┌──────────────────┐
                                                    │ fix_proposal     │
                                                    │                  │
                                                    └──────────────────┘
```

---

## 📁 Directory Structure

```
obsidian-nextcloud-platform/
│
├── 📦 apps/                          # Applications
│   │
│   ├── api/                         # Fastify API Server (Port 3011)
│   │   ├── src/
│   │   │   ├── routes/              # API endpoints
│   │   │   │   ├── health.ts        # /health, /readyz, /metrics
│   │   │   │   ├── license.ts       # License activation/refresh
│   │   │   │   └── stripe.ts        # Webhook handler
│   │   │   ├── plugins/             # Fastify plugins
│   │   │   │   ├── cors.ts          # CORS with allowlist
│   │   │   │   ├── rate-limit.ts    # Per-route rate limiting
│   │   │   │   ├── security-headers.ts
│   │   │   │   └── metrics.ts       # Prometheus instrumentation
│   │   │   └── lib/
│   │   │       └── licensing.ts     # License validation utilities
│   │   └── Dockerfile
│   │
│   ├── web/                         # Next.js Frontend (Port 3010)
│   │   ├── app/                     # App Router
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── globals.css          # Global styles
│   │   │   ├── pricing/             # Pricing page
│   │   │   ├── checkout/            # Stripe checkout flow
│   │   │   └── docs/                # Documentation pages
│   │   ├── components/              # React components
│   │   │   ├── SiteHeader.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   ├── Container.tsx
│   │   │   └── Prose.tsx
│   │   └── Dockerfile
│   │
│   ├── worker/                      # BullMQ Processor (Port 9110)
│   │   ├── src/
│   │   │   ├── index.ts             # Worker entry point
│   │   │   ├── stripeProcessor.ts   # Idempotent Stripe handler
│   │   │   └── metrics.ts           # Prometheus metrics server
│   │   └── Dockerfile
│   │
│   ├── gateway/                     # AI Gateway (Port 8081)
│   │   ├── src/
│   │   │   ├── index.ts             # Fastify app
│   │   │   ├── auth.ts              # Bearer token auth
│   │   │   ├── schemas.ts           # Zod validation
│   │   │   └── tasks/
│   │   │       ├── issueIntake.ts   # Classify issues
│   │   │       ├── analysis.ts      # Root-cause analysis
│   │   │       └── fixProposal.ts   # Generate fix patches
│   │   └── Dockerfile
│   │
│   └── plugin/                      # Obsidian Plugin
│       ├── main.ts                  # Plugin entry point
│       ├── license.ts               # Ed25519 verification
│       └── manifest.json
│
├── 📦 packages/                      # Shared Packages
│   ├── db/                          # Prisma Schema
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       └── client.ts
│   ├── design-tokens/               # CSS Variables
│   │   ├── tokens.json
│   │   └── dist/
│   └── config/                      # TypeScript Configs
│       └── typescript/
│
├── 🔧 infra/                        # Infrastructure
│   ├── docker-compose.yml           # Development setup
│   ├── stage/
│   │   └── docker-compose.stage.yml # Staging config
│   └── .env.example
│
└── 📚 docs/                         # Documentation
    ├── 00-INDEX.md                  # AI Assistant Entry Point
    ├── ARCHITECTURE.md              # This file
    ├── API-SPEC.md                  # OpenAPI specification
    ├── DATABASE.md                  # Schema documentation
    ├── DEPLOYMENT.md                # Deployment guide
    ├── TESTING.md                   # Testing strategy
    ├── STYLEGUIDE.md                # UI/UX guidelines
    └── PERFORMANCE_ANALYSIS.md      # Performance optimization
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Next.js | 16.1.5 | React framework |
| **Frontend** | React | 19.2.4 | UI library |
| **Backend** | Fastify | 5.7.1 | Web framework |
| **Backend** | BullMQ | 5.67.1 | Job queue |
| **Database** | PostgreSQL | 16-alpine | Primary database |
| **Cache** | Redis | 7-alpine | Job queue & cache |
| **ORM** | Prisma | 7.3.0 | Database ORM |
| **Validation** | Zod | 3.22+ | Schema validation |
| **Testing** | Vitest | 4.0.18 | Unit testing |
| **E2E** | Playwright | 1.58.0 | Browser testing |
| **Crypto** | @noble/ed25519 | - | License signatures |
| **Payments** | Stripe | 14.25+ | Payment processing |

---

## 🔐 Security Architecture

### Authentication & Authorization

| Component | Method | Details |
|-----------|--------|---------|
| **License Verification** | Ed25519 Signatures | Offline verification, no server roundtrip |
| **API Access** | CORS Allowlist | Environment-driven origin checks |
| **Stripe Webhooks** | Signature Validation | HMAC-SHA256 verification |
| **AI Gateway** | Bearer Token | Per-request authentication |

### Security Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Strict-Transport-Security` (production only)

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/license/activate` | 20 | 1 minute |
| `/license/refresh` | 120 | 1 minute |
| `/stripe/webhook` | 300 | 1 minute |

---

## 📊 Observability

### Metrics (Prometheus)

**API Metrics:**
- `onm_api_http_requests_total` - Request count
- `onm_api_http_request_duration_seconds` - Request latency
- `onm_api_license_activations_total` - License activations
- `onm_api_stripe_webhooks_received_total` - Webhook count

**Worker Metrics:**
- `onm_worker_jobs_processed_total` - Job count
- `onm_worker_job_duration_seconds` - Job latency
- `onm_worker_queue_waiting_count` - Queue depth

### Health Checks

| Endpoint | Purpose |
|----------|---------|
| `/health` | Liveness probe |
| `/readyz` | Readiness (DB + Redis) |
| `/metrics` | Prometheus metrics |

### Logging

- **Format:** Structured JSON (Pino)
- **Fields:** `level`, `time`, `service`, `event`, `msg`, `context`
- **Redaction:** Authorization headers, cookies, license keys, tokens

---

## 🚀 Deployment Architecture

### Development

```bash
docker compose up -d postgres redis
pnpm --filter api run dev      # Port 3011
pnpm --filter worker run dev   # Port 9110
pnpm --filter web run dev      # Port 3010
```

### Staging/Production

```bash
docker compose -f infra/stage/docker-compose.stage.yml up -d
```

**Services:**
- Traefik (reverse proxy)
- API (Fastify)
- Worker (BullMQ)
- Web (Next.js)
- PostgreSQL
- Redis

---

## 🎯 Key Design Decisions

### 1. Offline-First Licensing

**Decision:** Use Ed25519 signatures for offline license verification.

**Rationale:**
- No internet required for daily use
- Cryptographic proof of purchase
- No "phone home" requirement

**Trade-off:**
- License keys can be shared (trust-based system)
- Device fingerprinting required for limits

### 2. Event-Driven Architecture

**Decision:** Use BullMQ for async job processing.

**Rationale:**
- Stripe webhooks must be processed reliably
- Idempotency via PaymentEvent table
- Retry logic for failed jobs

**Trade-off:**
- Added complexity (Redis, Worker)
- Potential queue lag under high load

### 3. Monorepo Structure

**Decision:** Use pnpm workspaces for all components.

**Rationale:**
- Shared packages (db, design-tokens, config)
- Single CI/CD pipeline
- Consistent tooling

**Trade-off:**
- Larger repository size
- More complex dependency management

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| **API Documentation** | http://localhost:3011/docs |
| **Metrics** | http://localhost:3011/metrics |
| **Health Check** | http://localhost:3011/health |
| **Security Issues** | security@fentrea.ch |

---

<div align="center">

**Built with ❤️ and ☕ by Fentrea GmbH** 🇨🇭

*Swiss engineering. Privacy first. Always.*

</div>
