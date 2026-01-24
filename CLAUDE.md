# CLAUDE.md - AI Assistant Guide

**Last Updated:** 2026-01-23
**Project:** Obsidian Nextcloud Media Platform
**Version:** 1.0.0

---

## 🎯 Project Overview

This is a **production-ready, privacy-first media sync platform** that bridges Obsidian and Nextcloud with:
- **Offline-first Ed25519 licensing** (no phone-home requirements)
- **Stripe integration** for subscription management
- **Full-stack TypeScript monorepo** (pnpm workspaces)
- **Production observability** (Prometheus metrics, structured logging)
- **Comprehensive security hardening** (rate limiting, CORS, security headers)

### Core Philosophy
- **Privacy-first**: User data stays on their devices
- **Offline-capable**: Licenses verify locally without internet
- **Production-ready**: Security, observability, and testing built-in
- **Swiss-engineered**: Calm, technical, no marketing fluff

---

## 🏗️ Architecture

### System Components

```
Frontend Layer:
├── Next.js Web App (Port 3010) - Marketing & dashboard
└── Obsidian Plugin - Offline license verification

API Gateway:
└── Traefik Reverse Proxy - HTTPS/TLS termination

Backend Services:
├── Fastify API Server (Port 3011) - License management & Stripe webhooks
├── BullMQ Worker (Port 9110) - Async job processing
└── AI Gateway (Port 8080) - n8n integration for support automation

Data Layer:
├── PostgreSQL 15+ - User, License, PaymentEvent tables
└── Redis 7+ - Job queue & cache
```

### Request Flow Examples

**License Activation:**
1. User activates in Obsidian plugin → API validates license
2. API checks device limits, stores device hash
3. API signs response with Ed25519 private key
4. Plugin verifies signature offline, caches locally

**Stripe Webhook:**
1. Stripe sends webhook → API validates signature
2. API enqueues job to Redis (BullMQ)
3. Worker processes idempotently (PaymentEvent deduplication)
4. Worker creates/updates User & License in PostgreSQL

---

## 📁 Codebase Structure

### Monorepo Layout

```
obsidian-nextcloud-platform/
├── apps/
│   ├── api/           # Fastify API (TypeScript, Prisma, BullMQ)
│   ├── web/           # Next.js 14 frontend (React 18, CSS Modules)
│   ├── worker/        # BullMQ background processor
│   ├── plugin/        # Obsidian plugin (TypeScript)
│   └── gateway/       # AI Gateway for n8n (Fastify)
│
├── packages/
│   ├── db/            # Prisma schema & migrations
│   ├── design-tokens/ # Shared CSS variables
│   └── config/        # Shared TypeScript configs
│
├── infra/
│   ├── docker-compose.yml        # Development setup
│   └── stage/docker-compose.stage.yml
│
├── docs/              # Comprehensive documentation
│   ├── DEPLOYMENT.md
│   ├── LICENSING.md
│   ├── STRIPE_SETUP.md
│   ├── OBSERVABILITY.md
│   ├── TESTING.md
│   ├── STYLEGUIDE.md
│   └── openapi-licensing-v1.yaml
│
└── .github/workflows/ # CI/CD pipelines
```

### Key Files by App

#### API (`apps/api/`)
```
src/
├── index.ts              # Fastify bootstrap
├── routes/
│   ├── health.ts         # /health, /readyz, /metrics
│   ├── license.ts        # License activation/refresh/revocation
│   └── stripe.ts         # Webhook handler
├── plugins/
│   ├── cors.ts           # CORS with allowlist
│   ├── rate-limit.ts     # Per-route rate limiting
│   ├── security-headers.ts # HSTS, CSP, X-Frame-Options
│   └── metrics.ts        # Prometheus instrumentation
└── lib/
    └── licensing.ts      # License validation utilities
```

