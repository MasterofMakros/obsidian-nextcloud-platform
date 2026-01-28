# Integration Guide

Vollständige Anleitung zur Integration des Component Updater Skill Systems.

---

## Überblick

Das Component Updater System besteht aus:

```
.antigravity/
├── skills/
│   └── component-updater/
│       ├── skill.md            # Hauptskill
│       ├── README.md           # Dokumentation
│       ├── examples/           # Templates
│       ├── scripts/            # Automatisierung
│       └── references/         # Kompatibilität
├── rules/
│   └── component-management.md # Globale Rules
├── COMPONENT_INVENTORY.md      # Status-Tracking
├── INTEGRATION_GUIDE.md        # Diese Datei
└── SKILL_SYSTEM_OVERVIEW.md    # Architektur
```

---

## Phase 1: Setup (15 Min)

### 1.1 Dateien prüfen

```bash
# Alle Dateien vorhanden?
ls -la .antigravity/
ls -la .antigravity/skills/component-updater/
```

### 1.2 Audit-Script ausführbar machen

```bash
chmod +x .antigravity/skills/component-updater/scripts/audit-components.sh
```

### 1.3 Erstes Audit durchführen

```
Prompt: "Führe einen Component Audit durch und erstelle COMPONENT_INVENTORY.md"
```

---

## Phase 2: Erstes Update (30 Min)

### 2.1 Inventory prüfen

Öffne `.antigravity/COMPONENT_INVENTORY.md` und wähle ein P3-Update.

### 2.2 Update durchführen

```
Prompt: "Update [PACKAGE] zur Version [VERSION] mit dem component-updater Skill"
```

### 2.3 Erfolgreich?

- ✅ Tests grün → Commit
- ❌ Tests rot → Rollback, P3 behalten

---

## Phase 3: Routine etablieren (Ongoing)

### Montag-Audit

```
"Führe wöchentliches Component Audit durch
Aktualisiere COMPONENT_INVENTORY.md
Melde neue P1-Updates"
```

### Sprint-Planung

```
"Welche P2-Updates sollten wir diesen Sprint machen?
Priorisiere nach Abhängigkeiten"
```

---

## Prompt Templates

### Audit

```markdown
Führe einen vollständigen Component Audit durch:
1. Scanne alle package.json Dateien
2. Recherchiere aktuelle Versionen online
3. Erstelle/Update COMPONENT_INVENTORY.md
4. Identifiziere P1/P2/P3 Updates
```

### Einzelnes Update

```markdown
Update [PACKAGE] zur neuesten Version:
1. Recherchiere aktuelle Version und Breaking Changes
2. Prüfe COMPATIBILITY_MATRIX.md
3. Führe Update durch
4. Verifiziere Build und Tests
5. Dokumentiere in COMPONENT_INVENTORY.md
```

### Bulk Update

```markdown
Update alle P2-Komponenten aus COMPONENT_INVENTORY.md:
1. Starte mit Komponenten ohne Breaking Changes
2. Teste nach jedem Update
3. Dokumentiere Fortschritt
```

### Security Update

```markdown
DRINGEND: Security Update für [PACKAGE]
CVE: [CVE-NUMBER]
1. Recherchiere betroffene Versionen
2. Update auf gepatchte Version
3. Verifiziere Fix
4. Dokumentiere mit CVE-Referenz
```

---

## Troubleshooting

### Problem: Skill wird nicht erkannt

```
Lösung:
1. Workspace neu laden
2. skill.md prüfen (YAML Header korrekt?)
3. .antigravity Ordner im Workspace-Root?
```

### Problem: Audit-Script funktioniert nicht

```
Lösung:
1. chmod +x audit-components.sh
2. Mit bash ausführen: bash audit-components.sh
3. jq installiert? (für JSON-Parsing)
```

### Problem: Breaking Changes nicht erkannt

```
Lösung:
1. COMPATIBILITY_MATRIX.md aktuell?
2. Web-Recherche durchgeführt?
3. Changelog gelesen?
```

### Problem: Tests schlagen fehl nach Update

```
Lösung:
1. Playwright Report öffnen
2. Selektoren in Page Objects prüfen
3. UI-Änderungen nachziehen
4. Oder: Rollback
```

---

## Best Practices

### Do's ✅

- Wöchentliche Audits
- P1 sofort bearbeiten
- Breaking Changes dokumentieren
- Tests vor Commit
- Branches für Updates

### Don'ts ❌

- Ohne Recherche updaten
- Multiple Major Updates gleichzeitig
- main direkt pushen
- Tests ignorieren
- Dokumentation skippen

---

## Integration mit CI/CD

### GitHub Actions

Das Projekt hat bereits `.github/workflows/e2e-tests.yml`.

Nach jedem Update werden automatisch ausgeführt:
- Prisma Client Generation
- Build
- E2E Tests
- Report Upload

### Pre-Commit Hook (Optional)

```bash
# .husky/pre-commit
pnpm typecheck
pnpm test
```

---

## Links

### Skill-Dateien

- [skill.md](./skills/component-updater/skill.md)
- [README.md](./skills/component-updater/README.md)
- [QUICK_START.md](./skills/component-updater/examples/QUICK_START.md)
- [COMPATIBILITY_MATRIX.md](./skills/component-updater/references/COMPATIBILITY_MATRIX.md)

### Rules

- [component-management.md](./rules/component-management.md)

### Output

- [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)

---

## Support

Bei Problemen:

1. Troubleshooting-Sektion prüfen
2. QUICK_START.md lesen
3. Skills mit Debug-Output testen
4. Web-Recherche für spezifische Errors
