# Cole Medin Style Guide

> **Coding standards and best practices for the Obsidian Nextcloud Media Platform.**

**Version:** 1.0.0  
**Last Updated:** 2026-01-29

---

## 🎯 Philosophy

This project follows the **Cole Medin principles** for AI-assisted coding:

1. **Single Responsibility** - One file, one concern
2. **Test-First** - Tests before implementation
3. **Type Safety** - No `any`, explicit types
4. **Performance** - Optimal data structures and patterns

---

## 📏 File Size Limits

### Golden Rule

**Maximum 250 lines per file.**

### Why?

- Easier to understand at a glance
- Faster code reviews
- Better testability
- Reduced cognitive load for AI assistants

### When to Split

```
❌ BAD: utils.ts (500+ lines)
✅ GOOD:
  - string-utils.ts (50 lines)
  - date-utils.ts (80 lines)
  - validation-utils.ts (60 lines)
```

### Measuring

```bash
# Check file sizes
find apps/ packages/ -name "*.ts" -o -name "*.tsx" | \
  xargs wc -l | sort -n | tail -20

# Find files over 250 lines
find apps/ packages/ -name "*.ts" -o -name "*.tsx" | \
  xargs wc -l | awk '$1 > 250 {print $0}'
```

---

## 📝 Naming Conventions

### Files

```
kebab-case.ts

✅ GOOD:
  - license-validator.ts
  - stripe-processor.ts
  - user-repository.ts

❌ BAD:
  - LicenseValidator.ts
  - stripeProcessor.ts
  - utils.ts (too generic)
```

### Components (React)

```
PascalCase.tsx

✅ GOOD:
  - SiteHeader.tsx
  - LicenseCard.tsx
  - PricingTable.tsx

❌ BAD:
  - siteHeader.tsx
  - license-card.tsx
```

### Functions & Variables

```
camelCase

✅ GOOD:
  - validateLicense()
  - currentUser
  - maxDeviceCount

❌ BAD:
  - ValidateLicense() (PascalCase)
  - validate_license() (snake_case)
  - MAXDEVICECOUNT (too long)
```

### Constants

```
UPPER_SNAKE_CASE

✅ GOOD:
  - MAX_DEVICE_COUNT = 3
  - DEFAULT_TIMEOUT_MS = 5000
  - API_VERSION = 'v1'

❌ BAD:
  - maxDeviceCount
  - defaultTimeout
```

### Types & Interfaces

```
PascalCase

✅ GOOD:
  - interface LicenseConfig {}
  - type ValidationResult = {}
  - class LicenseManager {}

❌ BAD:
  - interface licenseConfig {}
```

---

## 🧪 Testing Standards

### Coverage Requirements

| Package | Statements | Branches | Functions |
|---------|------------|----------|-----------|
| api | 80% | 75% | 80% |
| worker | 80% | 75% | 80% |
| db | 70% | 60% | 70% |
| web | 60% | 50% | 60% |

### Test-First Development

```typescript
// 1. Write test FIRST
// apps/api/src/routes/license.test.ts
import { test, expect } from 'vitest';

test('should reject invalid license key', async () => {
  const response = await request(app)
    .post('/api/v1/license/activate')
    .send({ licenseKey: 'INVALID', deviceId: 'uuid' });
  
  expect(response.status).toBe(401);
  expect(response.body.error).toBe('Invalid license key');
});

// 2. Implement to make test pass
// apps/api/src/routes/license.ts
export async function activateLicense(req, reply) {
  const { licenseKey } = req.body;
  
  if (!isValidLicenseKey(licenseKey)) {
    return reply.code(401).send({ error: 'Invalid license key' });
  }
  // ...
}
```

### Test File Locations

```
Co-located with source:

apps/api/src/
├── routes/
│   ├── license.ts
│   └── license.test.ts        # ✅ GOOD
├── lib/
│   └── licensing.ts
│       └── licensing.test.ts  # ✅ GOOD

❌ BAD:
  tests/
    └── license.test.ts
```

---

## 🔒 Type Safety

### No `any` Allowed

```typescript
// ❌ BAD
function processData(data: any) {
  return data.something;
}

// ✅ GOOD
interface DataPayload {
  something: string;
}

function processData(data: unknown): string {
  if (isDataPayload(data)) {
    return data.something;
  }
  throw new Error('Invalid data');
}

function isDataPayload(data: unknown): data is DataPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'something' in data &&
    typeof (data as DataPayload).something === 'string'
  );
}
```

### Explicit Return Types

```typescript
// ❌ BAD - Implicit return type
async function getUser(email) {
  return prisma.user.findUnique({ where: { email } });
}

// ✅ GOOD - Explicit return type
import { User } from '@prisma/client';

async function getUser(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}
```

### Zod for Runtime Validation

```typescript
import { z } from 'zod';

// ✅ GOOD - Schema validation
const ActivateLicenseSchema = z.object({
  licenseKey: z.string().min(10),
  deviceId: z.string().uuid()
});

type ActivateLicenseInput = z.infer<typeof ActivateLicenseSchema>;

app.post('/license/activate', async (req, reply) => {
  const result = ActivateLicenseSchema.safeParse(req.body);
  
  if (!result.success) {
    return reply.code(400).send({
      error: 'Invalid input',
      details: result.error.errors
    });
  }
  
  const { licenseKey, deviceId } = result.data;
  // ...
});
```