**Critical patterns:**
- Plugin-based architecture (order matters!)
- Dependency injection via Fastify decorators
- Ed25519 cryptographic signing for licenses
- Idempotent webhook handling

#### Web (`apps/web/`)
```
app/                      # Next.js App Router
├── layout.tsx            # Root layout
├── page.tsx              # Home page
├── globals.css           # Global styles
├── pricing/              # Pricing page
├── checkout/             # Stripe checkout flow
│   └── success/page.tsx  # Post-checkout success
└── docs/                 # Documentation pages

components/               # Reusable components
├── SiteHeader.tsx
├── SiteFooter.tsx
├── Container.tsx
└── Prose.tsx
```

**Frontend patterns:**
- CSS Modules for component-scoped styles
- Path alias: `@/*` maps to root directory
- Playwright for E2E testing

#### Worker (`apps/worker/`)
```
src/
├── index.ts              # BullMQ Worker setup
├── stripeProcessor.ts    # Idempotent Stripe event handler
└── metrics.ts            # Prometheus metrics server (port 9110)
```

**Worker patterns:**
- Idempotency via `PaymentEvent.stripeId` deduplication
- Handles: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
- Grace period logic for failed payments

#### Plugin (`apps/plugin/`)
```
main.ts                   # Obsidian Plugin class
license.ts                # Ed25519 offline verification
manifest.json             # Plugin metadata
```

**Plugin patterns:**
- Offline-first license verification
- Local token caching with expiration
- Status indicators: Active (green), Grace (yellow), Expired (red)

#### Gateway (`apps/gateway/`)
```
src/
├── index.ts              # Fastify app with /v1/agent/run endpoint
├── auth.ts               # Bearer token authentication
├── schemas.ts            # Zod validation schemas
└── tasks/
    ├── issueIntake.ts    # Classify support issues
    ├── analysis.ts       # Root-cause analysis
    └── fixProposal.ts    # Generate fix patches
```

**Gateway patterns:**
- Task routing: `issue_intake`, `analysis`, `fix_proposal`
- Stub implementations ready for LLM integration
- Human-in-the-loop design (no auto-merge)

---

## 🗄️ Database Schema

**Technology:** PostgreSQL 15+ with Prisma ORM

### Core Models

```prisma
// Enums
enum LicenseStatus { ACTIVE, PAST_DUE, GRACE, REVOKED, EXPIRED }
enum LicensePlan { FREE, PRO, LIFETIME }
enum PaymentEventStatus { PENDING, PROCESSED, FAILED }

// User Model
model User {
  id                String        @id @default(uuid())
  email             String        @unique
  stripeCustomerId  String?       @unique
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  licenses          License[]
}

// License Model
model License {
  id                    String        @id @default(uuid())
  publicKey             String        @unique
  hashedKey             String        // Never plaintext
  keyVersion            Int           @default(1)

  userId                String
  status                LicenseStatus @default(ACTIVE)
  plan                  LicensePlan   @default(PRO)
  stripeSubscriptionId  String?

  features              Json          // ["4k-streaming"]
  deviceIdHashes        String[]      // Max 3 devices

  expiresAt             DateTime?
  graceEndsAt           DateTime?
  lastValidatedAt       DateTime?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  user                  User          @relation(fields: [userId], references: [id])
}

// Payment Event Model (for idempotency)
model PaymentEvent {
  id          String                @id @default(uuid())
  stripeId    String                @unique  // Deduplication key
  type        String                // e.g., "checkout.session.completed"
  payload     Json
  status      PaymentEventStatus    @default(PENDING)
  createdAt   DateTime              @default(now())
  processedAt DateTime?
  error       String?
}
```

### Important Indexes

**Performance critical - add these if missing:**
```prisma
model License {
  @@index([userId])
  @@index([status])
  @@index([stripeSubscriptionId])
  @@index([userId, status])  // Composite for grace period queries
}
```

---

## 🔌 API Endpoints

All endpoints prefixed with `/api/v1/`

