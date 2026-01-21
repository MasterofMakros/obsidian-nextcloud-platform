# Testing Guide

## Unit Tests
Run unit tests for all packages:
```bash
pnpm -r test
```

## E2E Tests (Frontend)
Requires running dev server:
```bash
pnpm --filter web dev
# In another terminal
pnpm --filter web dlx playwright test
```

## Load Tests (k6)
We use [k6](https://k6.io) for load testing the API.

Prerequisites: k6 installed.

```bash
k6 run tests/k6/load.js
```
