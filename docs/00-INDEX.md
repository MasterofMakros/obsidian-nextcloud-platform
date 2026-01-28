# 🤖 AI Assistant Entry Point

> **Quick Start for AI Coding Systems**  
> **Version:** 1.0.0 | **Last Updated:** 2026-01-29

---

## 🎯 Project Identity (MUST KNOW)

```yaml
name: Obsidian Nextcloud Media Platform
version: 1.0.0-commercial
type: Privacy-first media sync platform
status: Production-Ready
philosophy: Offline-first, Swiss-engineered, zero phone-home
```

### Core Purpose
Bridge Obsidian (note-taking) and Nextcloud (private cloud) with **offline-first licensing** via Ed25519 cryptographic signatures.

### Critical Constraints
- ✅ No PII in logs/metrics
- ✅ Licenses work offline
- ✅ Zero external dependencies for core functionality
- ✅ All API endpoints rate-limited
- ✅ Docker-first deployment

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                        PORT     TECH              │
│  ├── Next.js Web App             3010     Next.js 16.1.5    │
│  └── Obsidian Plugin             -        TypeScript        │
├─────────────────────────────────────────────────────────────┤
│  BACKEND                                                  │
│  ├── Fastify API Server          3011     Fastify 5.7.1     │
│  ├── BullMQ Worker               9110     BullMQ 5.67.1     │
│  └── AI Gateway (n8n)            8081     Fastify           │
├─────────────────────────────────────────────────────────────┤
│  DATA LAYER                                               │
│  ├── PostgreSQL                  5432     16-alpine         │
│  └── Redis                       6379     7-alpine          │
└─────────────────────────────────────────────────────────────┘
```

### Request Flows

**License Activation:**
```
Plugin → POST /api/v1/license/activate → Validate → Sign (Ed25519) → Cache locally
```

**Stripe Webhook:**
```
Stripe → POST /stripe/webhook → Validate → Queue (Redis) → Worker → Database
```

---

## 📁 Project Structure

```
obsidian-nextcloud-platform/
├── 📦 apps/                          # Applications
│   ├── api/                         # Fastify API (Port 3011)
│   ├── web/                         # Next.js Frontend (Port 3010)
│   ├── worker/                      # BullMQ Processor (Port 9110)
│   ├── gateway/                     # AI Gateway (Port 8081)
│   └── plugin/                      # Obsidian Plugin
│
├── 📦 packages/                      # Shared Packages
│   ├── db/                          # Prisma Schema
│   ├── design-tokens/               # CSS Variables
│   └── config/                      # TypeScript Configs
│
├── 🔧 infra/                        # Infrastructure
│   ├── docker-compose.yml           # Development
│   └── stage/                       # Staging config
│
└── 📚 docs/                         # Documentation (You are here)
    ├── 00-INDEX.md                  # This file
    ├── ARCHITECTURE.md              # Detailed architecture
    ├── API-SPEC.md                  # OpenAPI specification
    ├── DATABASE.md                  # Schema documentation
    ├── DEPLOYMENT.md                # Deployment guide
    ├── TESTING.md                   # Testing strategy
    └── STYLEGUIDE.md                # UI/UX guidelines
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 20+ with pnpm
- Docker & Docker Compose

### 1. Clone & Install
```bash
git clone <repo>
cd obsidian-nextcloud-platform
pnpm install
```

### 2. Start Infrastructure
```bash
docker compose up -d postgres redis
```

### 3. Start Development (3 terminals)
```bash
# Terminal 1: API
pnpm --filter api run dev        # Port 3011

# Terminal 2: Worker
pnpm --filter worker run dev     # Port 9110

# Terminal 3: Web
pnpm --filter web run dev        # Port 3010
```

### 4. Verify
```bash
curl http://localhost:3011/health
curl http://localhost:3011/readyz
```

---

## 🔧 Common Tasks

### Database Operations
```bash
# Generate Prisma client
pnpm --filter @onm/db generate

# Run migrations
pnpm --filter @onm/db migrate:dev

# Push schema (dev only)
pnpm --filter @onm/db db:push
```

### Testing
```bash
# All tests
pnpm test

# Specific service
pnpm --filter api run test
pnpm --filter web run test:e2e

# Watch mode
pnpm --filter api run test:watch
```

### Lint & Typecheck
```bash
pnpm -r run lint
pnpm -r run typecheck --if-present
```

---

## 📝 Code Conventions

### Naming
```typescript
// Files: kebab-case
license-validator.ts

// Components: PascalCase
LicenseValidator.tsx

// Functions/Variables: camelCase
validateLicense()

// Constants: UPPER_SNAKE_CASE
MAX_DEVICE_COUNT

// Types/Classes: PascalCase
interface LicenseConfig {}
```

