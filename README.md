# Obsidian Nextcloud Media Platform

> Privacy-first media sync with offline Ed25519 licensing. Production-ready architecture.

---

## Quick Start

```bash
git clone https://github.com/MasterofMakros/obsidian-nextcloud-platform.git
cd obsidian-nextcloud-platform
pnpm install
docker compose up -d postgres redis
pnpm --filter api run dev      # Port 3011
pnpm --filter worker run dev   # Port 9110
pnpm --filter web run dev      # Port 3010
```

---

## Architecture

```
Frontend Layer:
├── Next.js 14 (Port 3010)     # Web dashboard
└── Obsidian Plugin            # Offline license verification

Backend Services:
├── Fastify API (Port 3011)    # License management
├── BullMQ Worker (Port 9110)  # Async job processing
└── AI Gateway (Port 8081)     # n8n integration

Data Layer:
├── PostgreSQL 15+ (Port 5432) # User & license data
└── Redis 7+ (Port 6379)       # Job queue & cache
```

---

## Project Structure

```
apps/
├── api/                 # Fastify API
│   ├── src/routes/      # API endpoints (max 250 lines/file)
│   ├── src/plugins/     # Fastify plugins
│   └── src/lib/         # Business logic
├── web/                 # Next.js 14
│   ├── app/             # App Router
│   ├── components/      # React components
│   └── e2e/             # Playwright tests
├── worker/              # BullMQ job processor
├── gateway/             # AI/n8n integration
└── plugin/              # Obsidian plugin

packages/
├── db/                  # Prisma schema & client
├── design-tokens/       # Shared CSS variables
└── config/              # TypeScript configs

infra/
├── docker-compose.yml   # Local development
└── stage/               # Staging deployment
```

---

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

### Type Safety

```typescript
// No 'any' allowed - use explicit types
async function getUser(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

// Zod for runtime validation
const ActivateSchema = z.object({
  licenseKey: z.string().min(10),
  deviceId: z.string().uuid()
});
```

---

## Testing

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm --filter api run test         # API tests
pnpm --filter worker run test      # Worker tests
pnpm --filter web run test:e2e     # E2E tests

# Check coverage
pnpm test:coverage
```

**Coverage Requirements:**
- API/Worker: 80% statements, 75% branches
- Database: 70% statements
- Web: 60% statements

---

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI | Push, PR | Lint & Typecheck |
| Deploy | Push | Docker build & push to GHCR |
| E2E Tests | PR, Manual | Playwright E2E tests |
| Integration | Daily, Manual | Full test suite with Docker |

---

## Verification Commands

```bash
# Code quality
pnpm -r run lint
pnpm -r run typecheck

# Check file sizes
find apps/ -name "*.ts" | xargs wc -l | awk '$1 > 250'

# Security scan
pnpm audit
```

---

## Environment Variables

Copy `.env.example` in each app directory:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `REDIS_URL` | Yes | Redis connection |
| `STRIPE_SECRET_KEY` | Yes | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret |
| `ED25519_PRIVATE_KEY` | Yes | License signing key |

---

## Documentation

| Document | Content |
|----------|---------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture & data flows |
| [API-SPEC.md](docs/API-SPEC.md) | API endpoints & OpenAPI spec |
| [COLE_MEDIN_STYLE.md](docs/COLE_MEDIN_STYLE.md) | Coding standards & best practices |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker deployment guide |
| [LICENSING.md](docs/LICENSING.md) | Ed25519 protocol & offline verification |
| [TESTING.md](docs/TESTING.md) | Test strategy & examples |

---

## License

Proprietary Software — See [EULA](docs/legal/EULA.md)

---

<div align="center">

**Built with precision by Fentrea GmbH** 🇨🇭

</div>
