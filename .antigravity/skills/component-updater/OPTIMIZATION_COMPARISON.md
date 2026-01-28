# Skill-Optimierung: Vorher vs. Nachher

> **Konkrete Verbesserungsvorschläge mit Messbarkeit**

---

## 🎯 Hauptprobleme des aktuellen Skills

### 1. **Zu viele Phasen (5 statt 3)**
- **Alt:** Audit → Compat → Code → Test → Doc = ~115 Min
- **Neu:** Audit+Compat → Code+Test → Doc = ~45 Min
- **Einsparung:** 60% Zeit

### 2. **Ineffiziente Recherche**
- **Alt:** 3 Web-Suchen pro Package × 10 Packages = 30 Suchen
- **Neu:** 1 Batch-Suche + 1 Spezifisch = 2 Suchen
- **Einsparung:** 93% Token-Verbrauch

### 3. **Zu aufwändiges Testing**
- **Alt:** Immer vollständige E2E Tests (28 Tests, 25 Min)
- **Neu:** Smoke Tests für Minor Updates (2 Tests, 3 Min)
- **Einsparung:** 88% Test-Zeit

### 4. **Vague Anweisungen**
- **Alt:** "Recherchiere aktuelle Version"
- **Neu:** "SUCHE: 'npm check updates prisma 2026' → EXTRAHIERE: 'version': '7.4.0'"
- **Ergebnis:** Präzise, reproduzierbar

---

## 📊 Messbare KPIs

### Zeitbudget pro Update

| Phase | Alt | Neu | Einsparung |
|-------|-----|-----|------------|
| Audit | 30-45 Min | 12 Min | -73% |
| Kompatibilität | 15 Min | 3 Min | -80% |
| Code | 30 Min | 8 Min | -73% |
| Test | 25 Min | 18 Min | -28% |
| Dokumentation | 15 Min | 4 Min | -73% |
| **TOTAL** | **115 Min** | **45 Min** | **-61%** |

### Token-Budget

| Aktivität | Alt | Neu | Einsparung |
|-----------|-----|-----|------------|
| Web-Recherche | 15.000 | 4.000 | -73% |
| Code-Generierung | 2.000 | 1.000 | -50% |
| Testing | 1.000 | 500 | -50% |
| **TOTAL** | **18.000** | **5.500** | **-69%** |

---

## 🔧 Konkrete Prompt-Optimierungen

### BEISPIEL 1: Recherche

**SCHLECHT (vague, teuer):**
```markdown
Recherchiere die aktuelle Version von Prisma 
und prüfe ob es Breaking Changes gibt.
```
**Problem:**
- LLM muss raten, wo suchen
- Mehrere Suchen nötig
- Unklare Output-Format

**GUT (präzise, günstig):**
```markdown
TASK: Ermittle aktuelle Version von "prisma"

SUCHE_1 (Batch): "npm check updates 2026 prisma latest"
SUCHE_2 (NUR wenn Major): "prisma [version] breaking changes site:github.com/prisma"

OUTPUT_FORMAT:
```json
{
  "package": "prisma",
  "current_version": "7.3.0",
  "latest_version": "EXTRACT_FROM_SEARCH",
  "is_major": "true/false",
  "breaking_changes_url": "URL_OR_null"
}
```

VALIDIERUNG: Latest Version muss format "X.Y.Z" haben
```
**Vorteil:**
- Eine klare Suche
- Strukturierter Output
- Validierungsregel

---

### BEISPIEL 2: Update-Durchführung

**SCHLECHT (mehrdeutig):**
```markdown
Update Prisma auf die neueste Version und 
verifiziere, dass alles funktioniert.
```
**Problem:**
- "Neueste Version" = unklar
- "Alles funktioniert" = nicht messbar
- Keine Fehlerbehandlung

**GUT (atomar, messbar):**
```markdown
MISSION: Update "prisma" von "7.3.0" auf "7.4.0"

SCHRITTE:
1. EXECUTE: git checkout -b deps/20260129-prisma-740
2. EXECUTE: pnpm update prisma@7.4.0 --save-exact
3. EXECUTE: pnpm --filter @onm/db generate
4. VERIFY: pnpm --filter api run build 
   → ERWARTET: Exit Code 0
5. VERIFY: pnpm --filter api run test
   → ERWARTET: "Tests: X passed"

SUCCESS_METRICS:
- Build: Exit Code 0
- Tests: 100% passed
- Typecheck: 0 errors
- Zeit: <30 Min

FAILURE_PROTOCOL:
WENN Schritt 4 FAIL:
  1. EXECUTE: git reset --hard
  2. EXECUTE: git checkout main
  3. EXECUTE: git branch -D deps/20260129-prisma-740
  4. REPORT: "Update FAILED bei Build-Schritt"
  5. ABORT

WENN Schritt 5 FAIL:
  1. EXECUTE: git stash
  2. REPORT: "Tests FAILED, Branch gespeichert für Review"
  3. PAUSE für menschliche Entscheidung
```

