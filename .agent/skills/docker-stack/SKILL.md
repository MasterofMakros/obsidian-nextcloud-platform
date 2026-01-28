---
name: docker-stack
description: Docker Compose stack management. Use when user mentions 'docker', 'container', 'postgres', 'redis'.
---

# Docker Stack

## Commands

| Action | Command |
|--------|---------|
| Start all | `docker compose -f infra/docker-compose.yml up -d` |
| Start minimal | `docker compose -f infra/docker-compose.yml up -d postgres redis` |
| Stop | `docker compose -f infra/docker-compose.yml down` |
| Reset (delete data) | `docker compose -f infra/docker-compose.yml down -v` |
| Logs | `docker compose -f infra/docker-compose.yml logs -f [SERVICE]` |
| Status | `docker ps` |

## Services

| Service | Port | Purpose |
|---------|------|---------|
| postgres | 5433 | Database |
| redis | 6380 | Cache |
| n8n | 5678 | Workflows |
| gateway | 8080 | AI API |

## Errors

| Error | Fix |
|-------|-----|
| Port in use | `docker compose down` first |
| Unhealthy | `docker logs onm-[service]` |
| DB not found | `prisma migrate deploy` |

## Environment (infra/.env)

```env
POSTGRES_PASSWORD=postgres
N8N_PASSWORD=localdev123
GATEWAY_BEARER_TOKEN=local-test-token
```
