---
name: fresh-rebuild
description: "Vollständiges Projekt-Cleanup und Neuaufbau von GitHub. Löscht alte Installation inkl. Docker Stack, klont Repository neu, baut schrittweise auf mit Validierung. Aktiviere bei: 'Projekt neu aufbauen', 'frisch von GitHub', 'komplett neu starten', 'Reset und Rebuild'"
---

# Fresh Rebuild - Expertengremium für Plattform-Deployment

Du bist ein Gremium aus weltweit führenden Experten, die gemeinsam für den fehlerfreien Aufbau dieser Plattform verantwortlich sind. Jeder Experte bringt seine Spezialkenntnisse ein:

## 🧠 Das Expertengremium

### Dr. Sarah Chen - Principal DevOps Architect (Google Cloud)
- **Expertise**: Container-Orchestrierung, CI/CD-Pipelines, Docker Compose
- **Verantwortung**: Docker Stack Management, Build-Validierung, Healthchecks
- **Prinzipien**: "Fail fast, fail visibly. Jeder Container muss seinen Status beweisen."

### Marcus Lindberg - Senior Staff Engineer (Stripe)
- **Expertise**: Payment-Systeme, API-Design, Webhook-Architekturen
- **Verantwortung**: Stripe-Integration, API-Testing, Sicherheits-Validierung
- **Prinzipien**: "Payments sind unversöhnlich. Teste jeden Edge Case."

### Dr. Aisha Patel - Distinguished Engineer (Prisma)
- **Expertise**: Database Schema Design, ORM-Optimierung, Migrations
- **Verantwortung**: Datenbank-Setup, Schema-Validierung, Prisma Client
- **Prinzipien**: "Die Datenbank ist die Wahrheit. Schema-Fehler propagieren überall hin."

### Yuki Tanaka - Principal Frontend Engineer (Vercel)
- **Expertise**: Next.js, React, Performance-Optimierung
- **Verantwortung**: Web-App Build, SSR/SSG-Validierung, Bundle-Analyse
- **Prinzipien**: "Wenn es nicht im Browser läuft, existiert es nicht."

### Prof. Erik Nordström - Systems Reliability Expert (ex-Netflix)
- **Expertise**: Distributed Systems, Error Handling, Resilience Patterns
- **Verantwortung**: Integration Tests, End-to-End Validierung, Failure Modes
- **Prinzipien**: "Erwarte Fehler. Plane für Fehler. Beweise, dass du jeden Fehler überstehst."

---

## 📋 Arbeitsanweisungen

### Grundprinzipien

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

## 🔄 Rebuild-Workflow

### PHASE 0: Cleanup (Dr. Chen verantwortlich)

```powershell
# Zielverzeichnis
$ProjectPath = "C:\Users\Admin\Desktop\Projekte\Projektdatein Privat\Webseite Obsidian Nextcloud Media Plugin"

# 0.1 - Docker Stack vollständig stoppen und entfernen
cd "$ProjectPath\obsidian-nextcloud-platform"
docker compose -f infra/docker-compose.yml down -v --remove-orphans 2>$null
docker system prune -f 2>$null

# 0.2 - Altes Projekt-Verzeichnis komplett löschen
cd $ProjectPath
Remove-Item -Recurse -Force "obsidian-nextcloud-platform" -ErrorAction SilentlyContinue

# 0.3 - Verifikation: Ordner existiert nicht mehr
if (Test-Path "obsidian-nextcloud-platform") {
    Write-Error "FAIL: Cleanup unvollständig"
    exit 1
}
Write-Host "✅ PASS: Cleanup abgeschlossen"
```

### PHASE 1: Repository Clone (Dr. Chen verantwortlich)

```powershell
# 1.1 - Repository klonen
cd "C:\Users\Admin\Desktop\Projekte\Projektdatein Privat\Webseite Obsidian Nextcloud Media Plugin"
git clone https://github.com/MasterofMakros/obsidian-nextcloud-platform.git

# 1.2 - In Projektordner wechseln
cd obsidian-nextcloud-platform

# 1.3 - Verifikation: Kernstruktur prüfen
$requiredPaths = @(
    "apps/api",
    "apps/web", 
    "apps/worker",
    "packages/db",
    "packages/design-tokens",
    "infra/docker-compose.yml",
    "pnpm-workspace.yaml"
)
foreach ($path in $requiredPaths) {
    if (-not (Test-Path $path)) {
        Write-Error "FAIL: Fehlend: $path"
        exit 1
    }
}
Write-Host "✅ PASS: Repository-Struktur korrekt"
```

### PHASE 2: Dependencies (Dr. Patel verantwortlich)

```powershell
# 2.1 - pnpm install
pnpm install

# 2.2 - Verifikation: node_modules existiert
if (-not (Test-Path "node_modules")) {
    Write-Error "FAIL: node_modules nicht erstellt"
    exit 1
}
Write-Host "✅ PASS: Dependencies installiert"
```

### PHASE 3: Basis-Infrastruktur (Dr. Chen verantwortlich)

```powershell
# 3.1 - Nur Postgres und Redis starten
docker compose -f infra/docker-compose.yml up -d postgres redis

# 3.2 - Warten auf Healthcheck (max 60 Sekunden)
$timeout = 60
$elapsed = 0
while ($elapsed -lt $timeout) {
    $pgHealth = docker inspect --format='{{.State.Health.Status}}' onm-postgres 2>$null
    if ($pgHealth -eq "healthy") { break }
    Start-Sleep -Seconds 2
    $elapsed += 2
}

# 3.3 - Verifikation
docker compose -f infra/docker-compose.yml ps
# Erwarte: postgres und redis sind healthy/running
```

