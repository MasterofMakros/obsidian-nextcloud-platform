# Compatibility Matrix

Vollständige Abhängigkeits-Matrix für das obsidian-nextcloud-platform Projekt.

---

## Runtime Dependencies

### Node.js Compatibility

| Node.js | Status | Fastify | Prisma | Next.js | EOL |
|---------|--------|---------|--------|---------|-----|
| 18.x | ⚠️ Deprecated | 4.x | 5.x | 14-15 | Apr 2025 |
| 20.x | ✅ LTS | 5.x | 5.x | 14-16 | Apr 2026 |
| 22.x | ✅ Current | 5.x | 5.x | 15-16 | Apr 2027 |

### TypeScript Compatibility

| TypeScript | Node.js | React | Next.js | Prisma |
|------------|---------|-------|---------|--------|
| 5.0-5.3 | 18+ | 18+ | 13-14 | 5.0+ |
| 5.4-5.6 | 20+ | 18-19 | 14-15 | 5.5+ |
| 5.7-5.9 | 20+ | 19+ | 15-16 | 5.10+ |

---

## Frontend Stack

### Next.js → React Compatibility

| Next.js | React Required | React Recommended | Notes |
|---------|----------------|-------------------|-------|
| 14.x | 18.2+ | 18.3 | Stable |
| 15.x | 18.3+ / 19-RC | 19.0 | React Compiler |
| 16.x | 19.0+ | 19.2 | Turbopack Default |

### Next.js 16 Breaking Changes

| Feature | Change | Migration |
|---------|--------|-----------|
| Bundler | Turbopack default | Use `--webpack` flag |
| ESLint | Flat config | Update eslint.config.js |
| Async APIs | cookies/headers async | Add await |
| Middleware | Replaced by proxy.ts | Migrate middleware |
| Node.js | Minimum 20.9.0 | Update Node |

---

## Backend Stack

### Fastify Compatibility

| Fastify | Node.js | Plugins | Notes |
|---------|---------|---------|-------|
| 4.x | 18+ | @fastify/* 4.x | Legacy |
| 5.x | 20+ | @fastify/* 5.x | Current |

### Fastify 5 Breaking Changes

| Feature | Change | Migration |
|---------|--------|-----------|
| ESM | Default ESM | Update imports |
| Plugins | New plugin API | Check @fastify/* versions |
| Types | Stricter types | Fix type errors |

### Prisma Compatibility

| Prisma | Node.js | TypeScript | Databases |
|--------|---------|------------|-----------|
| 5.0-5.9 | 18+ | 5.0+ | PG 12+, MySQL 8+ |
| 5.10-5.13 | 20+ | 5.1+ | PG 13+, MySQL 8+ |

### Prisma Breaking Changes (by version)

| Version | Breaking Change | Migration |
|---------|-----------------|-----------|
| 5.0 | Client API changes | Regenerate client |
| 5.10 | Query engine update | No action needed |
| 6.0 | Schema format | Major migration |

---

## Queue Stack

### BullMQ Compatibility

| BullMQ | Redis | Node.js | Notes |
|--------|-------|---------|-------|
| 4.x | 6.2+ | 18+ | Stable |
| 5.x | 7.0+ | 20+ | Current |

### Redis Compatibility

| Redis | BullMQ | Docker Image |
|-------|--------|--------------|
| 6.2 | 4.x | redis:6-alpine |
| 7.0 | 4.x, 5.x | redis:7-alpine |
| 7.2 | 5.x | redis:7.2-alpine |

---

## Docker Images

### Official Images

| Service | Image | Recommended Tag | Latest |
|---------|-------|-----------------|--------|
| PostgreSQL | postgres | 16-alpine | 16.x |
| Redis | redis | 7-alpine | 7.2 |
| Node | node | 22-alpine | 22.x |

### Version Pinning Strategy

```yaml
# Recommended: Use major.minor for stability
postgres:16-alpine  # Not postgres:latest
redis:7-alpine      # Not redis:latest
node:22-alpine      # Not node:latest
```

---

## Obsidian Plugin

### Obsidian API Compatibility

| Obsidian App | API Version | Features |
|--------------|-------------|----------|
| 1.4.x | 1.4 | Canvas, Bookmarks |
| 1.5.x | 1.5 | Properties, Sync v3 |
| 1.6.x | 1.6 | Improved Mobile |
| 1.7.x | 1.7 | Database Views |
| 1.8.x | 1.8 | AI Features |

### Plugin Breaking Changes

| API Version | Change | Migration |
|-------------|--------|-----------|
| 1.5 | Properties API | Update metadata handling |
| 1.7 | New Editor API | Optional migration |

---

## Update Checklists

### Before Updating Node.js

- [ ] Check Fastify compatibility
- [ ] Check Prisma compatibility
- [ ] Check Next.js compatibility
- [ ] Update Docker base image
- [ ] Run full test suite

### Before Updating Next.js

- [ ] Check React version requirement
- [ ] Review breaking changes in CHANGELOG
- [ ] Update eslint config if needed
- [ ] Check middleware changes
- [ ] Test build with new version

### Before Updating Prisma

- [ ] Check TypeScript compatibility
- [ ] Review migration guide
- [ ] Backup database
- [ ] Regenerate Prisma client
- [ ] Run migration tests

### Before Updating Fastify

- [ ] Check plugin compatibility
- [ ] Review breaking changes
- [ ] Update @fastify/* plugins together
- [ ] Test all routes

---

## EOL Dates

| Component | Version | EOL Date | Action |
|-----------|---------|----------|--------|
| Node.js 18 | 18.x | Apr 2025 | Upgrade to 20/22 |
| Node.js 20 | 20.x | Apr 2026 | Plan upgrade |
| TypeScript 5.0 | 5.0 | N/A | Update regularly |
| PostgreSQL 15 | 15 | Nov 2027 | Monitor |
| Redis 6 | 6.x | N/A | Upgrade to 7 |

---

## Quick Reference

```
Node.js 22 ──┬── Next.js 16 ──── React 19
             │
             ├── Fastify 5 ───── @fastify/cors 5
             │                   @fastify/jwt 9
             │
             ├── Prisma 5 ────── @prisma/client 5
             │
             └── BullMQ 5 ────── Redis 7
```

---

## Sources

- [Node.js Releases](https://nodejs.org/en/about/releases/)
- [Next.js Changelog](https://nextjs.org/docs/app/changelog)
- [Prisma Releases](https://github.com/prisma/prisma/releases)
- [Fastify Releases](https://github.com/fastify/fastify/releases)
- [Obsidian API](https://docs.obsidian.md/Plugins/API)
