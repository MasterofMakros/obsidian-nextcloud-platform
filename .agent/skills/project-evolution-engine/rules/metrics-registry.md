# Metrics Registry

> Kalibriert für TypeScript/pnpm/Vitest/ESLint

## Structure Metrics

| Metric | Command | Unit | Target | Direction |
|--------|---------|------|--------|-----------|
| `file_count` | `fd -e ts -e tsx --exclude node_modules \| wc -l` | count | - | info |
| `avg_lines` | `fd -e ts --exec wc -l \| awk '{sum+=$1; n++} END {print sum/n}'` | lines | <300 | lower |
| `modularity` | `(fd -t d --exclude node_modules \| wc -l) / file_count` | ratio | >0.3 | higher |
| `large_files` | `fd -e ts --exec wc -l \| awk '$1>500 {print}'` | count | 0 | lower |

## Documentation Metrics

| Metric | Command | Unit | Target | Direction |
|--------|---------|------|--------|-----------|
| `readme_coverage` | `fd README.md --exec cat {} \| wc -l` | lines | >100 | higher |
| `doc_ratio` | `(fd -e md \| wc -l) / file_count * 100` | % | >20 | higher |
| `broken_links` | `fd -e md --exec grep -o '\[.*\](.*)'` | count | 0 | lower |
| `skill_readmes` | `fd README.md .agent/skills \| wc -l` | count | =skill_count | equal |

## Code Quality Metrics

| Metric | Command | Unit | Target | Direction |
|--------|---------|------|--------|-----------|
| `lint_errors` | `pnpm lint 2>&1 \| grep -c "error"` | count | 0 | lower |
| `lint_warnings` | `pnpm lint 2>&1 \| grep -c "warning"` | count | <10 | lower |
| `test_coverage` | `pnpm test --coverage \| grep "All files"` | % | >80 | higher |
| `type_errors` | `pnpm tsc --noEmit 2>&1 \| grep -c "error"` | count | 0 | lower |
| `complexity_hotspots` | `fd -e ts --exec npx ts-complexity` | count | <5 | lower |

## Agent-Readiness Metrics

| Metric | Command | Unit | Target | Direction |
|--------|---------|------|--------|-----------|
| `skill_count` | `fd SKILL.md .agent/skills \| wc -l` | count | - | info |
| `skill_compliance` | `% Skills mit YAML-Frontmatter` | % | 100 | higher |
| `spec_violations` | `Skills ohne name/description` | count | 0 | lower |
| `avg_skill_tokens` | `SKILL.md Zeichen / 4` | tokens | <400 | lower |
| `rules_modular` | `% Skills mit rules/ Ordner` | % | >50 | higher |

## Security Metrics

| Metric | Command | Unit | Target | Direction |
|--------|---------|------|--------|-----------|
| `critical_cves` | `pnpm audit --json \| jq '.metadata.vulnerabilities.critical'` | count | 0 | lower |
| `high_cves` | `pnpm audit --json \| jq '.metadata.vulnerabilities.high'` | count | 0 | lower |
| `outdated_deps` | `pnpm outdated --json \| jq 'length'` | count | <10 | lower |

## Delivery Metrics (DORA-Proxy)

| Metric | Command | Unit | Target | Direction |
|--------|---------|------|--------|-----------|
| `commits_month` | `git log --since="1 month ago" --oneline \| wc -l` | count | >20 | higher |
| `last_commit_days` | `git log -1 --format=%cr` | days | <7 | lower |
| `pr_pending` | GitHub API: open PRs | count | <5 | lower |

## Scoring Formula

```
Total Score = Σ (Metric_Score × Weight)

Weights:
- Structure: 15%
- Documentation: 20%
- Code Quality: 30%
- Agent-Readiness: 20%
- Security: 10%
- Delivery: 5%
```

## Delta Calculation

```
Delta = New_Score - Baseline_Score

🟢 Green: Delta > +5%
🟡 Yellow: -5% < Delta < +5%
🔴 Red: Delta < -5%
```
