# Deployment Guide

This project is designed to be deployed using **Docker Compose**.

## Prerequisites
- Docker Engine & Docker Compose
- Postgres URL (if external) or use container
- Redis URL (if external) or use container
- Stripe Secret Keys (Set in `.env`)

## Environment Variables
Create a `.env` file in the root:

```ini
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=obsidian_media
DATABASE_URL=postgresql://postgres:secure_password@postgres:5432/obsidian_media

# Redis
REDIS_URL=redis://redis:6379

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
PORT=3000
```

## Running with Docker Compose

```bash
# Build images
docker-compose -f infra/docker-compose.yml build

# Start services
docker-compose -f infra/docker-compose.yml up -d
```

## Scaling
The `api` service is stateless and can be scaled horizontally. The `worker` can also be scaled but ensure Redis handles the queue locking correctly (BullMQ handles this).
