---
name: gateway-development
description: Gateway service mit Fastify, Webhooks, LLM. Use when working on API routes, agent tasks, or Gateway tests.
---

# Gateway Development

## Commands

| Action | Command |
|--------|---------|
| Dev | `pnpm --filter gateway dev` |
| Test | `pnpm --filter gateway test` |
| Build | `pnpm --filter gateway build` |

## Structure

```
apps/gateway/src/
├── index.ts          # Entry
├── schemas.ts        # Zod
├── routes/           # API endpoints
└── tasks/            # AI tasks
```

## New Route

| Step | File | Code |
|------|------|------|
| 1 | `routes/X.ts` | `app.get("/X", async (req,reply) => {...})` |
| 2 | `index.ts` | `app.register(xRoutes)` |
| 3 | `X.test.ts` | `describe("X", () => {...})` |

## New Task

| Step | File | Code |
|------|------|------|
| 1 | `tasks/X.ts` | `export async function runX(input) {...}` |
| 2 | `schemas.ts` | `export const XOutput = z.object({...})` |
| 3 | `index.ts` | `if (task === "X") output = await runX(input)` |

## Environment

```env
GATEWAY_BEARER_TOKEN=secret
OPENAI_API_KEY=sk-...
PORT=8080
```

## Errors

| Error | Fix |
|-------|-----|
| Cannot find 'fastify' | Run from root with `pnpm --filter` |
| 401 Unauthorized | Set `GATEWAY_BEARER_TOKEN` |