### Key Patterns

**API Routes:**
```typescript
// One file per route group
routes/license.ts    # All license endpoints
routes/stripe.ts     # All Stripe endpoints
```

**Validation:**
```typescript
// Zod for all inputs
const schema = z.object({
  licenseKey: z.string().min(10),
  deviceId: z.string().uuid()
});
```

**Database:**
```typescript
// Use transactions for related ops
await prisma.$transaction(async (tx) => {
  const user = await tx.user.upsert({...});
  const license = await tx.license.upsert({...});
});
```

**Error Handling:**
```typescript
// Never expose internal errors to users
if (error instanceof ValidationError) {
  return reply.code(400).send({ error: 'Invalid input' });
}
// Log full error internally
logger.error({ err: error }, 'Unexpected error');
return reply.code(500).send({ error: 'Internal error' });
```

---

## 🔐 Security Checklist

When modifying code, verify:

- [ ] No secrets in code (use env vars)
- [ ] No PII in logs (redact emails, keys)
- [ ] Zod validation on all inputs
- [ ] Rate limiting applied
- [ ] CORS allowlist enforced
- [ ] Webhook signatures validated

---

## 🐛 Debugging

### Service Logs
```bash
# View API logs
docker compose logs api --tail 100

# View worker logs
docker compose logs worker --tail 100

# View all
docker compose logs -f
```

### Database Queries
```bash
# Connect to Postgres
docker compose exec postgres psql -U postgres -d obsidian_media

# Check Redis
docker compose exec redis redis-cli
```

### Health Checks
```bash
curl http://localhost:3011/health
curl http://localhost:3011/readyz
curl http://localhost:9110/metrics
```

---

## 📚 Documentation Map

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **00-INDEX.md** | You are here | Always start here |
| **ARCHITECTURE.md** | System design | Understanding structure |
| **API-SPEC.md** | OpenAPI spec | API changes |
| **DATABASE.md** | Schema docs | DB changes |
| **DEPLOYMENT.md** | Deploy guide | Deployment tasks |
| **TESTING.md** | Test strategy | Writing tests |
| **STYLEGUIDE.md** | UI guidelines | Frontend work |

---

## 🎯 Decision Tree for AI

```
What does the user want?
│
├── Fix a bug?
│   ├── Read: ARCHITECTURE.md (relevant section)
│   ├── Read: TESTING.md (how to test the fix)
│   └── Write: Test first, then fix
│
├── Add a feature?
│   ├── Read: API-SPEC.md (if API-related)
│   ├── Read: DATABASE.md (if DB changes needed)
│   ├── Read: TESTING.md (test strategy)
│   └── Plan: Design → Tests → Implementation
│
├── Refactor code?
│   ├── Read: This file (conventions)
│   ├── Check: PERFORMANCE_ANALYSIS.md
│   └── Verify: All tests still pass
│
├── Deploy?
│   └── Read: DEPLOYMENT.md
│
└── Other?
    └── Ask for clarification
```

---

## ⚡ Performance Notes

From PERFORMANCE_ANALYSIS.md:

**High-Impact:**
- Use database indexes on foreign keys
- Use `Set` for lookups (O(1))
- Use async file operations (never `fs.*Sync`)
- Memoize expensive React components

**Anti-Patterns to Avoid:**
- Array `.includes()` in hot paths
- N+1 database queries
- Inline styles in React
- Synchronous I/O

---

## 🔄 CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

**Steps:**
1. Install pnpm 9 + Node.js 20
2. Install dependencies
3. Generate Prisma client
4. Lint check
5. Typecheck
6. Run tests
7. E2E tests (Playwright)

**Required Checks:**
- [ ] All tests pass
- [ ] Coverage thresholds met
- [ ] No linting errors
- [ ] E2E tests pass

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| **Security Issues** | security@fentrea.ch |
| **Bug Reports** | GitHub Issues |
| **API Docs** | http://localhost:3011/docs |
| **Metrics** | http://localhost:3011/metrics |

---

## ✅ Definition of Done

For any AI-generated change:

- [ ] Code follows conventions (naming, structure)
- [ ] Tests written and passing
- [ ] Lint & typecheck pass
- [ ] No secrets or PII exposed
- [ ] Documentation updated (if needed)
- [ ] Breaking changes noted

---

<div align="center">

**Built with ❤️ and ☕ by Fentrea GmbH** 🇨🇭

*Swiss engineering. Privacy first. Always.*

</div>
