# Project Evolution Engine

> Evolutionärer Improver für TypeScript/pnpm/Vitest Projekte

## Quick Start

```bash
# 1. Baseline setzen
"Setze Baseline für project-evolution-engine"

# 2. Evolution ausführen
"Evolviere Projekt für Claude-4"

# 3. Delta-Report
"Zeige Delta-Report seit letzter Evolution"
```

## Metrics Categories

| Category | Weight | Key Metrics |
|----------|--------|-------------|
| Structure | 15% | file_count, avg_lines, modularity |
| Docs | 20% | readme_coverage, doc_ratio |
| Code | 30% | lint_errors, test_coverage |
| Agent | 20% | skill_compliance, spec_violations |
| Security | 15% | critical_cves, outdated_deps |

## Files

```
project-evolution-engine/
├── SKILL.md                    # Entry point
├── README.md                   # This file
├── rules/
│   ├── metrics-registry.md     # All 20+ metrics
│   └── evolution-workflow.md   # Step-by-step cycle
└── scripts/
    └── compute-metrics.ts      # Automated measurement
```

## Quality Gate

- ❌ No critical CVEs
- ❌ Lint errors must not increase
- ❌ Test coverage must not decrease
- ✅ Score must improve OR 2+ metrics must improve
