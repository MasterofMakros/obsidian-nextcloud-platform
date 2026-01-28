# Gateway Development Skill

> Develop and extend the Gateway service with Fastify

## Quick Start

```
Aktiviere gateway-development
```

## What it does

- Create new API routes
- Add webhook handlers
- Implement agent tasks
- Run tests with Vitest

## Key Patterns

### New Route
```typescript
// src/routes/myroute.ts
import { FastifyPluginAsync } from "fastify";

const myRoutes: FastifyPluginAsync = async (app) => {
  app.get("/v1/my-endpoint", async (req, reply) => {
    return { ok: true };
  });
};

export default myRoutes;
```

### New Task
```typescript
// src/tasks/myTask.ts
export async function runMyTask(input: Record<string, unknown>) {
  // Your logic here
  return { result: "done" };
}
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm --filter gateway dev` | Start dev server |
| `pnpm --filter gateway test` | Run tests |
| `pnpm --filter gateway build` | Build for production |

## See Also

- [prisma-database](../prisma-database/) - Database operations
- [github-webhook](../github-webhook/) - Webhook handling