### Health & Observability

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Basic health check | No |
| GET | `/readyz` | Kubernetes readiness probe | No |
| GET | `/metrics` | Prometheus metrics | No |

### Licensing

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/license/activate` | Activate license on device | 20/min |
| POST | `/license/refresh` | Refresh license token | 120/min |
| POST | `/license/verify` | Verify active license | Yes |
| POST | `/license/deactivate` | Remove device | Yes |

**Token Format:**
```
Base64(payload) + "." + Base64(Ed25519Signature)
```

### Payments

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/stripe/webhook` | Stripe event handler | 300/min |

**Stripe signature validation required** via `STRIPE_WEBHOOK_SECRET`

### Gateway

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1/agent/run` | AI task execution | Bearer token |

**Tasks:** `issue_intake`, `analysis`, `fix_proposal`

---

## 🛠️ Development Workflows

### Initial Setup

```bash
# 1. Clone and install
git clone https://github.com/MasterofMakros/obsidian-nextcloud-platform.git
cd obsidian-nextcloud-platform
pnpm install

# 2. Start infrastructure
docker compose up -d postgres redis

# 3. Generate Prisma client
pnpm --filter @onm/db generate

# 4. Run database migrations
pnpm --filter @onm/db db:push

# 5. Start services (3 terminals)
pnpm --filter api run dev      # Port 3011
pnpm --filter worker run dev   # Port 9110
pnpm --filter web run dev      # Port 3010
```

### Workspace Commands

**Root-level commands** (run across all workspaces):
```bash
pnpm dev            # Start all apps in dev mode
pnpm build          # Build all apps
pnpm test           # Run all tests
pnpm lint           # Lint all packages
```

**App-specific commands:**
```bash
# API
pnpm --filter api run dev      # tsx watch
pnpm --filter api run build    # tsc
pnpm --filter api run start    # node dist/index.js

# Web
pnpm --filter web run dev      # next dev -p 3010
pnpm --filter web run build    # next build
pnpm --filter web run e2e      # playwright test

# Worker
pnpm --filter worker run dev   # tsx watch
pnpm --filter worker run start # node dist/index.js

# Plugin
pnpm --filter plugin run dev   # tsc -w
pnpm --filter plugin run build # tsc

# Gateway
pnpm --filter gateway run dev  # tsx watch
```

### Database Workflows

```bash
# Generate Prisma client after schema changes
pnpm --filter @onm/db generate

# Create migration (development)
pnpm --filter @onm/db migrate:dev

# Deploy migrations (production)
pnpm --filter @onm/db migrate:deploy

# Push schema without migrations (prototyping)
pnpm --filter @onm/db db:push
```

---

## 🧪 Testing

### Test Strategy

| Layer | Framework | Command |
|-------|-----------|---------|
| **Unit/Integration** | Vitest 4.0.18 | `pnpm test` |
| **E2E** | Playwright 1.57.0 | `pnpm --filter web e2e` |
| **HTTP** | Supertest 7.2.2 | Integrated with Vitest |

### Running Tests

```bash
# All tests across all workspaces
pnpm test

# Specific service tests
pnpm --filter api run test
pnpm --filter worker run test
pnpm --filter web run test:e2e

# Watch mode (development)
pnpm --filter api run test:watch
```

### Test Files Location

```
apps/api/src/__tests__/
├── hardening.integration.test.ts   # Security, CORS, rate limiting
└── lib/__tests__/
    └── licensing.refresh.test.ts   # License logic

apps/worker/src/__tests__/
└── stripe.e2e.test.ts              # Stripe webhook processing

