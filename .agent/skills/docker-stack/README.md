# Docker Stack Skill

> Manage the Docker Compose stack for local development

## Quick Start

```
Aktiviere docker-stack
```

## Commands

| Action | Command |
|--------|---------|
| **Start All** | `docker compose -f infra/docker-compose.yml up -d` |
| **Stop All** | `docker compose -f infra/docker-compose.yml down` |
| **Restart** | `docker compose -f infra/docker-compose.yml restart` |
| **Logs** | `docker compose -f infra/docker-compose.yml logs -f` |
| **Reset DB** | `docker compose -f infra/docker-compose.yml down -v` |

## Services

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5433 | PostgreSQL database |
| redis | 6380 | Redis cache |
| api | 3001 | Fastify API |
| web | 3000 | Next.js frontend |
| worker | - | Background jobs |
| n8n | 5678 | Workflow automation |
| gateway | 8080 | AI Gateway |

## Health Checks

```powershell
# Check all containers
docker compose -f infra/docker-compose.yml ps

# Check specific service
docker inspect --format='{{.State.Health.Status}}' onm-postgres
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `docker compose down` first |
| Container unhealthy | Check logs: `docker logs onm-api` |
| Database connection | Verify `DATABASE_URL` in `.env` |

## See Also

- [fresh-rebuild](../fresh-rebuild/) - Full project reset
- [prisma-database](../prisma-database/) - Database migrations