---

## ⚡ Performance Patterns

### Use `Set` for Lookups

```typescript
// ❌ BAD - O(n) lookup
const allowlist = ['https://example.com', 'https://app.example.com'];
if (allowlist.includes(origin)) {
  // O(n) on every request!
}

// ✅ GOOD - O(1) lookup
const allowlistSet = new Set(allowlist);
if (allowlistSet.has(origin)) {
  // O(1) - constant time
}
```

### Database: Use `upsert` not `find + create`

```typescript
// ❌ BAD - N+1 queries
const user = await prisma.user.findUnique({ where: { email } });
if (!user) {
  await prisma.user.create({ data: { email } });
}

// ✅ GOOD - Single query
await prisma.user.upsert({
  where: { email },
  update: {},
  create: { email }
});
```

### Database: Select Only Needed Fields

```typescript
// ❌ BAD - Fetches all fields
const license = await prisma.license.findFirst({
  where: { hashedKey }
});

// ✅ GOOD - Select only needed fields
const license = await prisma.license.findFirst({
  where: { hashedKey },
  select: {
    id: true,
    status: true,
    deviceIdHashes: true
  }
});
```

### Async File Operations

```typescript
import { promises as fs } from 'fs';

// ❌ BAD - Blocks event loop
const data = fs.readFileSync(path);
fs.writeFileSync(path, content);

// ✅ GOOD - Non-blocking
const data = await fs.readFile(path);
await fs.writeFile(path, content);
```

### No Inline Styles in React

```tsx
// ❌ BAD - New object on every render
<div style={{ padding: '2rem', display: 'flex' }}>

// ✅ GOOD - CSS Modules
import styles from './page.module.css';
<div className={styles.container}>

// CSS Module
.container {
  padding: 2rem;
  display: flex;
}
```

---

## 📁 Project Structure

### App Organization

```
apps/
├── api/                 # Fastify API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── plugins/     # Fastify plugins
│   │   └── lib/         # Utilities
│   └── test/            # Integration tests
│
├── web/                 # Next.js
│   ├── app/             # App Router
│   ├── components/      # React components
│   └── e2e/             # Playwright tests
│
├── worker/              # BullMQ
│   └── src/
│       └── __tests__/   # Unit tests
│
└── gateway/             # AI Gateway
    └── src/
        └── tasks/
```

### Route Organization

One file per route group:

```typescript
// ✅ GOOD - routes/license.ts
export default async function licenseRoutes(app) {
  app.post('/activate', activateHandler);
  app.post('/refresh', refreshHandler);
  app.post('/verify', verifyHandler);
  app.post('/deactivate', deactivateHandler);
}

// ❌ BAD - routes.ts (500+ lines)
app.post('/license/activate', ...);
app.post('/license/refresh', ...);
app.post('/stripe/webhook', ...);
app.get('/health', ...);
```

---

## 🎨 Code Style

### Imports

```typescript
// ✅ GOOD - Grouped imports
// External
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Internal packages
import { prisma } from '@onm/db';

// Local
import { validateLicense } from './lib/licensing';

// ❌ BAD - Wildcard imports
import * as fs from 'fs';  // Use: import { readFile } from 'fs/promises'
```

### Error Handling

```typescript
// ✅ GOOD - Specific errors
import { LicenseNotFoundError } from './errors';

try {
  const license = await getLicense(key);
} catch (error) {
  if (error instanceof LicenseNotFoundError) {
    return reply.code(404).send({ error: 'License not found' });
  }
  
  logger.error({ err: error }, 'Unexpected error');
  return reply.code(500).send({ error: 'Internal error' });
}
```

### Comments

```typescript
// ✅ GOOD - Why, not what
// Calculate grace period end (7 days after expiration)
const graceEndsAt = new Date(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);

// ❌ BAD - Obvious comment
// Add 7 days to date
const graceEndsAt = new Date(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);
```

---

## ✅ Definition of Done

Before marking any task complete:

- [ ] File size ≤ 250 lines
- [ ] Tests written and passing
- [ ] Coverage thresholds met
- [ ] Lint passes (`pnpm lint`)
- [ ] Typecheck passes (`pnpm typecheck`)
- [ ] No `any` types
- [ ] Explicit return types on public functions
- [ ] Zod validation on API inputs
- [ ] No secrets or PII in code
- [ ] Documentation updated (if needed)

---

## 🔍 Verification Commands

```bash
# Check file sizes
find apps/ packages/ -name "*.ts" -o -name "*.tsx" | \
  xargs wc -l | sort -n | tail -20

# Run tests
pnpm test

# Run lint
pnpm -r run lint

# Run typecheck
pnpm -r run typecheck --if-present

# Check test coverage
pnpm test:coverage
```

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zod Documentation](https://zod.dev/)
- [Fastify Best Practices](https://www.fastify.io/docs/latest/Guides/Best-Practice/)
- [Prisma Style Guide](https://www.prisma.io/docs/concepts/components/prisma-schema/style-guide)

---

<div align="center">

**Built with ❤️ and ☕ by Fentrea GmbH** 🇨🇭

*Swiss engineering. Privacy first. Always.*

</div>