apps/web/e2e/
├── example.spec.ts                 # Playwright E2E
└── debug.spec.ts
```

### CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

**Steps:**
1. Install pnpm 9 + Node.js 20
2. Install dependencies
3. Install Playwright browsers
4. Generate Prisma client
5. **Lint** - `pnpm -r lint`
6. **Typecheck** - `pnpm -r run typecheck --if-present`
7. Start infrastructure (Docker Compose)
8. Wait for healthchecks (Postgres, Redis)
9. **Run tests** - `pnpm test`
10. **E2E tests** - Build web app, run Playwright

**Docker Build:** `.github/workflows/docker-build.yml`
- Builds API & Worker images
- Pushes to GHCR with short SHA tags
- Smoke tests container starts

---

## 📝 Key Conventions

### Naming Conventions

| Category | Convention | Examples |
|----------|-----------|----------|
| **Files** | kebab-case | `license.ts`, `stripe.ts` |
| **Components** | PascalCase | `SiteHeader.tsx`, `Container.tsx` |
| **Test Files** | `*.test.ts` or `*.spec.ts` | `hardening.integration.test.ts` |
| **Variables/Functions** | camelCase | `licenseKey`, `activateLicense()` |
| **Constants/Env** | UPPER_SNAKE_CASE | `DATABASE_URL`, `STRIPE_SECRET_KEY` |
| **Classes/Types** | PascalCase | `License`, `LicenseStatus` |

### File Organization

**API Routes:** One file per route group
- `routes/license.ts` - All license endpoints
- `routes/stripe.ts` - All Stripe endpoints
- `routes/health.ts` - All health/metrics endpoints

**Plugins:** Isolated concerns
- `plugins/cors.ts` - CORS configuration
- `plugins/rate-limit.ts` - Rate limiting policies
- `plugins/security-headers.ts` - Security headers

**Tests:** Co-located with source
- `src/__tests__/` - Integration tests
- `src/lib/__tests__/` - Unit tests for utilities

### Code Style

**TypeScript:**
- **Strict mode** enabled in all apps
- **No `any`** types - use `unknown` or proper types
- **Explicit return types** on public functions
- **Zod validation** for all API inputs/outputs

**React:**
- **CSS Modules** for component styles (no inline styles)
- **Functional components** only
- **Memoization** for expensive components (`React.memo`)
- **No template literal className** - use `clsx` library

**Imports:**
- **Named imports** over wildcard (better tree-shaking)
  ```typescript
  // Good
  import { sign, verify } from '@noble/ed25519';

  // Bad
  import * as ed from '@noble/ed25519';
  ```

### Environment Variables

**API/Worker:**
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
PORT=3011
LOG_LEVEL=info
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
LICENSE_PRIVATE_KEY=<base64-hex>
CORS_ALLOW_ORIGINS=https://example.com,http://localhost:3010
NODE_ENV=development|production
```

**Web:**
```bash
NEXT_PUBLIC_API_BASE=http://api:3011
```

**Gateway:**
```bash
PORT=8080
HOST=0.0.0.0
LOG_LEVEL=info
GATEWAY_BEARER_TOKEN=...
```

---

## 🔒 Security Guidelines

### Critical Security Patterns

1. **CORS:** Origin allowlist from `CORS_ALLOW_ORIGINS` env var
2. **Rate Limiting:** Per-route policies with Redis backing
3. **Security Headers:**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - Referrer-Policy: no-referrer
   - HSTS: max-age=15552000 (production only)

4. **Cryptography:**
   - Ed25519 signatures for licenses
   - Stripe webhook signature validation
   - Password hashing with sodium-native

5. **Input Validation:**
   - Zod schemas on all API inputs
   - Type-safe database queries (Prisma)

6. **Idempotency:**
   - Stripe webhook deduplication via `PaymentEvent.stripeId`
   - BullMQ job deduplication

### What NOT to Do

- ❌ Never commit `.env` files
- ❌ Never log sensitive data (license keys, tokens, passwords)
- ❌ Never skip webhook signature validation
- ❌ Never use `any` type for external inputs
- ❌ Never disable CORS in production
- ❌ Never expose internal errors to users
- ❌ Never use synchronous crypto operations in hot paths

### Secrets Management

