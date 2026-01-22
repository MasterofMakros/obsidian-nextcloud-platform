# Testing Guide

> **Comprehensive testing strategy for quality assurance.**

Unit tests, integration tests, E2E tests, and load testing.

## Quick Start

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific workspace
pnpm --filter api run test
pnpm --filter worker run test
pnpm --filter web run test
```

## Test Types

| Type | Tool | Location | Purpose |
|------|------|----------|---------|
| Unit | Vitest | `*/src/**/*.test.ts` | Isolated function testing |
| Integration | Vitest | `*/tests/integration/` | API + DB testing |
| E2E | Playwright | `apps/web/e2e/` | Browser automation |
| Load | k6 | `tests/k6/` | Performance testing |

## Unit Tests

Fast, isolated tests for business logic:

```bash
# API unit tests
pnpm --filter api run test

# Worker unit tests
pnpm --filter worker run test

# Watch mode
pnpm --filter api run test:watch
```

### Coverage Thresholds

| Package | Statements | Branches | Functions |
|---------|------------|----------|-----------|
| api | 80% | 75% | 80% |
| worker | 80% | 75% | 80% |
| db | 70% | 60% | 70% |

## Integration Tests

Tests that require database and external services:

```bash
# Start test infrastructure
docker compose -f docker-compose.test.yml up -d

# Run integration tests
pnpm --filter api run test:integration

# Cleanup
docker compose -f docker-compose.test.yml down -v
```

### Test Database

Integration tests use a separate database:

```bash
DATABASE_URL=postgresql://test:test@localhost:5433/test_db
```

## E2E Tests (Playwright)

Browser automation for critical user flows:

```bash
# Install Playwright browsers (first time)
pnpm --filter web exec playwright install

# Start dev server
pnpm --filter web run dev

# Run E2E tests (new terminal)
pnpm --filter web run test:e2e

# Run with UI
pnpm --filter web exec playwright test --ui

# Generate report
pnpm --filter web exec playwright show-report
```

### Test Scenarios

| Test | File | Description |
|------|------|-------------|
| Homepage loads | `home.spec.ts` | Landing page renders |
| Pricing displayed | `pricing.spec.ts` | Plans visible |
| License activation | `license.spec.ts` | Activation flow |
| Legal pages | `legal.spec.ts` | Impressum, Privacy, Terms |

## Load Testing (k6)

Performance testing with [k6](https://k6.io):

### Prerequisites

```bash
# macOS
brew install k6

# Windows
winget install k6

# Linux
sudo apt install k6
```

### Run Tests

```bash
# Basic load test
k6 run tests/k6/load.js

# Stress test
k6 run tests/k6/stress.js

# Spike test
k6 run tests/k6/spike.js
```

### Thresholds

| Metric | Target | Critical |
|--------|--------|----------|
| p95 latency | < 200ms | < 500ms |
| Error rate | < 1% | < 5% |
| RPS | > 500 | > 200 |

## CI Integration

Tests run automatically on every PR:

```yaml
# .github/workflows/ci.yml
- name: Run Tests
  run: pnpm test

- name: Run E2E
  run: pnpm --filter web run test:e2e
```

### Required Checks

- [ ] All unit tests pass
- [ ] Coverage thresholds met
- [ ] E2E tests pass
- [ ] No linting errors

## Debugging Tips

```bash
# Run single test file
pnpm --filter api exec vitest run src/routes/license.test.ts

# Run tests matching pattern
pnpm --filter api exec vitest run -t "license activation"

# Debug mode (Node inspector)
pnpm --filter api exec vitest --inspect-brk
```

---

**Frontend Testing:** See [TESTING_FRONTEND.md](TESTING_FRONTEND.md) for visual testing details.
