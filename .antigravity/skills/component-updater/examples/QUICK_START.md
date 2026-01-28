# Quick Start Guide 🚀

5-Minuten Setup für den Component Updater Skill.

---

## Schritt 1: Erstes Audit (2 Min)

**Prompt:**
```
Führe einen Component Audit durch mit Web-Recherche
und erstelle COMPONENT_INVENTORY.md
```

**Was passiert:**
1. Agent scannt `package.json` in allen Apps
2. Web-Recherche für jede Dependency
3. Erstellt `COMPONENT_INVENTORY.md` mit Prioritäten

---

## Schritt 2: Inventory prüfen (1 Min)

Öffne `.antigravity/COMPONENT_INVENTORY.md`:

```markdown
## Priority 1 (Sofort)
| Package | Current | Latest | Breaking? |
|---------|---------|--------|-----------|
| fastify | 4.21.0  | 5.2.0  | YES ⚠️    |

## Priority 2 (Diese Woche)
| Package | Current | Latest | Breaking? |
|---------|---------|--------|-----------|
| prisma  | 5.7.0   | 5.13.0 | NO ✅     |
```

---

## Schritt 3: Erstes Update (2 Min)

**Prompt:**
```
Update Prisma zur neuesten Version
mit dem component-updater Skill
```

**Ausführung:**
1. ✅ Web-Recherche: "Prisma latest version"
2. ✅ Compat-Check: Matrix konsultieren
3. ✅ Code Update: pnpm update prisma
4. ✅ Tests: Playwright E2E
5. ✅ Dokumentation: Inventory aktualisiert

---

## Workflow Templates

### Template 1: Security Update
```
Update [PACKAGE] wegen Security Issue
CVE: [CVE-NUMBER]
Priorisiere Kompatibilität!
```

### Template 2: Major Version
```
Update [PACKAGE] von [OLD] zu [NEW]
Führe Breaking Changes Analyse durch
und erstelle Migration-Plan
```

### Template 3: Bulk Update
```
Update alle P2-Komponenten aus COMPONENT_INVENTORY.md
Starte mit den Komponenten ohne Breaking Changes
```

### Template 4: Wöchentliches Audit
```
Führe wöchentliches Component Audit durch
Aktualisiere COMPONENT_INVENTORY.md
Identifiziere neue P1-Updates
```

---

## Priority Levels erklärt

### P1 - Sofort (24h)
- Security Vulnerabilities
- End-of-Life Versionen
- Build-Blocker

### P2 - Diese Woche
- Major Versions mit wichtigen Features
- Performance Improvements
- Bug Fixes für bekannte Issues

### P3 - Nächster Sprint
- Minor Version Updates
- Dev Dependencies
- Nice-to-have Features

---

## Häufige Fehler & Lösungen

### Fehler 1: "Breaking Changes detected"
```
# Agent pausiert und fragt nach

Lösung: 
1. COMPATIBILITY_MATRIX.md prüfen
2. Migration Guide lesen
3. Entscheiden: Jetzt oder später?
```

### Fehler 2: "Build failed after update"
```
# TypeScript Errors

Lösung:
1. pnpm typecheck - Errors analysieren
2. Types aktualisieren: @types/[package]
3. Oder: Rollback mit git checkout
```

### Fehler 3: "Tests failing"
```
# E2E Tests rot

Lösung:
1. Playwright Report öffnen
2. Page Object Selektoren prüfen
3. UI-Änderungen nachziehen
```

---

## Checkliste vor jedem Update

- [ ] Branch erstellt? `git checkout -b update/[pkg]-[ver]`
- [ ] Web-Recherche durchgeführt?
- [ ] COMPATIBILITY_MATRIX konsultiert?
- [ ] Build erfolgreich?
- [ ] Tests grün?
- [ ] COMPONENT_INVENTORY.md aktualisiert?
- [ ] Git Commit mit Details?

---

## Nächste Schritte

1. **Heute**: Erstes Audit durchführen
2. **Diese Woche**: Ein P2-Update machen
3. **Routine**: Montags Audit einplanen

---

## Hilfe

- [README.md](../README.md) - Skill-Überblick
- [skill.md](../skill.md) - Vollständige Phasen
- [COMPATIBILITY_MATRIX.md](../references/COMPATIBILITY_MATRIX.md) - Abhängigkeiten
