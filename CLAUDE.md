# CLAUDE.md - AI Assistant Guide

**Last Updated:** 2026-01-29
**Project:** Obsidian Nextcloud Media Platform
**Version:** 1.0.0

---

## 🎯 Quick Reference

This is a **production-ready, privacy-first media sync platform** bridging Obsidian and Nextcloud with offline-first Ed25519 licensing.

### Core Philosophy
- **Privacy-first:** User data stays on their devices
- **Offline-capable:** Licenses verify locally without internet
- **Production-ready:** Security, observability, and testing built-in
- **Swiss-engineered:** Calm, technical, no marketing fluff

### Critical Constraints
- ✅ No PII in logs/metrics
- ✅ Licenses work offline
- ✅ Zero external dependencies for core functionality
- ✅ All API endpoints rate-limited
- ✅ Docker-first deployment

---

## 🏗️ Architecture Overview

```
Frontend Layer:
├── Next.js Web App (Port 3010) - Marketing & dashboard
└── Obsidian Plugin - Offline license verification

API Gateway:
└── Traefik Reverse Proxy - HTTPS/TLS termination

Backend Services:
├── Fastify API Server (Port 3011) - License management
├── BullMQ Worker (Port 9110) - Async job processing
└── AI Gateway (Port 8081) - n8n integration

Data Layer:
├── PostgreSQL 15+ (Port 5432)
└── Redis 7+ (Port 6379)
```

### Key Data Flows

**License Activation:**
```
Plugin → POST /api/v1/license/activate → API validates → Signs with Ed25519 → Plugin verifies offline
```

**Stripe Webhook:**
```
Stripe → POST /stripe/webhook → API validates → Queue to Redis → Worker processes → Database
```

---

## 📁 Project Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete structure.

```
apps/
├── api/              # Fastify API (Port 3011)
├── web/              # Next.js Frontend (Port 3010)
├── worker/           # BullMQ Worker (Port 9110)
├── gateway/          # AI Gateway (Port 8081)
└── plugin/           # Obsidian Plugin

packages/
├── db/               # Prisma schema
├── design-tokens/    # Shared CSS variables
└── config/           # TypeScript configs
```

---

## 🚀 Common Tasks

### Development
```bash
# 1. Start infrastructure
docker compose up -d postgres redis

# 2. Generate Prisma client
pnpm --filter @onm/db generate

# 3. Start services (3 terminals)
pnpm --filter api run dev      # Port 3011
pnpm --filter worker run dev   # Port 9110
pnpm --filter web run dev      # Port 3010
```

### Database
```bash
pnpm --filter @onm/db generate
pnpm --filter @onm/db migrate:dev
pnpm --filter @onm/db db:push
```

### Testing
```bash
pnpm test                      # All tests
pnpm --filter api run test     # API only
pnpm --filter web run test:e2e # E2E tests
```

### Quality Checks
```bash
pnpm -r run lint
pnpm -r run typecheck --if-present
```

---

## 📝 Code Conventions

See [docs/COLE_MEDIN_STYLE.md](docs/COLE_MEDIN_STYLE.md) for complete style guide.

### Quick Reference

**Naming:**
- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

**File Size:**
- Maximum 250 lines per file
- Split when exceeding limit

**TypeScript:**
- No `any` types
- Explicit return types on public functions
- Use Zod for runtime validation

**Testing:**
- Tests before implementation
- 80%+ coverage for api/worker
- Co-located tests: `*.test.ts`

---

## 🔐 Security Guidelines

### Critical Patterns

1. **CORS:** Origin allowlist from `CORS_ALLOW_ORIGINS` env var
2. **Rate Limiting:** Per-route policies with Redis
3. **Security Headers:** nosniff, DENY frames, no-referrer
4. **Cryptography:** Ed25519 signatures, Stripe webhook validation
5. **Input Validation:** Zod schemas on all API inputs
6. **Idempotency:** Stripe webhook deduplication

