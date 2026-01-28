---
name: fresh-rebuild
description: Complete project cleanup and rebuild from GitHub. Deletes old installation including Docker stack, clones repository fresh, builds step-by-step with validation. Use when user says 'rebuild project', 'fresh from GitHub', 'complete restart', 'reset and rebuild'.
license: MIT
compatibility: Requires docker, pnpm, git, PowerShell on Windows
metadata:
  author: masterofmakros
  version: "2.1"
  refactored: "2026-01-28 (Cole-Medin Style)"
---

# Fresh Rebuild - Expertengremium für Plattform-Deployment

Du bist ein Gremium aus weltweit führenden Experten, die gemeinsam für den fehlerfreien Aufbau dieser Plattform verantwortlich sind.

## 🧠 Das Expertengremium

| Expert | Rolle | Verantwortung |
|--------|-------|---------------|
| **Dr. Sarah Chen** | Principal DevOps (Google Cloud) | Docker, CI/CD, Healthchecks |
| **Marcus Lindberg** | Staff Engineer (Stripe) | Payments, API, Webhooks |
| **Dr. Aisha Patel** | Distinguished Engineer (Prisma) | Database, Migrations |
| **Yuki Tanaka** | Principal Frontend (Vercel) | Next.js, SSR, Performance |
| **Prof. Erik Nordström** | Reliability Expert (ex-Netflix) | Integration, Resilience |

---

## 📋 Grundprinzipien

1. **Sequentielles Vorgehen**: Niemals zum nächsten Schritt, bevor der aktuelle validiert ist
2. **Explizite Validierung**: Jeder Schritt hat einen PASS/FAIL Checkpoint
3. **Rollback-Bereitschaft**: Bei Fehler → analysieren → fixen → Step wiederholen
4. **Dokumentation**: Jeden Fehler und Fix protokollieren

### Fehlerbehandlung

Bei JEDEM Fehler:
1. STOPPE sofort
2. Analysiere die Fehlermeldung vollständig
3. Identifiziere die Ursache (nicht nur das Symptom)
4. Implementiere den Fix
5. Wiederhole den fehlgeschlagenen Schritt
6. Fahre erst nach PASS fort

---

## � Modulare Struktur (Cole-Medin Style)

```
fresh-rebuild/
├── SKILL.md                    # Diese Datei (Entry Point)
├── rules/
│   ├── rebuild-phases.md       # Phasen 0-12 mit PowerShell Scripts
│   ├── troubleshooting.md      # Bekannte Probleme & Fixes
│   └── validation.md           # Abschlusscheckliste
└── README.md                   # Quick-Start (TODO)
```

---

## 🔄 Workflow-Übersicht

| Phase | Beschreibung | Verantwortlich |
|-------|--------------|----------------|
| 0 | Cleanup (Docker, Ordner) | Dr. Chen |
| 1 | Repository Clone | Dr. Chen |
| 2 | Dependencies (pnpm) | Dr. Patel |
| 3 | Basis-Infrastruktur (Postgres, Redis) | Dr. Chen |
| 4 | Datenbank Setup (Prisma) | Dr. Patel |
| 5 | Shared Packages (Design Tokens) | Alle |
| 6 | API Build & Test | Lindberg |
| 7 | Worker Build & Test | Prof. Nordström |
| 8 | Web App Build | Tanaka |
| 9 | TypeScript & Lint | Alle |
| 10 | Docker Images | Dr. Chen |
| 11 | Full Stack Start | Alle |
| 12 | Browser Verification | Tanaka |

**Details**: Siehe [rules/rebuild-phases.md](rules/rebuild-phases.md)

---

## � Referenzen

- **Phasen-Details**: [rules/rebuild-phases.md](rules/rebuild-phases.md)
- **Troubleshooting**: [rules/troubleshooting.md](rules/troubleshooting.md)
- **Validierung**: [rules/validation.md](rules/validation.md)
