# 🚀 Obsidian Nextcloud Media Platform

> **Privacy-first media sync that actually respects your data.** Built with Swiss precision, powered by modern tech.

Ever wanted to seamlessly sync and stream media between **Obsidian** and **Nextcloud** without sacrificing your privacy? Yeah, we thought so too. That's why we built this.

This isn't just another SaaS platform—it's a full-stack, production-ready solution with **offline-first licensing**, **Ed25519 cryptographic signatures**, and **zero "phone home" requirements**. Your data stays yours. Period.

---

## ✨ What Makes This Special?

- **🔒 Offline-First Licensing** — Ed25519 signatures verified locally. No internet needed for daily use. Your license works even when you're off the grid.
- **🇨🇭 Swiss-Engineered Privacy** — Your media stays on YOUR devices. We can't access it even if we wanted to.
- **💳 Stripe Integration Done Right** — Subscription management with automatic license provisioning. Webhooks are idempotent—no duplicate charges, ever.
- **🛡️ Production-Ready Security** — Rate limiting, CORS, security headers, Zod validation. We've handled the hard stuff.
- **📊 Full Observability** — Prometheus metrics, structured JSON logging, health checks. Monitor everything.
- **⚡ Modern Tech Stack** — Next.js 14, Fastify, TypeScript, Prisma, BullMQ. Built for speed and reliability.

---

## 🎯 Quick Start (5 Minutes to Running)

### Prerequisites

