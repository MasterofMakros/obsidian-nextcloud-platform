# Fresh Rebuild Skill

> Complete project cleanup and rebuild from GitHub

## Quick Start

```
Aktiviere fresh-rebuild
```

or use the slash command:

```
/fresh-rebuild
```

## What it does

1. **Cleanup** - Stops Docker, removes old project folder
2. **Clone** - Fresh git clone from GitHub
3. **Build** - Step-by-step with validation at each phase
4. **Verify** - Browser tests to confirm everything works

## When to use

- Project is broken beyond repair
- Want a clean slate
- Testing deployment from scratch

## Files

| File | Description |
|------|-------------|
| `SKILL.md` | Entry point, expert panel, principles |
| `rules/rebuild-phases.md` | All 12 phases with PowerShell scripts |
| `rules/troubleshooting.md` | Known issues and fixes |
| `rules/validation.md` | Final checklist |

## See Also

- [full-project-setup](../full-project-setup/) - For first-time setup on new systems
- [docker-stack](../docker-stack/) - For Docker-only operations
