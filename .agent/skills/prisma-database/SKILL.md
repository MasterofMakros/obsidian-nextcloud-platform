---
name: prisma-database
description: Prisma schema, migrations, client. Use when user mentions 'prisma', 'database', 'migration'.
---

# Prisma Database

## Commands

| Action | Command |
|--------|---------|
| Generate | `pnpm --filter @onm/db exec prisma generate` |
| Migrate (dev) | `pnpm --filter @onm/db exec prisma migrate dev --name NAME` |
| Migrate (prod) | `pnpm --filter @onm/db exec prisma migrate deploy` |
| Studio | `pnpm --filter @onm/db exec prisma studio` |
| Pull | `pnpm --filter @onm/db exec prisma db pull` |
| Reset | `pnpm --filter @onm/db exec prisma migrate reset` |

## Schema

```
packages/db/prisma/schema.prisma
```

## New Model

| Step | Action |
|------|--------|
| 1 | Edit `schema.prisma` |
| 2 | `prisma migrate dev --name add_X` |
| 3 | `prisma generate` |
| 4 | `import { prisma } from "@onm/db"` |

## Errors

| Error | Fix |
|-------|-----|
| P1001: Can't reach DB | `docker compose up -d postgres` |
| P2002: Unique failed | Check data uniqueness |
| Client not generated | `prisma generate` |

## Environment

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/obsidian_media"
```