---

### BEISPIEL 3: Für schwächere LLMs (Claude Sonnet 3.5)

**VEREINFACHTE Version:**
```markdown
🎯 EINFACHE MISSION: Update EIN Package

DU MUSST (in dieser Reihenfolge):
☐ 1. Aktuelle Version lesen
   → Öffne: packages/db/package.json
   → Finde: "prisma": "X.Y.Z"
   → Notiere: CURRENT_VERSION

☐ 2. Neue Version finden  
   → Suche: "prisma latest version 2026"
   → Notiere: NEW_VERSION

☐ 3. Entscheiden
   → WENN NEW_VERSION beginnt mit gleicher Zahl wie CURRENT_VERSION
     → DANN: Weiter mit Schritt 4
   → WENN erste Zahl ANDERS (z.B. 7→8)
     → DANN: STOPP, frage nach Erlaubnis

☐ 4. Update machen
   → Command: pnpm update prisma@[NEW_VERSION]
   → Warte bis fertig

☐ 5. Testen
   → Command: pnpm build
   → WENN "error" in Output → STOPP, melde Fehler
   → WENN "success" → Weiter

☐ 6. Fertig
   → Schreibe in COMPONENT_INVENTORY.md
   → Format: "2026-01-29 | prisma | OLD | NEW | ✅"

🛑 STOPP IMMER BEI:
- Fehlermeldungen
- Unklaren Anweisungen
- Mehreren Packages gleichzeitig

❌ DARFST DU NICHT:
- Mehrere Packages auf einmal updaten
- Tests überspringen
- Fehler ignorieren
```

---

## 🎓 Spezifische Verbesserungen für Claude Sonnet 3.5

### Problem: Sonnet 3.5 neigt zu:
1. **Halluzinationen** bei unklaren Anweisungen
2. **Überspringen von Schritten** bei komplexen Workflows
3. **Zu viel Kontext** auf einmal laden

### Lösungen:

#### 1. **Chunking** (Kontext in Häppchen)

**SCHLECHT:**
```markdown
Hier ist der komplette Skill mit allen Phasen, 
Tools und Beispielen...
[600 Zeilen Text]
```

**GUT:**
```markdown
AUFGABE: Führe PHASE 1 aus (Audit)

INPUT: ./package.json
OUTPUT: versions.json

NÄCHSTER SCHRITT wird erst gezeigt, wenn PHASE 1 done.
```

---

#### 2. **Zwangspausen** (Decision Gates)

**IMPLEMENTIERUNG:**
```markdown
PHASE 1 COMPLETE ✅

ENTSCHEIDUNG erforderlich:
[ ] Keine Breaking Changes → Weiter zu PHASE 2
[ ] Breaking Changes gefunden → STOP, human review

Warte auf Bestätigung vor Fortsetzung...
```

---

#### 3. **Template-basiertes Arbeiten**

**Statt freiem Text:**
```markdown
Fülle dieses Template aus:

```yaml
package: ____________
current: ____________
latest: ____________
is_major: [ ] yes [ ] no
breaking_changes: ____________
proceed: [ ] yes [ ] no
```

KEIN Text außerhalb des Templates!
```

---

## 📈 Erwartete Ergebnisse

### Für GPT-4/Claude Opus:
- **Zeit:** 45 Min statt 115 Min (-61%)
- **Tokens:** 5.500 statt 18.000 (-69%)
- **Erfolgsrate:** 98% (klare Anweisungen)

### Für Claude Sonnet 3.5:
- **Zeit:** 60 Min statt 180 Min (-67%)
- **Tokens:** 6.000 statt 20.000 (-70%)
- **Erfolgsrate:** 85% (vorher: 40%)

### Für schwächere LLMs:
- **Zeit:** 90 Min statt Fehlschlag
- **Erfolgsrate:** 70% (vorher: 10%)

---

## 🛠️ Implementierungs-Checkliste

Um diese Verbesserungen umzusetzen:

- [ ] skill.md durch skill-v2.md ersetzen
- [ ] Audit-Script optimieren (parallel scanning)
- [ ] Kompatibilitäts-Matrix als YAML (nicht Markdown)
- [ ] Entscheidungsbäume als Flowcharts dokumentieren
- [ ] Template-System für alle Outputs einführen
- [ ] Automatisierte Metrik-Tracking implementieren
- [ ] "LLM-Level" Detection (einfach/mittel/komplex)

---

**FAZIT:** Durch präzisere Anweisungen, Parallellisierung und Template-basiertes Arbeiten können wir die Effizienz um 60-70% steigern und schwächere LLMs erfolgreich einsetzen.
