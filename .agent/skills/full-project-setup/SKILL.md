---
name: full-project-setup
description: Vollständiges Projekt-Setup von GitHub mit schrittweiser Validierung. Use when user says 'setup project', 'configure from scratch', 'full install'.
license: MIT
compatibility: Requires docker, pnpm, git, PowerShell on Windows
metadata:
  author: masterofmakros
  version: "2.0"
  refactored: "2026-01-28 (Cole-Medin Style)"
---

# Full Project Setup - Schrittweise Validierung

Dieser Skill führt durch das komplette Setup des Projekts von einem frischen GitHub-Clone bis zur laufenden Plattform im Browser.

## 🎯 Unterschied zu `fresh-rebuild`

| Skill | Anwendungsfall |
|-------|---------------|
| **full-project-setup** | Erstmaliges Setup auf neuem System |
| **fresh-rebuild** | Reset eines bestehenden Projekts |

---

## ✅ Voraussetzungen

```powershell
node --version   # Erwartet: v20+
pnpm --version   # Erwartet: v9+
docker --version # Erwartet: Docker 24+
git --version    # Erwartet: git 2.40+
```

Falls ein Tool fehlt → **Stopp und User informieren**.

---

## 📂 Modulare Struktur

```
full-project-setup/
├── SKILL.md                    # Diese Datei (Entry Point)
├── rules/
│   └── setup-phases.md         # Alle 13 Phasen mit PowerShell
└── README.md                   # Quick-Start
```

---

## 🔄 Phasen-Übersicht

| Phase | Beschreibung | Turbo |
|-------|--------------|-------|
| 1 | Repository klonen | ✅ |
| 2 | Dependencies (pnpm) | ✅ |
| 3 | Docker Infrastruktur | |
| 4 | Datenbank Setup (Prisma) | ✅ |
| 5 | Shared Packages bauen | ✅ |
| 6 | API Build & Test | ✅ |
| 7 | Worker Build & Test | ✅ |
| 8 | Web App Build | ✅ |
| 9 | TypeScript & Lint | ✅ |
| 10 | Integration Tests | ✅ |
| 11 | Docker Build | ✅ |
| 12 | Full Stack Test | |
| 13 | Browser Validation | |

**Details**: Siehe [rules/setup-phases.md](rules/setup-phases.md)

---

## 🔗 Referenzen

- **Phasen-Details**: [rules/setup-phases.md](rules/setup-phases.md)
- **Troubleshooting**: Siehe [fresh-rebuild/rules/troubleshooting.md](../fresh-rebuild/rules/troubleshooting.md)
