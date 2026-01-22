# Obsidian Nextcloud Media

> **Swiss-engineered, privacy-first media sync for Obsidian and Nextcloud.**

A premium solution for seamlessly syncing and streaming media between **Obsidian** and **Nextcloud**. Offline-first architecture with Ed25519 cryptographic licensing—your data stays yours, no "phone home" required.

## Prerequisites

- **Node.js 18+** with pnpm package manager
- **Docker** and **Docker Compose** (for local infrastructure)
- **PostgreSQL 15+** (or use Docker)
- **Redis 7+** (or use Docker)

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/MasterofMakros/obsidian-nextcloud-platform.git
cd obsidian-nextcloud-platform
pnpm install
```

### 2. Start Infrastructure

```bash
docker compose up -d postgres redis
```

### 3. Start Development Services (separate terminals)

```bash
# Terminal 1: API Server
pnpm --filter api run dev
# Runs at http://localhost:3011 (API docs at /docs)

# Terminal 2: Worker
pnpm --filter worker run dev
# Metrics at http://localhost:9110/metrics

# Terminal 3: Web Frontend
pnpm --filter web run dev
# Runs at http://localhost:3010
```

### 4. Open the App

Navigate to **http://localhost:3010** in your browser. You're ready to go!

## Architecture

```
┌─────────────────┐     HTTP/JSON      ┌─────────────────┐
│   Next.js Web   │ ◄────────────────► │  Fastify API    │
│   Port 3010     │                    │   Port 3011     │
└─────────────────┘                    └────────┬────────┘
                                                │
                          ┌─────────────────────┼─────────────────────┐
                          │                     │                     │
                 ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
                 │   PostgreSQL    │   │     Redis       │   │  BullMQ Worker  │
                 │   Licenses DB   │   │   Job Queue     │   │   Port 9110     │
                 └─────────────────┘   └─────────────────┘   └─────────────────┘
                                                                      │
                                                             ┌────────▼────────┐
                                                             │     Stripe      │
                                                             │    Webhooks     │
                                                             └─────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Web Frontend | Next.js 14, React 18, CSS Modules |
| API Backend | Fastify, TypeScript, Zod validation |
| Worker | BullMQ, Redis, idempotent processing |
| Database | PostgreSQL 15, Drizzle ORM |
| Auth | Ed25519 cryptographic signatures |
| Payments | Stripe Checkout + Webhooks |
| Observability | Prometheus metrics, structured logging |

### Project Structure

```
obsidian-nextcloud-platform/
├── apps/
│   ├── api/                  # Fastify backend (license API)
│   │   ├── src/
│   │   │   ├── index.ts      # Server entry point
│   │   │   ├── routes/       # API endpoints
│   │   │   └── plugins/      # Fastify plugins
│   │   └── package.json
│   ├── web/                  # Next.js frontend
│   │   ├── app/              # App Router pages
│   │   ├── components/       # Shared UI components
│   │   └── package.json
│   ├── worker/               # BullMQ job processor
│   │   ├── src/
│   │   │   ├── index.ts      # Worker entry
│   │   │   └── handlers/     # Stripe webhook handlers
│   │   └── package.json
│   ├── plugin/               # Obsidian plugin
│   │   └── src/              # Plugin source
│   └── gateway/              # AI Gateway (n8n integration)
├── packages/
│   ├── db/                   # Drizzle schema & migrations
│   ├── design-tokens/        # Shared CSS variables
│   └── config/               # Shared TypeScript config
├── infra/
│   └── stage/                # Docker Compose staging
├── docs/                     # Documentation
└── README.md
```

## Features

- **Offline-First Licensing** — Ed25519 signatures verified locally, no internet needed for daily use
- **Privacy-First Design** — Your media stays on your devices, Swiss-engineered
- **Stripe Integration** — Subscription management with automatic license provisioning
- **Idempotent Processing** — Webhook events processed exactly once, guaranteed
- **Rate Limiting** — API protected with intelligent rate limiting and CORS
- **Prometheus Metrics** — Full observability with `/metrics` endpoint
- **Structured Logging** — JSON logs ready for your log aggregation system

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/readyz` | Kubernetes readiness probe |
| GET | `/metrics` | Prometheus metrics |
| POST | `/api/v1/license/activate` | Activate license on device |
| POST | `/api/v1/license/verify` | Verify active license |
| POST | `/api/v1/license/deactivate` | Deactivate device |
| POST | `/api/v1/stripe/webhook` | Stripe event handler |

Full API specification available in [docs/openapi-licensing-v1.yaml](docs/openapi-licensing-v1.yaml).

## Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Infrastructure setup, runbooks, rollbacks |
| [LICENSING.md](docs/LICENSING.md) | Ed25519 protocol specification |
| [STRIPE_SETUP.md](docs/STRIPE_SETUP.md) | Stripe configuration guide |
| [STRIPE_LIVE_CHECKLIST.md](docs/STRIPE_LIVE_CHECKLIST.md) | Go-live checklist for payments |
| [OBSERVABILITY.md](docs/OBSERVABILITY.md) | Metrics and logging setup |
| [TESTING.md](docs/TESTING.md) | Test strategy and commands |

## Testing

```bash
# Run all tests
pnpm test

# Run specific workspace tests
pnpm --filter api run test
pnpm --filter worker run test

# Run E2E tests
pnpm --filter web run test:e2e
```

## Deployment

### Docker (Recommended)

```bash
# Build all images
docker compose -f infra/stage/docker-compose.stage.yml build

# Deploy to staging
docker compose -f infra/stage/docker-compose.stage.yml up -d
```

### Environment Variables

Copy `.env.example` files in each app directory and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `ED25519_PRIVATE_KEY` | License signing key (base64) |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`pnpm test`)
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

Proprietary. See [EULA](docs/legal/EULA.md) for details.

---

**Built with ❤️ by [Fentrea GmbH](https://fentrea.ch)** 🇨🇭