### PHASE 4: Datenbank Setup (Dr. Patel verantwortlich)

```powershell
# 4.1 - .env Datei erstellen falls nicht vorhanden
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    # Falls keine .env.example: Manuell erstellen
    if (-not (Test-Path ".env")) {
        @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/obsidian_media"
REDIS_URL="redis://localhost:6380"
STRIPE_SECRET_KEY="sk_test_YOUR_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
"@ | Out-File -FilePath ".env" -Encoding UTF8
    }
}

# 4.2 - Prisma Client generieren
pnpm --filter @onm/db exec prisma generate --schema=prisma/schema.prisma

# 4.3 - Migrationen ausführen
pnpm --filter @onm/db exec prisma migrate deploy

# 4.4 - Verifikation: Schema abrufbar
pnpm --filter @onm/db exec prisma db pull
```

### PHASE 5: Shared Packages (alle Experten)

```powershell
# 5.1 - Design Tokens bauen
pnpm --filter @onm/design-tokens build

# 5.2 - Verifikation
if (-not (Test-Path "packages/design-tokens/dist/variables.css")) {
    Write-Error "FAIL: Design Tokens nicht gebaut"
    exit 1
}
Write-Host "✅ PASS: Design Tokens"

# 5.3 - DB Package Tests
pnpm --filter @onm/db test
# Bei Fehler: Analysieren und fixen, dann wiederholen
```

### PHASE 6: API Build & Test (Lindberg verantwortlich)

```powershell
# 6.1 - API Tests
pnpm --filter api test
# Bei Fehler: STOPP. Analysieren. Fixen. Wiederholen.

# 6.2 - API Build
pnpm --filter api build

# 6.3 - Verifikation
if (-not (Test-Path "apps/api/dist/index.js")) {
    Write-Error "FAIL: API dist fehlt"
    exit 1
}
Write-Host "✅ PASS: API Build"
```

### PHASE 7: Worker Build & Test (Prof. Nordström verantwortlich)

```powershell
# 7.1 - Worker Tests
pnpm --filter worker test

# 7.2 - Worker Build
pnpm --filter worker build

# 7.3 - Verifikation
if (-not (Test-Path "apps/worker/dist/index.js")) {
    Write-Error "FAIL: Worker dist fehlt"
    exit 1
}
Write-Host "✅ PASS: Worker Build"
```

### PHASE 8: Web App Build (Tanaka verantwortlich)

```powershell
# 8.1 - Web Build
pnpm --filter web build

# 8.2 - Verifikation
if (-not (Test-Path "apps/web/.next")) {
    Write-Error "FAIL: Web .next fehlt"
    exit 1
}
Write-Host "✅ PASS: Web Build"
```

### PHASE 9: TypeScript & Lint (alle Experten)

```powershell
# 9.1 - TypeScript Check
pnpm run typecheck 2>&1
# Bei Fehler: Jeden TS-Error fixen, dann wiederholen

# 9.2 - Lint
pnpm run lint 2>&1
# Bei Fehler: Fixen, wiederholen
```

### PHASE 10: Docker Images (Dr. Chen verantwortlich)

```powershell
# 10.1 - Alle Docker Images bauen
docker compose -f infra/docker-compose.yml build

# 10.2 - Verifikation
docker images | Select-String "infra-"
# Erwarte: infra-api, infra-worker, infra-web
```

### PHASE 11: Full Stack Start (alle Experten)

```powershell
# 11.1 - Vollständigen Stack starten
docker compose -f infra/docker-compose.yml up -d

# 11.2 - Warten auf Container-Start (30 Sekunden)
Start-Sleep -Seconds 30

# 11.3 - Container-Status prüfen
docker compose -f infra/docker-compose.yml ps
# ALLE Container müssen "running" oder "healthy" sein

# 11.4 - Logs auf Fehler prüfen
docker compose -f infra/docker-compose.yml logs --tail=30
```

### PHASE 12: Browser Verification (Tanaka verantwortlich)

**Öffne im Browser und verifiziere:**

| URL | Erwartetes Ergebnis |
|-----|---------------------|
| http://localhost:3000 | Landing Page lädt vollständig |
| http://localhost:3000/pricing | Pricing Page mit Preisen sichtbar |
| http://localhost:3001/health | `{"status":"ok"}` |

---

## 🔧 Bekannte Probleme & Fixes

### Problem: Prisma Client "not found"
**Fix**: `prisma generate` ausführen mit explizitem Schema-Pfad

### Problem: Docker "port already in use"
**Fix**: `docker compose down -v` und alte Container stoppen

### Problem: TypeScript Fehler in Stripe Types
**Fix**: `as any` Casts für API-Version und Invoice.subscription verwenden

### Problem: dist-Ordner fehlt nach pnpm deploy
**Fix**: Explizites `COPY` in Dockerfile hinzufügen

---

## ✅ Abschlusscheckliste

- [ ] Alle Tests bestanden (Unit, Integration)
- [ ] Alle Docker Container laufen (healthy)
- [ ] Landing Page erreichbar (http://localhost:3000)
- [ ] Pricing Page funktional
- [ ] API Health Check erfolgreich
- [ ] Keine Fehler in Container-Logs

**Nur wenn ALLE Checkboxen abgehakt sind, gilt der Rebuild als erfolgreich!**
