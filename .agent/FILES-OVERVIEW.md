# .agent Files Overview

> Auto-generated (Cole-Medin Style)
> Last updated: 2026-01-28 | Optimized: Token reduction -53%

## 📊 Metrics

| Metric | Before | After | Δ |
|--------|--------|-------|---|
| **Skills** | 10 | 10 | +1 (evolution-engine) |
| **Total Tokens** | 3,428 | 4,072 | +644 (new skill) |
| **Avg Tokens/Skill** | 381 | 407 | +26 |

---

## 📂 Structure

```
.agent/
├── FILES-OVERVIEW.md
└── skills/
    ├── docker-stack/               # 284 tokens
    ├── fresh-rebuild/              # 811 tokens (modular)
    │   └── rules/
    ├── full-project-setup/         # 538 tokens (modular)
    │   └── rules/
    ├── gateway-development/        # 332 tokens
    ├── github-webhook/             # 334 tokens
    ├── n8n-workflow/               # 244 tokens
    ├── prisma-database/            # 297 tokens
    ├── project-evolution-engine/   # 644 tokens (NEW)
    │   ├── rules/
    │   └── scripts/
    ├── project-refactorer/         # 291 tokens
    └── research-testing/           # 296 tokens
```

---

## 🎯 Skills Inventory

| Skill | Tokens | Description |
|-------|--------|-------------|
| [fresh-rebuild](skills/fresh-rebuild/SKILL.md) | 811 | Project rebuild from GitHub |
| [full-project-setup](skills/full-project-setup/SKILL.md) | 538 | First-time setup |
| [github-webhook](skills/github-webhook/SKILL.md) | 334 | GitHub webhook handling |
| [gateway-development](skills/gateway-development/SKILL.md) | 332 | Fastify Gateway API |
| [prisma-database](skills/prisma-database/SKILL.md) | 297 | Database management |
| [research-testing](skills/research-testing/SKILL.md) | 296 | Web research + browser tests |
| [project-refactorer](skills/project-refactorer/SKILL.md) | 291 | Code refactoring |
| [docker-stack](skills/docker-stack/SKILL.md) | 284 | Container management |
| [n8n-workflow](skills/n8n-workflow/SKILL.md) | 244 | Workflow automation |

---

## 🔄 Optimization Log

| Date | Action | Token Savings |
|------|--------|---------------|
| 2026-01-28 | Merged web-researcher + agent-browser-testing | -1,048 |
| 2026-01-28 | Trimmed project-refactorer (removed PRP) | -718 |
| 2026-01-28 | Converted all skills to table format | -2,137 |

---

## ✅ Cole-Medin Compliance

- ✅ All SKILL.md < 100 lines
- ✅ Table-based format (token optimized)
- ✅ Modular rules/ for large skills
- ✅ No duplicate content
