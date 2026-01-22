# DEPLOYMENT.md

**obsidian-nextcloud-platform – Commercial Operations Manual**

---

## 0. Zweck & Geltungsbereich

Dieses Dokument beschreibt den **Deployment-, Betriebs- und Wartungsprozess** der Plattform in einer **kommerziellen Umgebung**.

Ziele:

* Reproduzierbare Deployments (immutable Images)
* Sichere Stage → Prod Promotion
* Schnelle Rollbacks ohne Rebuild
* Klare Verantwortlichkeiten für Secrets & Keys

Nicht enthalten:

* Feature-Entwicklung
* Architektur-Design (siehe `ARCHITECTURE.md`, falls vorhanden)

---

## 1. Deployment-Modell (Überblick)

### 1.1 Grundprinzip

* **Immutable Container Images**
* Images werden **einmal gebaut** (CI) und über **Stages promotet**
* Server **bauen nichts**, sie deployen nur

### 1.2 Registry

* GitHub Container Registry (GHCR)
* Namespace:

  ```
  ghcr.io/<owner>/<repo>/<service>
  ```

Beispiel:

```
ghcr.io/masterofmakros/obsidian-nextcloud-platform/api
ghcr.io/masterofmakros/obsidian-nextcloud-platform/worker
```

---

## 2. Image-Tagging & Promotion Strategy

### 2.1 Tags

| Tag          | Bedeutung                                  |
| ------------ | ------------------------------------------ |
| `:<git-sha>` | **Immutable**, referenzierbar, auditierbar |
| `:stage`     | Aktuell freigegebener Stage-Stand          |
| `:latest`    | **nicht empfohlen** für produktive Nutzung |

### 2.2 Regeln (verbindlich)

* **Stage** darf `:stage` verwenden
* **Production** MUSS einen **SHA-Tag** verwenden
* **Rollback** = Tag zurückdrehen (kein Rebuild)

---

## 3. CI/CD – Build & Push

### 3.1 Auslöser

* Push auf `main`
* Manueller Trigger (`workflow_dispatch`)

### 3.2 Ergebnis eines CI-Runs

* API Image gebaut & gepusht
* Worker Image gebaut & gepusht
* Tags:

  * `:<git-sha>`
  * `:stage`

### 3.3 Quelle

Siehe: `.github/workflows/docker-build.yml`

---

## 4. Staging Deployment

### 4.1 Voraussetzungen (Server)

* Linux (Ubuntu/Debian empfohlen)
* Docker ≥ 24
* Docker Compose Plugin
* Öffentlich erreichbare Domain
* Ports 80 / 443 offen

Installation:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```

---

### 4.2 GHCR Login (einmalig)

```bash
docker login ghcr.io
# Username: GitHub Username
# Password: GitHub Personal Access Token (read:packages)
```

---

### 4.3 Environment File (`.env.stage`)

Pflichtvariablen (Auszug):

```bash
ROOT_DOMAIN=example.com
LETSENCRYPT_EMAIL=ops@example.com

DATABASE_URL=postgresql://...
REDIS_URL=redis://redis:6379

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

CORS_ALLOW_ORIGINS=https://example.com

LICENSE_PRIVATE_KEY_B64=...
LICENSE_PUBLIC_KEY_B64=...
LICENSE_KEY_VERSION=1

ADMIN_API_KEY=...
```

---

### 4.4 Start

```bash
docker compose \
  --env-file .env.stage \
  -f docker-compose.stage.yml \
  up -d
```

---

## 5. Smoke Verification (Pflicht)

### 5.1 API

```bash
curl https://api.example.com/health
curl https://api.example.com/readyz
curl https://api.example.com/metrics | head
```

Erwartet:

* `health` → 200
* `readyz` → 200
* `metrics` → Prometheus Text

---

### 5.2 Worker

```bash
docker compose exec worker wget -qO- http://localhost:9100/metrics | head
```

---

### 5.3 Stripe Webhook (Test Mode)

```bash
stripe listen --forward-to https://api.example.com/stripe/webhook
stripe trigger checkout.session.completed
```

Erwartet:

* Webhook akzeptiert
* Worker verarbeitet Event
* Lizenzstatus aktualisiert

---

## 6. Rollback Procedure (kritisch)

### 6.1 Szenario

* Fehlerhafte Version in Stage oder Prod
* System soll **sofort** stabilisiert werden

### 6.2 Vorgehen

1. Letzten funktionierenden SHA identifizieren
2. Image-Referenz im Compose anpassen:

   ```yaml
   image: ghcr.io/.../api:<KNOWN_GOOD_SHA>
   ```
3. Redeploy:

   ```bash
   docker compose up -d
   ```

⏱ Rollback-Zeit: **< 2 Minuten**

Kein Rebuild. Kein CI. Kein Risiko.

---

## 7. Key & Secret Rotation

### 7.1 Stripe Keys

* Neue Keys in Stripe erzeugen
* `.env.stage` aktualisieren
* `docker compose up -d`
* Alte Keys **nach Verifikation** deaktivieren

---

### 7.2 License Signing Keys (Ed25519)

**Regel:** Keys sind versioniert.

```bash
LICENSE_KEY_VERSION=2
LICENSE_PRIVATE_KEY_B64=...
LICENSE_PUBLIC_KEY_B64=...
```

Ablauf:

1. Neues Keypair generieren
2. Neue Version deployen
3. Clients akzeptieren **alte + neue** Public Keys
4. Alte Version nach Grace-Period entfernen

---

### 7.3 Admin API Key

* Einfacher Austausch via ENV
* Kein DB-State betroffen

---

## 8. Observability & Betrieb

### 8.1 Metriken

* `/metrics` API
* `/metrics` Worker

Empfohlen:

* Prometheus Scrape
* Alerts:

  * RateLimitExceeded
  * Queue Lag
  * Worker Failures

---

### 8.2 Logs

* JSON
* Felder:

  * `service`
  * `event`
  * `context`

Keine PII.

---

## 9. Production Promotion (wenn relevant)

Empfohlenes Vorgehen:

1. Stage läuft stabil
2. SHA notieren
3. Prod-Compose referenziert **exakt diesen SHA**
4. Deploy
5. Smoke Tests wiederholen

---

## 10. Definition of Done (P2)

* [ ] CI baut & pusht Images
* [ ] Stage läuft stabil
* [ ] Health / Readyz / Metrics erreichbar
* [ ] Stripe Webhook getestet
* [ ] Rollback getestet
* [ ] Secrets dokumentiert

---

## 11. Status

> **Commercial Deployment Ready**

Dieses Dokument beschreibt einen **vollständig betrieblichen Zustand** der Plattform.
