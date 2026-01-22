# Observability Spec (P1-4) – Commercial Grade

## 0. Ziele und Grundregeln

### Ziele
* **Blindflug vermeiden:** Betrieb muss über Metriken/Logs diagnosierbar sein.
* **SLO-Fähigkeit:** Mindestens Latenz/Fehlerquote/Queue-Lag messbar.
* **Low Cardinality:** Keine Labels mit hohem Variantenreichtum (z. B. licenseId, deviceIdHash).

### Regeln (nicht verhandelbar)
* **Kein PII** in Logs/Metrics (Email, Klartext-Lizenzkey, IP nur optional gehasht).
* **Labels low-cardinality**: `status`, `method`, `route`, `job_name`, `queue` ok.
* **`route` muss normalisiert** sein (Fastify route template, nicht raw URL).
* **Metrics Endpoint**: `/metrics` für API und Worker.
* **Health**: `/health` (liveness) und `/readyz` (readiness) für API; Worker hat `/health` optional, primär metrics.

---

## 1. Metrics (Prometheus)

### 1.1 Common Runtime Metrics (alle Services)
Soll über `prom-client` Standard Collectors kommen:
* `process_cpu_user_seconds_total`
* `process_cpu_system_seconds_total`
* `process_resident_memory_bytes`
* `nodejs_eventloop_lag_seconds`
* `nodejs_heap_size_total_bytes`, `nodejs_heap_size_used_bytes`
* `nodejs_active_handles_total`, `nodejs_active_requests_total`

**Implementation Note:** `collectDefaultMetrics({ register, prefix: "onm_" })` ist empfohlen.

### 1.2 API Metrics (`apps/api`)
**Namespace:** `onm_api_…`

#### HTTP Request Metrics
1. **Request Count**
   * Name: `onm_api_http_requests_total`
   * Labels: `method`, `route`, `status_code`

2. **Request Duration**
   * Name: `onm_api_http_request_duration_seconds`
   * Type: Histogram
   * Labels: `method`, `route`, `status_code`
   * Buckets: `[0.01, 0.025, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1, 2, 5]`

#### Licensing Metrics
3. **Activation Attempts**
   * Name: `onm_api_license_activations_total`
   * Labels: `result` (success|invalid_key|device_limit|revoked|error)

4. **Refresh Attempts**
   * Name: `onm_api_license_refreshes_total`
   * Labels: `result` (success|grace|expired|revoked|invalid_token|error)

5. **Token Issue Duration**
   * Name: `onm_api_token_issue_duration_seconds`
   * Type: Histogram
   * Labels: `op` (activate|refresh)
   * Buckets: `[0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1]`

#### Stripe Webhook Ingress
6. **Webhook Requests**
   * Name: `onm_api_stripe_webhooks_received_total`
   * Labels: `result` (ok|invalid_sig|parse_error|unsupported_event|error)

7. **Webhook Enqueue Duration**
   * Name: `onm_api_stripe_webhook_enqueue_duration_seconds`
   * Labels: `result` (ok|error)

### 1.3 Worker Metrics (`apps/worker`)
**Namespace:** `onm_worker_…`

#### Job Processing
1. **Jobs Processed**
   * Name: `onm_worker_jobs_processed_total`
   * Labels: `queue`, `job_name`, `result` (completed|failed|retried|skipped_idempotent)

2. **Job Duration**
   * Name: `onm_worker_job_duration_seconds`
   * Type: Histogram
   * Labels: `queue`, `job_name`, `result`

3. **Queue Lag / Depth**
   * Name: `onm_worker_queue_waiting_count`
   * Type: Gauge
   * Labels: `queue`

---

## 2. Health & Readiness

### 2.1 Liveness (`/health`)
* Status 200, Body: `{ "status": "ok" }`.
* Keine externen Dependencies prüfen.

### 2.2 Readiness (`/readyz`)
* Checks: DB (`SELECT 1`), Redis (`PING`)
* Response 200: `{ "status": "ready", "db": "ok", "redis": "ok" }`
* Response 503: `{ "status": "not_ready", "db": "fail", ... }`

---

## 3. Structured Logging (JSON)

### 3.1 Logging Format Standard
Pflichtfelder: `level`, `time` (ISO), `service` (api|worker), `event`, `msg`, `context`.

```json
{
  "level": "info",
  "time": "2026-01-21T20:10:00.000Z",
  "service": "api",
  "event": "LicenseActivated",
  "msg": "License activated successfully",
  "context": { "licenseId": "...", "result": "success" }
}
```

### 3.2 Event Catalog (verbindlich)
**API Events**: `LicenseActivated`, `LicenseActivationFailed`, `LicenseRefreshed`, `LicenseRefreshFailed`, `LicenseRevoked`, `DeviceLimitReached`, `StripeWebhookReceived`, `StripeWebhookRejected`
**Worker Events**: `StripeEventProcessingStarted`, `StripeEventProcessingCompleted`, `StripeEventProcessingFailed`, `StripeEventIdempotentSkip`, `LicenseStateTransition`

---

## 5. Implementation Notes
* `prom-client` Registry global nutzen.
* Fastify Plugin für Auto-Instrumentation.
* Worker: separater HTTP Server auf Port 9110 für `/metrics`.