**Redacted in logs:**
- Authorization headers
- Cookies
- License keys
- Tokens
- Stripe secrets

**Never in git:**
- `.env` files
- Private keys
- Stripe secrets
- Database credentials

---

## ⚡ Performance Guidelines

### Critical Performance Patterns

Reference: `PERFORMANCE_ANALYSIS.md` for detailed analysis

**Database:**
1. **Add indexes** on foreign keys and frequently queried fields
   ```prisma
   @@index([userId])
   @@index([status])
   @@index([userId, status])
   ```

2. **Use `upsert`** instead of find + conditional create/update
   ```typescript
   // Good
   await prisma.user.upsert({
     where: { email },
     update: { stripeCustomerId },
     create: { email, stripeCustomerId }
   });

   // Bad - N+1 queries
   let user = await prisma.user.findUnique({ where: { email } });
   if (!user) {
     user = await prisma.user.create({ data: { email } });
   }
   ```

3. **Use `select`** to fetch only needed fields
   ```typescript
   const license = await prisma.license.findFirst({
     where: { hashedKey },
     select: { id: true, status: true, deviceIdHashes: true }
   });
   ```

4. **Use transactions** for related operations
   ```typescript
   await prisma.$transaction(async (tx) => {
     const user = await tx.user.upsert({...});
     const license = await tx.license.upsert({...});
     return { user, license };
   });
   ```

**Data Structures:**
1. **Use `Set`** for lookups (O(1) vs O(n))
   ```typescript
   // Good
   const allowlistSet = new Set(allowlist);
   if (allowlistSet.has(origin)) { /* ... */ }

   // Bad - O(n) on every request
   if (allowlist.includes(origin)) { /* ... */ }
   ```

**React:**
1. **No inline styles** - use CSS Modules
   ```typescript
   // Good
   import styles from './page.module.css';
   <div className={styles.container}>

   // Bad - creates new object on every render
   <div style={{ padding: '2rem', display: 'flex' }}>
   ```

2. **Use `clsx`** for className composition
   ```typescript
   import clsx from 'clsx';
   <div className={clsx(styles.card, isActive && styles.active)}>
   ```

3. **Memoize expensive components**
   ```typescript
   export const SiteHeader = memo(function SiteHeader() {
     // component code
   });
   ```

**I/O Operations:**
1. **Use async file operations** (never `fs.*Sync`)
   ```typescript
   // Good
   await fs.promises.writeFile(path, content);

   // Bad - blocks event loop
   fs.writeFileSync(path, content);
   ```

2. **Event-driven over polling** when possible
   ```typescript
   // Good - event-driven
   queue.on('completed', updateMetrics);

   // Bad - polling every 10s
   setInterval(updateMetrics, 10000);
   ```

### Performance Anti-Patterns

See `PERFORMANCE_ANALYSIS.md` for full list of 42 identified issues.

**High-priority fixes:**
- Missing database indexes
- N+1 queries in webhook processor
- Array.includes() in hot paths (CORS, rate limiting)
- Inline styles in React components
- Synchronous file I/O

---

## 🚀 Deployment

### Docker Strategy

**Multi-stage builds** for all apps:
1. **Base:** `node:20-alpine` with pnpm via corepack
2. **Builder:** Install deps, generate Prisma client, build
3. **Runner:** Copy production deps + compiled output only

**Docker Compose Services:**
```yaml
services:
  traefik:    # Reverse proxy - ports 80, 8080
  postgres:   # Database - port 5432
  redis:      # Cache/queue - port 6379
  api:        # API server - port 3011
  worker:     # Background jobs - port 9110
  web:        # Frontend - port 3010
```

### Deployment Commands

