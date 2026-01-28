---
name: project-refactorer
description: Refaktoriert Code-Projekte im Cole-Medin-Stil: Modulare Rules, Context Engineering, 100% Dokumentation.
---

# Project Refactorer (Cole-Medin Style)

## Workflow

| Phase | Action |
|-------|--------|
| 1 | Context Engineering: `ls -la`, `git log` |
| 2 | Create PRP (implementation_plan.md) |
| 3 | Split large files into `rules/`, `prompts/` |
| 4 | Validate: No regressions |
| 5 | Document: FILES-OVERVIEW.md |

## Folder Structure

```
skills/[name]/
├── SKILL.md      # Entry (<250 lines)
├── rules/        # Modular (1 concern/file)
└── README.md     # Quick-Start
```

## Rules

| Rule | Description |
|------|-------------|
| Naming | Lowercase-kebab-case |
| Max Lines | 250 per file, split if exceeded |
| Frontmatter | YAML required in SKILL.md |

## Commands

| Command | Action |
|---------|--------|
| `refactor-skill` | Scan → Split → Validate → Commit |
| `doc-project` | Generate FILES-OVERVIEW.md |

## Validation

- [ ] SKILL.md < 250 lines
- [ ] 1 concern per rule file
- [ ] FILES-OVERVIEW.md exists
- [ ] No broken functionality
