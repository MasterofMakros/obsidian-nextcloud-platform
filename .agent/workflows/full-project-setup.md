---
description: Vollständiges Projekt-Setup von GitHub mit schrittweiser Validierung
---

# Obsidian Nextcloud Media Platform - Complete Setup Workflow

Dieser Workflow führt durch das komplette Setup des Projekts von einem frischen GitHub-Clone bis zur laufenden Plattform im Browser. Jeder Schritt wird validiert, bevor zum nächsten übergegangen wird.

## Voraussetzungen prüfen

1. Prüfe, ob alle benötigten Tools installiert sind:
```powershell
node --version   # Erwartet: v20+
pnpm --version   # Erwartet: v9+
docker --version # Erwartet: Docker 24+
git --version    # Erwartet: git 2.40+
```

Falls ein Tool fehlt, informiere den User und stoppe.

---

## Phase 1: Repository klonen

// turbo
2. Klone das Repository in einen neuen Ordner:
```powershell
git clone https://github.com/MasterofMakros/obsidian-nextcloud-platform.git
cd obsidian-nextcloud-platform
```

3. Prüfe, dass alle erwarteten Ordner existieren:
```powershell
dir apps
dir packages
dir infra
```
Erwartet: `apps/api`, `apps/web`, `apps/worker`, `packages/db`, `packages/design-tokens`, `infra/docker-compose.yml`

---

## Phase 2: Dependencies installieren

// turbo
4. Installiere alle Dependencies:
```powershell
pnpm install
```

5. **Validierung**: Prüfe, dass `node_modules` erstellt wurde und keine Fehler auftraten.
```powershell
dir node_modules
```

---

## Phase 3: Entwicklungs-Infrastruktur starten (Docker)

6. Starte nur die Basis-Infrastruktur (Postgres, Redis):
```powershell
docker compose -f infra/docker-compose.yml up -d postgres redis
```

7. **Validierung**: Warte auf Healthchecks und prüfe Container-Status:
```powershell
docker compose -f infra/docker-compose.yml ps
```
Erwartet: `postgres` und `redis` sind `healthy` oder `running`.

---

## Phase 4: Datenbank Setup

// turbo
8. Generiere den Prisma Client:
```powershell
pnpm --filter @onm/db exec prisma generate --schema=prisma/schema.prisma
```

// turbo
9. Führe die Migrationen aus (erstellt Tabellen):
```powershell
pnpm --filter @onm/db exec prisma migrate deploy
```

Falls Migration-Fehler: Prüfe `DATABASE_URL` in `.env` und ob Postgres läuft.

10. **Validierung**: Prüfe, dass Tabellen erstellt wurden:
```powershell
pnpm --filter @onm/db exec prisma db pull
```
Erwartet: Keine Fehler, Schema wird gelesen.

---

## Phase 5: Shared Packages bauen & testen

// turbo
11. Baue das Design-Tokens Paket:
```powershell
pnpm --filter @onm/design-tokens build
```

12. **Validierung**: Prüfe, dass Output existiert:
```powershell
dir packages/design-tokens/dist
```
Erwartet: `variables.css` existiert.

// turbo
13. Führe DB-Paket Tests aus:
```powershell
pnpm --filter @onm/db test
```

**Bei Fehlern**: Analysiere die Testausgabe, behebe den Fehler, und wiederhole diesen Schritt.

---

## Phase 6: API bauen & testen

// turbo
14. Führe API Unit-Tests aus:
```powershell
pnpm --filter api test
```

**Bei Fehlern**: Analysiere die Testausgabe, behebe den Fehler, und wiederhole diesen Schritt.

// turbo
15. Baue die API:
```powershell
pnpm --filter api build
```

16. **Validierung**: Prüfe, dass `dist` erstellt wurde:
```powershell
dir apps/api/dist
```
Erwartet: `index.js` und weitere Dateien existieren.

---

## Phase 7: Worker bauen & testen

// turbo
17. Führe Worker Unit-Tests aus:
```powershell
pnpm --filter worker test
```