```bash
# Build all images
docker compose -f infra/stage/docker-compose.stage.yml build

# Deploy to staging
docker compose -f infra/stage/docker-compose.stage.yml up -d

# Check status
docker compose -f infra/stage/docker-compose.stage.yml ps

# View logs
docker compose -f infra/stage/docker-compose.stage.yml logs -f api worker

# Rollback
docker compose -f infra/stage/docker-compose.stage.yml down
docker compose -f infra/stage/docker-compose.stage.yml up -d
```

### Health Checks

All services have health checks:
- **API:** `http://localhost:3011/health`
- **Web:** `http://localhost:3010/`
- **Postgres:** `pg_isready -U postgres`
- **Worker:** Prometheus metrics on port 9110

---

## 📊 Observability

### Prometheus Metrics

**API Metrics:**
```
onm_api_http_requests_total
onm_api_http_request_duration_seconds
onm_api_license_activations_total
onm_api_license_refreshes_total
onm_api_token_issue_duration_seconds
onm_api_stripe_webhooks_received_total
```

**Worker Metrics:**
```
onm_worker_jobs_processed_total
onm_worker_job_duration_seconds
onm_worker_queue_waiting_count
onm_worker_queue_active_count
onm_worker_queue_failed_count
```

**Access metrics:**
- API: `http://localhost:3011/metrics`
- Worker: `http://localhost:9110/metrics`

### Logging

**API/Gateway:** Pino structured logging
- JSON format
- Redacted: Authorization, cookies, license keys, tokens
- Levels: info, warn, error

**Worker:** Console logging
- Job lifecycle events
- Error tracking

---

## 📚 Documentation Map

| Document | Purpose |
|----------|---------|
| **README.md** | Quick start, architecture overview |
| **CLAUDE.md** | AI assistant guide (this file) |
| **PERFORMANCE_ANALYSIS.md** | 42 performance issues with fixes |
| **docs/DEPLOYMENT.md** | Infrastructure setup, rollback procedures |
| **docs/LICENSING.md** | Ed25519 protocol, offline verification |
| **docs/STRIPE_SETUP.md** | Stripe integration guide |
| **docs/STRIPE_LIVE_CHECKLIST.md** | Pre-launch checklist |
| **docs/OBSERVABILITY.md** | Metrics & logging setup |
| **docs/TESTING.md** | Test strategy, CI/CD |
| **docs/STYLEGUIDE.md** | Brand identity, UI design language |
| **docs/openapi-licensing-v1.yaml** | OpenAPI specification |

---

## 🤖 AI Assistant Guidelines

### When Modifying Code

1. **Always read files first** - Never propose changes to code you haven't read
2. **Use TodoWrite** - Track multi-step tasks proactively
3. **Run tests** - After any code changes, run relevant tests
4. **Check performance** - Reference `PERFORMANCE_ANALYSIS.md` for anti-patterns
5. **Validate security** - Ensure no sensitive data leaks, proper input validation
6. **Follow conventions** - Match existing file naming, code style, patterns
7. **Update documentation** - If changing APIs or behavior, update relevant docs

### When Adding Features

1. **Check existing patterns** - Follow established conventions
2. **Add tests** - Unit tests for logic, integration tests for APIs, E2E for flows
3. **Add metrics** - Instrument new operations for observability
4. **Add validation** - Zod schemas for all inputs
5. **Consider performance** - Use proper data structures, avoid N+1 queries
6. **Document** - Update relevant docs, add inline comments for complex logic

### When Fixing Bugs

1. **Reproduce first** - Understand the issue completely
2. **Write test** - Add test that fails with the bug
3. **Fix minimally** - Only change what's necessary
4. **Verify fix** - Ensure test passes
5. **Check regressions** - Run full test suite
6. **Document** - Add comment explaining the fix if non-obvious

### When Refactoring

1. **Have tests** - Ensure good test coverage before refactoring
2. **Refactor incrementally** - Small, safe changes
3. **Run tests frequently** - After each change
4. **Don't change behavior** - Refactoring should not change functionality
5. **Performance check** - Ensure no performance regressions

### Common Pitfalls to Avoid

