---
name: component-updater
description: Vollständiges Komponenten-Management mit MANDATORY Web-Recherche bei jedem Update-Schritt. Automatisiert Audit, Kompatibilitätsprüfung, Code-Updates und Testing.
---

# Component Updater Skill

Manage und aktualisiere alle Projekt-Komponenten mit automatisierter Web-Recherche und Agent Browser Testing.

## MANDATORY: Research-First bei JEDEM Update

> "Immer zuerst online recherchieren"
> "Tools nutzen, Zeit ignorieren"
> "Keine Updates ohne Web-Verifizierung"

---

## Phase 1: Audit (30-45 min)

### 1.1 Komponenten scannen
```bash
# Automatisches Audit
.antigravity/skills/component-updater/scripts/audit-components.sh
```

### 1.2 Web-Recherche für JEDE Komponente
```
FOR each component in [package.json, docker-compose.yml]:
  1. search_web "[component] latest version 2026"
  2. search_web "[component] changelog breaking changes"
  3. read_url_content "[official docs URL]"
  4. Dokumentiere: Current → Latest, Breaking Changes
```

### 1.3 Ergebnis
- Erstelle/Update `COMPONENT_INVENTORY.md`
- Priorisiere: P1 (Security), P2 (Major), P3 (Minor)

---

## Phase 2: Kompatibilitäts-Check (10-15 min)

### 2.1 Matrix konsultieren
```
1. Öffne references/COMPATIBILITY_MATRIX.md
2. Prüfe Abhängigkeiten:
   - Node.js Version → Fastify Kompatibilität
   - React Version → Next.js Kompatibilität
   - TypeScript → Prisma Client
```

### 2.2 Breaking Changes analysieren
```
search_web "[component] [version] migration guide"
search_web "[component] breaking changes [old] to [new]"
```

### 2.3 Entscheidung
- ✅ PROCEED: Keine Breaking Changes
- ⚠️ CAUTION: Minor Breaking Changes (Codemod verfügbar)
- ❌ DEFER: Major Breaking Changes (manuelles Review nötig)

---

## Phase 3: Code Implementation (20-30 min)

### 3.1 Backup erstellen
```bash
git checkout -b update/[component]-[version]
```

### 3.2 Update durchführen
```bash
# NPM Package
pnpm update [package]@[version]

# Prisma
pnpm --filter @onm/db db:generate

# Docker Image
# Update docker-compose.yml, dann:
docker-compose pull
```

### 3.3 Build verifizieren
```bash
pnpm build
pnpm typecheck
```

---

## Phase 4: Agent Browser Testing (25-30 min)

### 4.1 Server starten
```bash
pnpm --filter web dev &
pnpm --filter api dev &
```

### 4.2 Browser Tests
```
browser_subagent:
  1. "Open http://localhost:3010"
  2. "Snapshot page, identify key elements"
  3. "Navigate through main user flows"
  4. "Take screenshots of each page"
  5. "Report any errors or regressions"
```

### 4.3 Playwright E2E
```bash
cd apps/web && pnpm e2e
```

---

## Phase 5: Dokumentation (10-15 min)

### 5.1 Inventory aktualisieren
```markdown
# In COMPONENT_INVENTORY.md
| Package | OLD | NEW | Date | Status |
|---------|-----|-----|------|--------|
| prisma  | 5.7 | 5.13| 2026-01-27 | ✅ |
```

### 5.2 Git Commit
```bash
git add -A
git commit -m "chore(deps): update [component] to [version]

- Breaking Changes: [NONE/LIST]
- Migration: [STEPS]
- Tests: All 28 passing"

git push origin update/[component]-[version]
```

---

## Tool-Reference

| Phase | Tool | Zweck |
|-------|------|-------|
| Audit | `search_web` | Version recherchieren |
| Audit | `run_command` | package.json scannen |
| Compat | `view_file` | Matrix konsultieren |
| Compat | `read_url_content` | Offizielle Docs lesen |
| Code | `replace_file_content` | Versionen updaten |
| Code | `run_command` | pnpm install, build |
| Test | `browser_subagent` | UI testen |
| Test | `run_command` | Playwright E2E |
| Doc | `write_to_file` | Inventory updaten |

---

## Priority Levels

| Level | Kriterium | Zeitrahmen |
|-------|-----------|------------|
| **P1** | Security-Fix, EOL | Sofort (24h) |
| **P2** | Major Version, wichtige Features | Diese Woche |
| **P3** | Minor Updates, DevDeps | Nächster Sprint |

---

## Rollback-Strategie

Bei Fehler in jeder Phase:
```bash
# Branch löschen, zurück zu main
git checkout main
git branch -D update/[component]-[version]

# Oder: Letzte funktionierende Version
pnpm update [package]@[last-working-version]
```

---

## Beispiel-Workflow

**Input:** "Update Prisma zur neuesten Version"

**Ausführung:**
```
1. search_web "Prisma latest version January 2026"
   → 5.13.0 (released 2026-01-15)

2. search_web "Prisma 5.13 breaking changes"
   → Keine Breaking Changes

3. view_file COMPATIBILITY_MATRIX.md
   → Node 20 ✅, TypeScript 5.7 ✅

4. run_command "pnpm update prisma@5.13.0"
   → Installed

5. run_command "pnpm build"
   → Build successful

6. run_command "pnpm e2e"
   → 28/28 tests passed

7. Update COMPONENT_INVENTORY.md
   → prisma: 5.7.0 → 5.13.0 ✅
```

---

## Constraints

- **MANDATORY Web-Recherche**: Keine Annahmen über Versionen
- **Kompatibilität zuerst**: Matrix IMMER konsultieren
- **Test Coverage**: Keine Updates ohne grüne Tests
- **Git Branch**: Jedes Update auf eigenem Branch
- **Dokumentation**: Inventory MUSS aktualisiert werden