**Bei Fehlern**: Analysiere die Testausgabe, behebe den Fehler, und wiederhole diesen Schritt.

// turbo
18. Baue den Worker:
```powershell
pnpm --filter worker build
```

19. **Validierung**: Prüfe, dass `dist` erstellt wurde:
```powershell
dir apps/worker/dist
```

---

## Phase 8: Web-App bauen & testen

// turbo
20. Führe Web Unit-Tests aus (falls vorhanden):
```powershell
pnpm --filter web test
```

// turbo
21. Baue die Web-App:
```powershell
pnpm --filter web build
```

22. **Validierung**: Prüfe, dass `.next` erstellt wurde:
```powershell
dir apps/web/.next
```

---

## Phase 9: TypeScript & Lint Checks

// turbo
23. Führe TypeScript-Check über alle Packages aus:
```powershell
pnpm run typecheck
```

// turbo
24. Führe Linting aus:
```powershell
pnpm run lint
```

**Bei Fehlern**: Behebe die gemeldeten Probleme und wiederhole.

---

## Phase 10: Integration Tests

25. Starte alle Services im Entwicklungsmodus (parallel in separaten Terminals):

Terminal 1 - API:
```powershell
pnpm --filter api dev
```

Terminal 2 - Worker:
```powershell
pnpm --filter worker dev
```

Terminal 3 - Web:
```powershell
pnpm --filter web dev
```

26. **Validierung**: Prüfe, dass alle Services laufen:
- API: http://localhost:3001/health sollte `{"status":"ok"}` zurückgeben
- Web: http://localhost:3000 sollte die Landing Page zeigen

// turbo
27. Führe E2E-Tests aus:
```powershell
pnpm run test:e2e
```

**Bei Fehlern**: Analysiere Screenshots in `test-results/`, behebe Fehler, wiederhole.

---

## Phase 11: Docker Build Validierung

// turbo
28. Baue alle Docker Images lokal:
```powershell
docker compose -f infra/docker-compose.yml build
```

29. **Validierung**: Prüfe, dass alle Images erstellt wurden:
```powershell
docker images | Select-String "infra-"
```
Erwartet: `infra-api`, `infra-worker`, `infra-web` vorhanden.

---

## Phase 12: Vollständiger Stack-Test

30. Stoppe alle laufenden Dev-Server und starte den vollständigen Stack:
```powershell
docker compose -f infra/docker-compose.yml up -d
```

31. **Validierung**: Prüfe Container-Status:
```powershell
docker compose -f infra/docker-compose.yml ps
```
Erwartet: Alle Container `running` oder `healthy`.

32. Prüfe Logs auf Fehler:
```powershell
docker compose -f infra/docker-compose.yml logs --tail=50
```

---

## Phase 13: Browser-Test

33. Öffne die Plattform im Browser:
- **Landing Page**: http://localhost:3000
- **Pricing Page**: http://localhost:3000/pricing
- **API Health**: http://localhost:3001/health

34. **Manuelle Validierung**:
- [ ] Landing Page lädt ohne Fehler
- [ ] Alle Bilder werden angezeigt
- [ ] Navigation funktioniert
- [ ] Pricing Page zeigt Preise
- [ ] Checkout-Button ist klickbar (leitet zu Stripe weiter wenn konfiguriert)

---

## Abschluss

Wenn alle Schritte erfolgreich waren:
- ✅ Projekt ist vollständig aufgesetzt
- ✅ Alle Tests bestehen
- ✅ Docker-Images sind gebaut
- ✅ Plattform läuft im Browser

Bei Fehlern in einem Schritt:
1. Stoppe den Workflow
2. Analysiere den Fehler
3. Behebe das Problem
4. Wiederhole den fehlgeschlagenen Schritt
5. Fahre erst nach Erfolg fort

---

## Cleanup (Optional)

Zum Zurücksetzen der Umgebung:
```powershell
docker compose -f infra/docker-compose.yml down -v
pnpm store prune
Remove-Item -Recurse -Force node_modules, apps/*/node_modules, packages/*/node_modules
```
