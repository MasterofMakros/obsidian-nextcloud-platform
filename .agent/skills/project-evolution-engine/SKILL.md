---
name: project-evolution-engine
description: Evolutionärer Improver für Antigravity-Projekte. Sichtet bei jeder LLM-Generation, misst 20+ Metriken, verbessert modular und trackt Fortschritt via Delta-Reports. Kalibriert für TypeScript/pnpm/Vitest.
compatibility: Requires pnpm, git, TypeScript toolchain
metadata:
  author: masterofmakros
  version: "1.0"
  cole-medin-style: true
  toolchain: typescript/pnpm/vitest/eslint
---

# Project Evolution Engine

## Core Prinzip

Arbeite in Iterationen: **Scan → Messen → Vergleichen → Planen → Ändern → Re-messen → Loggen**.
Keine Änderung ohne messbaren Nutzen.

## Trigger

```
"Evolviere Projekt für [LLM-Version]"
"Run evolution cycle goal=balanced"
"Setze Baseline für project-evolution-engine"
```

## Inputs

| Parameter | Optionen | Default |
|-----------|----------|---------|
| Scope | whole-repo, folder:path, diff-only | whole-repo |
| Goal | refactor, docs, agent-readiness, security, balanced | balanced |
| Risk | low, medium, high | low |

## Outputs (Artefakte)

```
project-metrics/
├── metrics.json          # Aktuelle Messung
├── baseline.json         # Akzeptierter Stand
├── history.csv           # Zeitreihe (append-only)
├── evolution-report.md   # Human-readable Report
└── refactor-plan.md      # Umsetzbare Tasks
```

## Execution Cycle

| Step | Action | Command |
|------|--------|---------|
| 1 | Inventory | `fd -e ts -e tsx --exclude node_modules` |
| 2 | Measure Pre | `pnpm run lint`, `pnpm test --coverage` |
| 3 | Compare | Diff gegen baseline.json |
| 4 | Plan | refactor-plan.md erstellen |
| 5 | Implement | Task-by-task ändern |
| 6 | Measure Post | Vollmessung, history.csv append |
| 7 | Gate | Quality Gate prüfen |

## Quality Gate

Akzeptiere Iteration nur wenn:
- ❌ Keine Erhöhung bei: lint_errors, critical_cves
- ❌ test_coverage nicht sinkt
- ✅ Gesamt-Score steigt ODER 2+ Metriken verbessert

## Commands

```bash
# Baseline setzen
evolve-baseline

# Vollständiger Zyklus
evolve-full [LLM-Version]

# Nur Metriken messen
evolve-metrics

# Delta-Report
evolve-delta [old] [new]
```

## Metric Categories

Siehe `rules/metrics-registry.md` für vollständige Definitionen.

| Category | Key Metrics |
|----------|-------------|
| Structure | file_count, avg_lines, modularity |
| Docs | readme_coverage, broken_links |
| Code | lint_errors, test_coverage, complexity |
| Agent | skill_compliance, spec_violations |
| Security | critical_cves, outdated_deps |