Make sure you have these installed:
- **Node.js 18+** with pnpm (`npm install -g pnpm`)
- **Docker** and **Docker Compose** (we'll handle PostgreSQL and Redis for you)

### Let's Get You Up and Running

**1. Clone & Install Dependencies**

```bash
git clone https://github.com/MasterofMakros/obsidian-nextcloud-platform.git
cd obsidian-nextcloud-platform
pnpm install
```

**2. Start Your Infrastructure**

```bash
docker compose up -d postgres redis
```

This spins up PostgreSQL and Redis in the background. Easy.

**3. Start Development Services**

Open three terminals (or use tmux if you're fancy):

```bash
# Terminal 1: API Server
pnpm --filter api run dev
# 🎯 Running at http://localhost:3011
# 📖 API docs available at /docs

# Terminal 2: Background Worker
pnpm --filter worker run dev
# 📊 Metrics at http://localhost:9110/metrics

# Terminal 3: Web Frontend
pnpm --filter web run dev
# 🌐 Running at http://localhost:3010
```

**4. Open Your Browser**

Navigate to **http://localhost:3010** and you're live! 🎉

> 💡 **Pro Tip:** Check out the API documentation at `http://localhost:3011/docs` to see all available endpoints.

---

## 🏗️ Architecture Overview

Here's how everything fits together:

```mermaid
graph TB
    subgraph "Frontend Layer"
        Web[Next.js Web App<br/>Port 3010]
        Plugin[Obsidian Plugin<br/>Ed25519 Offline Verification]
    end

    subgraph "API Gateway Layer"
        Traefik[Traefik Reverse Proxy<br/>HTTPS/TLS Termination]
    end

    subgraph "Backend Services"
        API[Fastify API Server<br/>Port 3011<br/>License Management]
        Worker[BullMQ Worker<br/>Port 9110<br/>Async Job Processing]
        Gateway[AI Gateway<br/>Port 8081<br/>n8n Integration]
    end

    subgraph "Data Layer"
        Postgres[(PostgreSQL 15+<br/>User & License Data)]
        Redis[(Redis 7+<br/>Job Queue & Cache)]
    end

    subgraph "External Services"
        Stripe[Stripe<br/>Payment Processing]
    end

    Web -->|HTTP/JSON| Traefik
    Plugin -->|License Verify| API
    Traefik -->|Route| API
    Traefik -->|Route| Gateway
    API -->|Read/Write| Postgres
    API -->|Queue Jobs| Redis
    Worker -->|Process Jobs| Redis
    Worker -->|Update Status| Postgres
    Stripe -->|Webhooks| API
    API -->|Enqueue Payment Events| Redis
    Worker -->|Process Webhooks| Stripe

    style Web fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style API fill:#68a063,stroke:#333,stroke-width:2px,color:#fff
    style Worker fill:#f39c12,stroke:#333,stroke-width:2px,color:#000
    style Postgres fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    style Redis fill:#dc382d,stroke:#333,stroke-width:2px,color:#fff
    style Stripe fill:#635bff,stroke:#333,stroke-width:2px,color:#fff
```

### 🔄 Request Flow Examples

**License Activation Flow:**
1. User clicks "Activate License" in Obsidian plugin
2. Plugin sends request to API Server (`POST /api/v1/license/activate`)
3. API validates license, checks device limits, stores device hash
4. API signs response with Ed25519 private key
5. Plugin verifies signature offline, caches license locally

**Stripe Webhook Flow:**
1. Stripe sends webhook event (e.g., `checkout.session.completed`)
2. API validates webhook signature, enqueues job to Redis
3. BullMQ Worker picks up job, processes idempotently
4. Worker creates/updates User and License in PostgreSQL
5. Metrics updated, job marked complete

---

## 🛠️ Tech Stack (The Good Stuff)

| Layer | Technology | Why We Chose It |
|-------|------------|-----------------|
| **Web Frontend** | Next.js 14 + React 18 | App Router for modern routing, React Server Components for performance |
| **Styling** | CSS Modules | Component-scoped styles, no runtime overhead |
| **API Backend** | Fastify + TypeScript | 2x faster than Express, native TypeScript support |
| **Validation** | Zod | Runtime type safety with great DX |
| **Background Jobs** | BullMQ + Redis | Reliable job queue with retry logic |
| **Database** | PostgreSQL 15 + Prisma | Robust relational DB with type-safe ORM |
| **Authentication** | Ed25519 Signatures | Offline verification, no server roundtrips |
| **Payments** | Stripe Checkout | Industry standard, amazing developer experience |
| **Observability** | Prometheus + Pino | Metrics + structured logging for production |
| **Infrastructure** | Docker + Traefik | Containerized services with automatic HTTPS |

---

## 📁 Project Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete project structure and architecture documentation.

Quick overview:
```
apps/          # Applications (api, web, worker, gateway, plugin)
packages/      # Shared packages (db, design-tokens, config)
infra/         # Docker & deployment configs
docs/          # Documentation
tests/         # Integration & E2E tests
```

---

## 🔌 API Endpoints

See [docs/API-SPEC.md](docs/API-SPEC.md) for complete API documentation with request/response examples.

Quick reference:
- `GET /health` - Health check
- `GET /readyz` - Readiness probe
- `GET /metrics` - Prometheus metrics
- `POST /license/activate` - Activate license
- `POST /license/verify` - Verify license
- `POST /stripe/webhook` - Stripe webhooks

> 📖 **Full API Specification:** See [docs/API-SPEC.md](docs/API-SPEC.md) or [docs/openapi-licensing-v1.yaml](docs/openapi-licensing-v1.yaml) for OpenAPI spec.

---

## 🧪 Testing

We've got you covered with comprehensive tests:

```bash
# Run all tests across all workspaces
pnpm test

# Test specific services
pnpm --filter api run test         # API unit tests
pnpm --filter worker run test      # Worker unit tests
pnpm --filter web run test:e2e     # E2E tests with Playwright

# Watch mode for development
pnpm --filter api run test:watch
```

> 💡 **Pro Tip:** E2E tests require the infrastructure to be running. Start with `docker compose up -d` first.

---

## 🔄 CI/CD Workflows

We use GitHub Actions for continuous integration and deployment:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** | Push, PR | Lint & Typecheck |
| **Deploy** | Push | Docker Build & Push to GHCR |
| **E2E Tests** | PR, Manual | End-to-end tests with Playwright |
| **Integration Tests** | Daily, Manual | Full test suite with Docker |

All workflows are optimized to avoid disk space issues on GitHub Actions runners.

---

## 🚀 Deployment

### Docker (Recommended)

**Build All Images:**

```bash
docker compose -f infra/stage/docker-compose.stage.yml build
```

**Deploy to Staging:**

```bash
docker compose -f infra/stage/docker-compose.stage.yml up -d
```

**Check Everything's Running:**

```bash
docker compose -f infra/stage/docker-compose.stage.yml ps
```

### Environment Variables

Copy `.env.example` files in each app directory and configure these critical variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `ED25519_PRIVATE_KEY` | License signing key (base64) | Generate with `openssl` |
| `CORS_ALLOWLIST` | Allowed origins for CORS | `http://localhost:3010,https://yourdomain.com` |

> ⚠️ **Security Warning:** Never commit `.env` files to version control. Use environment-specific configuration management in production.

---

## 📚 Documentation

We've documented everything you need:

| Document | What You'll Learn |
|----------|-------------------|
| **[00-INDEX.md](docs/00-INDEX.md)** | AI Assistant Entry Point - Start here! |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Complete system architecture and data flows |
| **[API-SPEC.md](docs/API-SPEC.md)** | Full API specification with examples |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | Infrastructure setup, Docker configs, rollback procedures |
| **[LICENSING.md](docs/LICENSING.md)** | Ed25519 cryptographic protocol, offline verification |
| **[STRIPE_SETUP.md](docs/STRIPE_SETUP.md)** | Stripe integration guide, webhook setup |
| **[OBSERVABILITY.md](docs/OBSERVABILITY.md)** | Prometheus metrics, structured logging setup |
| **[TESTING.md](docs/TESTING.md)** | Test strategy, writing tests, CI/CD integration |
| **[PERFORMANCE_ANALYSIS.md](docs/PERFORMANCE_ANALYSIS.md)** | Performance anti-patterns, optimization guide |
| **[COLE_MEDIN_STYLE.md](docs/COLE_MEDIN_STYLE.md)** | Coding standards and best practices |

---

## 🤝 Contributing

We love contributions! Here's how to get started:

1. **Fork the repo** and create your feature branch
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

2. **Make your changes** and ensure tests pass
   ```bash
   pnpm test
   ```

3. **Commit with conventional commits**
   ```bash
   git commit -m 'feat: add amazing new feature'
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

4. **Push and open a Pull Request**
   ```bash
   git push origin feature/amazing-new-feature
   ```

> 💡 **Pro Tip:** Check out open issues labeled `good first issue` if you're new to the project!

---

## 🔒 Security

Found a security vulnerability? **Please DO NOT open a public issue.**

Instead, email us at **security@fentrea.ch** with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

We'll respond within 48 hours and work with you on a fix.

---

## 📄 License

**Proprietary Software** — See [EULA](docs/legal/EULA.md) for terms and conditions.

This is commercial software with offline-first licensing. Respect the license terms.

---

## 🙏 Acknowledgments

Built with these amazing open-source projects:
- [Next.js](https://nextjs.org/) — The React framework for production
- [Fastify](https://fastify.dev/) — Fast and low overhead web framework
- [Prisma](https://www.prisma.io/) — Next-generation ORM
- [BullMQ](https://docs.bullmq.io/) — Premium queue package for handling distributed jobs
- [Stripe](https://stripe.com/) — Payment infrastructure for the internet
- [@noble/ed25519](https://github.com/paulmillr/noble-ed25519) — Audited Ed25519 implementation

---

## 💬 Community & Support

- 📧 **Email:** support@fentrea.ch
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/MasterofMakros/obsidian-nextcloud-platform/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/MasterofMakros/obsidian-nextcloud-platform/discussions)

---

<div align="center">

**Built with ❤️ and ☕ by [Fentrea GmbH](https://fentrea.ch)** 🇨🇭

*Swiss engineering. Privacy first. Always.*

</div>
