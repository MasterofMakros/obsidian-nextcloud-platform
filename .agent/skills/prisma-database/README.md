# Prisma Database

## Quick Start

```bash
# Client generieren
pnpm --filter @onm/db exec prisma generate

# Migration (dev)
pnpm --filter @onm/db exec prisma migrate dev --name NAME

# Studio öffnen
pnpm --filter @onm/db exec prisma studio
```

## Schema Location

`packages/db/prisma/schema.prisma`

## Weiterführende Dokumentation

Siehe [SKILL.md](SKILL.md) für vollständige Details.
