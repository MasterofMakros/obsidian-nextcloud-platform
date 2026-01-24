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
docker compose exec worker wget -qO- http://localhost:9110/metrics | head
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

## 11. Troubleshooting Guide

### 11.1 Common Issues

#### Issue: Docker Compose Fails to Start

**Symptoms:**
```bash
Error: Cannot start service api: driver failed programming external connectivity
```

**Cause:** Port already in use

**Solution:**
```bash
# Find process using port
sudo lsof -i :3011

# Kill process or change port in docker-compose.yml
sudo kill -9 <PID>
```

---

#### Issue: Database Connection Fails

**Symptoms:**
```
Error: Can't reach database server at localhost:5432
```

**Cause:** PostgreSQL not running or wrong credentials

**Solution:**
```bash
# Check if Postgres is running
docker compose ps postgres

# View Postgres logs
docker compose logs postgres

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT 1"
```

---

#### Issue: Health Check Returns 503

**Symptoms:**
```bash
$ curl https://api.example.com/health
503 Service Unavailable
```

**Cause:** Database or Redis unreachable

**Solution:**
```bash
# Check all services status
docker compose ps

# View API logs
docker compose logs api --tail 100

# Test database connectivity
docker compose exec api sh -c 'wget -qO- http://localhost:3011/health'
```

---

#### Issue: Stripe Webhooks Not Received

**Symptoms:**
- Checkout completed but no license created
- Worker not processing events

**Cause:** Webhook signature verification fails or wrong endpoint

**Solution:**
```bash
# 1. Check webhook endpoint in Stripe Dashboard
# Should be: https://api.example.com/stripe/webhook

# 2. Verify STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
echo $STRIPE_WEBHOOK_SECRET

# 3. Check worker logs
docker compose logs worker --tail 50

# 4. Test webhook manually
stripe trigger checkout.session.completed \
  --override checkout_session:customer_email=test@example.com
```

---

#### Issue: Images Not Pulling from GHCR

**Symptoms:**
```
Error: pull access denied for ghcr.io/...
```

**Cause:** Not authenticated or wrong credentials

**Solution:**
```bash
# Re-login to GHCR
docker logout ghcr.io
docker login ghcr.io

# Username: your GitHub username
# Password: GitHub Personal Access Token with read:packages scope

# Verify login
docker pull ghcr.io/masterofmakros/obsidian-nextcloud-platform/api:stage
```

---

#### Issue: Traefik SSL Certificate Fails

**Symptoms:**
```
SSL certificate problem: unable to get local issuer certificate
```

**Cause:** Let's Encrypt rate limit or DNS not propagated

**Solution:**
```bash
# 1. Check DNS propagation
dig api.example.com

# 2. View Traefik logs
docker compose logs traefik --tail 100

# 3. Force certificate renewal (after fixing DNS)
docker compose exec traefik rm -rf /letsencrypt/acme.json
docker compose restart traefik

# 4. If rate-limited, use staging server temporarily
# In docker-compose.yml:
# --certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory
```

---

### 11.2 Performance Issues

#### High API Latency

**Diagnosis:**
```bash
# Check Prometheus metrics
curl https://api.example.com/metrics | grep http_request_duration

# Check database query performance
docker compose exec postgres psql -U $DB_USER -d $DB_NAME -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
"
```

**Common Fixes:**
- Add database indexes (see PERFORMANCE_ANALYSIS.md)
- Increase connection pool size
- Enable Redis caching

---

#### Worker Queue Backlog

**Diagnosis:**
```bash
# Check queue depth
curl http://localhost:9110/metrics | grep queue_depth
```

**Solutions:**
```bash
# 1. Scale worker instances
docker compose up -d --scale worker=3

# 2. Increase concurrency (in worker config)
WORKER_CONCURRENCY=10

# 3. Check for failed jobs
docker compose exec redis redis-cli
> LLEN bull:stripe:failed
```

---

### 11.3 Emergency Procedures

#### Complete System Outage

**Steps:**
1. Check all service status:
   ```bash
   docker compose ps
   ```

2. Restart failed services:
   ```bash
   docker compose restart api worker
   ```

3. If still failing, rollback (see Section 6.2)

4. Notify users via status page

---

#### Data Corruption Detected

**Steps:**
1. **STOP all writes immediately:**
   ```bash
   docker compose stop api worker
   ```

2. Restore from backup:
   ```bash
   # Restore database
   psql $DATABASE_URL < backup_YYYYMMDD.sql
   ```

3. Verify data integrity:
   ```bash
   # Check license count
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM licenses;"
   ```

4. Restart services:
   ```bash
   docker compose up -d
   ```

---

#### Security Breach Detected

**Immediate Actions:**
1. Rotate all secrets (see Section 7)
2. Review access logs:
   ```bash
   docker compose logs api | grep "401\|403\|500"
   ```
3. Disable compromised API keys
4. Force password reset for affected users

---

## 12. Monitoring & Alerts

### Critical Alerts

Set up alerts for:

| Alert | Threshold | Action |
|-------|-----------|--------|
| API Error Rate | > 5% | Check logs, consider rollback |
| Database Connections | > 80% | Scale database or increase pool |
| Queue Depth | > 1000 | Scale workers |
| Disk Usage | > 85% | Clean up logs, expand storage |
| SSL Expiry | < 7 days | Check Let's Encrypt renewal |

### Health Check Schedule

```bash
# Add to cron (every 5 minutes)
*/5 * * * * curl -f https://api.example.com/health || systemctl restart docker-compose@platform
```

---

## 13. Status

> **Commercial Deployment Ready**

Dieses Dokument beschreibt einen **vollständig betrieblichen Zustand** der Plattform.