### What NOT to Do

- ❌ Never commit `.env` files
- ❌ Never log sensitive data (license keys, tokens)
- ❌ Never skip webhook signature validation
- ❌ Never use `any` type for external inputs
- ❌ Never disable CORS in production
- ❌ Never expose internal errors to users

---

## ⚡ Performance Guidelines

See [docs/PERFORMANCE_ANALYSIS.md](docs/PERFORMANCE_ANALYSIS.md) for detailed analysis.

### High-Priority Patterns

**Database:**
```typescript
// Use indexes
@@index([userId])

// Use upsert (not find + create)
await prisma.user.upsert({ where: { email }, update: {}, create: {} });

// Select only needed fields
select: { id: true, status: true }
```

**JavaScript:**
```typescript
// Use Set for lookups (O(1))
const allowlistSet = new Set(allowlist);

// Async file operations (never fs.*Sync)
await fs.promises.readFile(path);

// CSS Modules (no inline styles)
<div className={styles.container}>
```

---

## 🔌 API Endpoints

See [docs/API-SPEC.md](docs/API-SPEC.md) for complete specification.

Quick reference (all prefixed with `/api/v1/`):

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/health` | Health check | 1000/min |
| GET | `/readyz` | Readiness probe | 1000/min |
| GET | `/metrics` | Prometheus metrics | 100/min |
| POST | `/license/activate` | Activate license | 20/min |
| POST | `/license/refresh` | Refresh token | 120/min |
| POST | `/stripe/webhook` | Stripe events | 300/min |

---

## 🗄️ Database Schema

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete schema.

Core models:
```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  licenses  License[]
}

model License {
  id              String        @id @default(uuid())
  publicKey       String        @unique
  userId          String
  status          LicenseStatus @default(ACTIVE)
  deviceIdHashes  String[]
  
  @@index([userId])
  @@index([status])
}
```

---

## 📚 Documentation Map

| Document | Purpose |
|----------|---------|
| **[00-INDEX.md](docs/00-INDEX.md)** | AI Assistant Entry Point |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System architecture & data flows |
| **[API-SPEC.md](docs/API-SPEC.md)** | Complete API specification |
| **[COLE_MEDIN_STYLE.md](docs/COLE_MEDIN_STYLE.md)** | Coding standards |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | Deployment guide |
| **[LICENSING.md](docs/LICENSING.md)** | License system documentation |
| **[STRIPE_SETUP.md](docs/STRIPE_SETUP.md)** | Stripe integration |
| **[OBSERVABILITY.md](docs/OBSERVABILITY.md)** | Metrics & logging |
| **[TESTING.md](docs/TESTING.md)** | Testing strategy |
| **[PERFORMANCE_ANALYSIS.md](docs/PERFORMANCE_ANALYSIS.md)** | Performance optimization |

---

## 🐛 Debugging

### Service Logs
```bash
docker compose logs api --tail 100
docker compose logs worker --tail 100
```

### Health Checks
```bash
curl http://localhost:3011/health
curl http://localhost:3011/readyz
curl http://localhost:9110/metrics
```

### Database
```bash
docker compose exec postgres psql -U postgres -d obsidian_media
docker compose exec redis redis-cli
```

---

## ✅ Definition of Done

For any AI-generated change:

- [ ] Code follows conventions (see COLE_MEDIN_STYLE.md)
- [ ] Tests written and passing
- [ ] Lint & typecheck pass
- [ ] No secrets or PII exposed
- [ ] Documentation updated (if needed)
- [ ] Breaking changes noted

---

## 📞 Support

- **Security Issues:** security@fentrea.ch
- **Bug Reports:** GitHub Issues
- **API Docs:** http://localhost:3011/docs
- **Metrics:** http://localhost:3011/metrics

---

**Last Updated:** 2026-01-29
**Maintainer:** Fentrea GmbH
