# Setup-Phasen: Phase 1-13

> Extrahiert aus `full-project-setup.md` für modulare Struktur (Cole-Medin Style)

## Phase 1: Repository klonen

// turbo
```powershell
git clone https://github.com/MasterofMakros/obsidian-nextcloud-platform.git
cd obsidian-nextcloud-platform
```

**Validierung**:
```powershell
dir apps
dir packages
dir infra
```
Erwartet: `apps/api`, `apps/web`, `apps/worker`, `packages/db`, `packages/design-tokens`, `infra/docker-compose.yml`

---

## Phase 2: Dependencies installieren

// turbo
```powershell
pnpm install
```

**Validierung**:
```powershell
dir node_modules
```

---

## Phase 3: Entwicklungs-Infrastruktur starten

```powershell
docker compose -f infra/docker-compose.yml up -d postgres redis
```

**Validierung**:
```powershell
docker compose -f infra/docker-compose.yml ps
```
Erwartet: `postgres` und `redis` sind `healthy` oder `running`.

---

## Phase 4: Datenbank Setup

// turbo
```powershell
pnpm --filter @onm/db exec prisma generate --schema=prisma/schema.prisma
```

// turbo
```powershell
pnpm --filter @onm/db exec prisma migrate deploy
```

**Validierung**:
```powershell
pnpm --filter @onm/db exec prisma db pull
```

---

## Phase 5: Shared Packages bauen

// turbo
```powershell
pnpm --filter @onm/design-tokens build
```

**Validierung**:
```powershell
dir packages/design-tokens/dist
```
Erwartet: `variables.css` existiert.

// turbo
```powershell
pnpm --filter @onm/db test
```

---

## Phase 6: API bauen & testen

// turbo
```powershell
pnpm --filter api test
```

// turbo
```powershell
pnpm --filter api build
```

**Validierung**:
```powershell
dir apps/api/dist
```

---

## Phase 7: Worker bauen & testen

// turbo
```powershell
pnpm --filter worker test
```

// turbo
```powershell
pnpm --filter worker build
```

**Validierung**:
```powershell
dir apps/worker/dist
```

---

## Phase 8: Web-App bauen

// turbo
```powershell
pnpm --filter web test
```

// turbo
```powershell
pnpm --filter web build
```

**Validierung**:
```powershell
dir apps/web/.next
```

---

## Phase 9: TypeScript & Lint

// turbo
```powershell
pnpm run typecheck
```

// turbo
```powershell
pnpm run lint
```

---

## Phase 10: Integration Tests

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

**Validierung**:
- API: http://localhost:3001/health → `{"status":"ok"}`
- Web: http://localhost:3000 → Landing Page

// turbo
```powershell
pnpm run test:e2e
```

---

## Phase 11: Docker Build

// turbo
```powershell
docker compose -f infra/docker-compose.yml build
```

**Validierung**:
```powershell
docker images | Select-String "infra-"
```

---

## Phase 12: Vollständiger Stack-Test

```powershell
docker compose -f infra/docker-compose.yml up -d
```

**Validierung**:
```powershell
docker compose -f infra/docker-compose.yml ps
docker compose -f infra/docker-compose.yml logs --tail=50
```

---

## Phase 13: Browser-Test

| URL | Erwartung |
|-----|-----------|
| http://localhost:3000 | Landing Page lädt |
| http://localhost:3000/pricing | Preise sichtbar |
| http://localhost:3001/health | `{"status":"ok"}` |

**Checkliste**:
- [ ] Landing Page lädt ohne Fehler
- [ ] Navigation funktioniert
- [ ] Pricing Page zeigt Preise
- [ ] Checkout-Button klickbar

---

## Cleanup (Optional)

```powershell
docker compose -f infra/docker-compose.yml down -v
pnpm store prune
Remove-Item -Recurse -Force node_modules, apps/*/node_modules, packages/*/node_modules
```
