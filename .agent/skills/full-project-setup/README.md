# Full Project Setup Skill

> First-time project setup from GitHub with step-by-step validation

## Quick Start

```
Aktiviere full-project-setup
```

## What it does

1. **Prerequisites Check** - Verifies Node, pnpm, Docker, Git
2. **Clone & Install** - Repository + dependencies
3. **Infrastructure** - Postgres, Redis containers
4. **Database** - Prisma generate + migrate
5. **Build All** - API, Worker, Web with tests
6. **Validate** - Browser tests, health checks

## When to use

- Setting up on a **new machine**
- First-time contributor onboarding
- Clean environment testing

## Difference from fresh-rebuild

| Skill | Use Case |
|-------|----------|
| **full-project-setup** | New system, never had the project |
| **fresh-rebuild** | Reset existing broken project |

## Files

| File | Description |
|------|-------------|
| `SKILL.md` | Entry point with phase overview |
| `rules/setup-phases.md` | All 13 phases with commands |

## See Also

- [fresh-rebuild](../fresh-rebuild/) - For resetting existing projects