1. **Over-engineering** - Keep solutions simple, don't add unnecessary abstractions
2. **Premature optimization** - Focus on correctness first, then optimize bottlenecks
3. **Inconsistent style** - Match existing code style exactly
4. **Missing error handling** - Always handle errors, but don't over-validate internal code
5. **Breaking changes** - Avoid backwards-incompatible changes without discussion
6. **Ignoring types** - Use proper TypeScript types, avoid `any`
7. **Skipping tests** - Every code change should have test coverage

### Useful Search Patterns

**Finding implementations:**
```bash
# Find all API routes
grep -r "fastify\.(get|post|put|delete)" apps/api/src/routes/

# Find all Prisma queries
grep -r "prisma\.\w+\.(findUnique|findFirst|findMany|create|update|upsert)" apps/

# Find all Zod schemas
grep -r "z\.object\|z\.string\|z\.number" apps/

# Find all metrics
grep -r "metrics\.\w+\.(inc|set|observe)" apps/
```

**Finding security concerns:**
```bash
# Find potential SQL injection
grep -r "\$queryRaw\|\$executeRaw" apps/

# Find console.log (should use structured logging)
grep -r "console\." apps/ --include="*.ts" --exclude="*.test.ts"

# Find synchronous file operations
grep -r "fs\.\w*Sync" apps/
```

### Branch and Commit Conventions

**Branch naming:**
- Feature: `feature/description`
- Fix: `fix/description`
- Docs: `docs/description`
- Refactor: `refactor/description`

**Commit messages:** Follow Conventional Commits
```
feat: add license revocation endpoint
fix: prevent race condition in webhook processing
docs: update API documentation for /license/refresh
refactor: extract license validation to utility
test: add E2E test for checkout flow
chore: update dependencies
```

**Commit message format:**
```
<type>: <subject>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`

---

## 🔍 Quick Reference

### Ports

| Service | Port | Purpose |
|---------|------|---------|
| API | 3011 | Fastify API server |
| Web | 3010 | Next.js frontend |
| Worker | 9110 | Prometheus metrics |
| Gateway | 8080 | AI Gateway (n8n) |
| Postgres | 5432 | Database |
| Redis | 6379 | Cache & queue |
| Traefik | 80, 8080 | Reverse proxy |

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Node.js | 20+ | Runtime |
| pnpm | 9.0.0 | Package manager |
| TypeScript | 5.0+ | Type safety |
| Next.js | 14.1.0 | Frontend framework |
| Fastify | 4.26+ | Backend framework |
| Prisma | 5.10.0 | ORM |
| BullMQ | 5.0.0 | Job queue |
| Stripe | 14.25.0 | Payments |
| Zod | 3.22+ | Validation |
| Playwright | 1.57.0 | E2E testing |
| Vitest | 4.0.18 | Unit testing |

### Environment Setup

```bash
# Required
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/obsidian_media
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
LICENSE_PRIVATE_KEY=<base64-ed25519-key>
CORS_ALLOW_ORIGINS=http://localhost:3010

# Optional
PORT=3011
LOG_LEVEL=info
NODE_ENV=development
```

### Common Tasks

```bash
# Start development
pnpm dev

# Run tests
pnpm test

# Build all
pnpm build

# Database migrations
pnpm --filter @onm/db generate
pnpm --filter @onm/db migrate:dev

# Lint & typecheck
pnpm -r lint
pnpm -r run typecheck --if-present

# E2E tests
pnpm --filter web e2e

# Docker deployment
docker compose -f infra/stage/docker-compose.stage.yml up -d
```

---

## 📞 Support

**Security Issues:** security@fentrea.ch
**Bug Reports:** GitHub Issues
**Feature Requests:** GitHub Discussions
**Documentation:** `/docs` directory

---

**Last Updated:** 2026-01-23
**Maintainer:** Fentrea GmbH
**License:** Proprietary (see `docs/legal/EULA.md`)
