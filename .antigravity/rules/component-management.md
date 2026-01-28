# Component Management Rules

Globale Workspace-Rules für das Komponenten-Management.

---

## Grundprinzipien

1. **Web-Recherche ist MANDATORY** - Keine Updates ohne Online-Verifizierung
2. **Kompatibilität zuerst** - Immer Matrix konsultieren
3. **Tests müssen grün sein** - Keine Updates ohne passing Tests
4. **Dokumentation ist Pflicht** - Jedes Update wird dokumentiert

---

## Workflow (7 Phasen)

### Phase 1: Anforderung verstehen

```
Checkliste:
- [ ] Was soll aktualisiert werden?
- [ ] Warum? (Security, Feature, Maintenance)
- [ ] Dringlichkeit? (P1, P2, P3)
```

### Phase 2: Recherche

```
MANDATORY Tools:
- search_web "[component] latest version [year]"
- search_web "[component] breaking changes [old] to [new]"
- read_url_content "[official changelog URL]"
```

### Phase 3: Kompatibilitäts-Check

```
Checkliste:
- [ ] COMPATIBILITY_MATRIX.md konsultiert?
- [ ] Abhängigkeiten geprüft?
- [ ] Breaking Changes dokumentiert?
- [ ] Migration-Strategie klar?
```

### Phase 4: Vorbereitung

```bash
# Branch erstellen
git checkout -b update/[component]-[version]

# Backup
git stash  # Falls lokale Änderungen
```

### Phase 5: Implementation

```bash
# Package Update
pnpm update [package]@[version]

# Build verifizieren
pnpm build
pnpm typecheck
```

### Phase 6: Testing

```
Checkliste:
- [ ] Unit Tests: pnpm test
- [ ] E2E Tests: pnpm e2e
- [ ] Manual Tests: Agent Browser
- [ ] Keine Regressionen?
```

### Phase 7: Dokumentation & Commit

```bash
# COMPONENT_INVENTORY.md aktualisieren

# Commit
git add -A
git commit -m "chore(deps): update [component] to [version]

Breaking Changes: [NONE/LIST]
Migration Steps: [STEPS]
Tests: [STATUS]"

# Push
git push origin update/[component]-[version]
```

---

## Error Handling

### Bei Build-Fehler

```
1. Error analysieren
2. Wenn einfacher Fix: Fixen und weiter
3. Wenn komplex: Rollback und P3 setzen
```

### Bei Test-Fehler

```
1. Failing Tests analysieren
2. Wenn Selector-Problem: Page Objects updaten
3. Wenn Breaking Change: Rollback oder Migration
```

### Rollback-Prozess

```bash
# Branch verwerfen
git checkout main
git branch -D update/[component]-[version]

# Oder: Letzte Version wiederherstellen
pnpm update [package]@[last-working-version]
```

---

## Approval-Prozess

### P1 (Critical)
- Sofortige Implementierung
- Review nach Implementierung
- Keine Approval-Wartezeit

### P2 (Major)
- Plan vor Implementierung
- Team-Benachrichtigung
- PR-Review vor Merge

### P3 (Minor)
- Batch mit anderen P3
- Sprint-Planung
- Standard PR-Prozess

---

## Metrics & Reporting

### Zu tracken

| Metrik | Beschreibung | Ziel |
|--------|--------------|------|
| Update Frequency | Updates pro Monat | 4-8 |
| P1 Response Time | Zeit bis P1 gelöst | <24h |
| Test Coverage | E2E Test Coverage | >80% |
| Rollback Rate | Rollbacks pro Monat | <1 |

### Wöchentliches Audit

```
Jeden Montag:
1. Component Audit durchführen
2. COMPONENT_INVENTORY.md aktualisieren
3. P1-Updates identifizieren
4. Sprint-Planung für P2/P3
```

---

## Integration mit Skills

### component-updater

```
"Update [component] mit dem component-updater Skill"
```

### web-researcher

```
"Recherchiere Breaking Changes für [component] [version]
mit dem web-researcher Skill"
```

### agent-browser-testing

```
"Teste [feature] nach dem [component] Update
mit dem agent-browser-testing Skill"
```

---

## Verbotene Aktionen

❌ Updates ohne Web-Recherche
❌ Updates ohne grüne Tests
❌ Direkter Push zu main
❌ Updates ohne Dokumentation
❌ Ignorieren von Breaking Changes
❌ Multiple Major Updates gleichzeitig

---

## Erlaubte Shortcuts

✅ Batch-Update von Minor-Versionen
✅ Automatische DevDep-Updates (Dependabot)
✅ Skip von Test-Framework Updates (wenn Tests grün)
✅ P3 in Sprint-Batches gruppieren
