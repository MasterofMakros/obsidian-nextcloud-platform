---
name: research-testing
description: Web-Recherche und Browser-Testing bei jedem Implementierungs-/Testschritt. MANDATORY search_web/browser_subagent nutzen.
---

# Research & Testing Skill

## Core Loop (MANDATORY)

```
FOR jeden Schritt:
  1. search_web "[tech] docs 2026"
  2. browser_subagent "Test [URL]"
  3. Fix bei Fehler → GOTO 1
  4. Test grün → commit
```

## Tools

| Tool | Zweck | Beispiel |
|------|-------|----------|
| `search_web` | Docs suchen | `"prisma 7 migration guide"` |
| `browser_subagent` | UI testen | `"Open localhost:3010, screenshot"` |
| `read_url_content` | Docs lesen | `"https://nextjs.org/docs"` |

## Browser Commands

```bash
# Playwright
npx playwright test
npx playwright show-report

# Agent-Browser
agent-browser open http://localhost:3010
agent-browser snapshot
agent-browser click @e1
```

## Project URLs

| Page | URL |
|------|-----|
| Frontend | http://localhost:3010 |
| API | http://localhost:3011 |
| n8n | http://localhost:5678 |

## Rules

- **Keine Halluzinationen**: Zitiere Quellen
- **Verify online**: Keine Annahmen ohne Check
- **Git commit**: Nach jedem Test-Cycle
