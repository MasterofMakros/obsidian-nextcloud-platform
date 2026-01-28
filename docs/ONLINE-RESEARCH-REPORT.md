# Online-Recherche Report: Alle Projektkomponenten

**Datum:** 2026-01-28  
**Projekt:** Obsidian Nextcloud Media Platform  
**Status:** Recherche abgeschlossen

---

## 🔍 Zusammenfassung der Recherche

Dieser Report enthält aktuelle Best Practices, Breaking Changes und Sicherheitsempfehlungen für alle im Projekt verwendeten Technologien.

---

## 1. 🚀 Next.js 16/14 - Frontend Framework

### Aktueller Status im Projekt
- **Verwendete Version:** Next.js 14.1.0 (im Web-App)
- **Neueste Version:** Next.js 16.x (Canary)

### Wichtige Findings
- **React 19 Integration:** Next.js 16 setzt auf React 19 mit verbessertem Server Components
- **Turbopack:** Wird zum Standard für Development (schneller als Webpack)
- **Partial Prerendering (PPR):** Neue Rendering-Strategie für dynamische Inhalte

### Empfohlene Aktionen
| Priorität | Aktion | Aufwand |
|-----------|--------|---------|
| 🟡 Mittel | Upgrade auf Next.js 15 (stable) | 2-4 Stunden |
| 🟢 Niedrig | Turbopack aktivieren (`--turbopack`) | 15 Minuten |
| 🔴 Hoch | React 19 Kompatibilität prüfen | 4-8 Stunden |

---

## 2. ⚡ Fastify 5.x - API Framework

### Aktueller Status im Projekt
- **Verwendete Version:** Fastify 4.26+ (API & Gateway)
- **Neueste Version:** Fastify 5.x

### 🔒 Security Best Practices 2025

#### Kritisch: Schema-First Validation
```typescript
// ✅ REQUIRED in Fastify 5
app.post('/license/activate', {
  schema: {
    body: {
      type: 'object',
      required: ['licenseKey', 'deviceId'],
      properties: {
        licenseKey: { type: 'string', minLength: 32, maxLength: 64 },
        deviceId: { type: 'string', format: 'uuid' }
      }
    }
  }
}, handler)
```

#### Wichtige Security Plugins
| Plugin | Status | Empfehlung |
|--------|--------|------------|
| `@fastify/helmet` | ⚠️ Fehlt | **SOFORT installieren** |
| `@fastify/cors` | ✅ Vorhanden | Origin-Whitelist prüfen |
| `@fastify/rate-limit` | ✅ Vorhanden | Redis-Store für Production |
| `@fastify/csrf-protection` | ⚠️ Fehlt | Für Form-Handling nötig |

#### Logging Security (Kritisch!)
```typescript
const fastify = Fastify({
  logger: {
    redact: [
      'req.headers.authorization',
      'req.body.licenseKey',
      'req.body.password',
      'req.headers.cookie'
    ]
  }
})
```

### Empfohlene Aktionen
1. **SOFORT:** `@fastify/helmet` installieren für Security Headers
2. **Kurzfristig:** Schema-Validation für ALLE Routes implementieren
3. **Mittelfristig:** Upgrade auf Fastify 5 (Node.js 20+ erforderlich)

---

## 3. 💾 Prisma ORM - Datenbankzugriff

### Aktueller Status im Projekt
- **Verwendete Version:** Prisma 5.10.0
- **Neueste Version:** Prisma 7.x

### Neue Features 2024-2025
- **Prisma Accelerate:** Globaler Edge-Cache für Serverless
- **Prisma Optimize:** Query-Performance-Analyse
- **Driver Adapters:** Flexible Datenbanktreiber

### Empfohlene Aktionen
| Feature | Nutzen | Priorität |
|---------|--------|-----------|
| Accelerate | Edge-Caching, bessere Latenz | 🟡 Mittel |
| Optimize | Query-Performance-Monitoring | 🟡 Mittel |
| Driver Adapters | Serverless-Optimierung | 🟢 Niedrig |

### Wichtige Hinweise
- `driverAdapters` Preview-Feature ist veraltet - wird automatisch aktiviert
- PostgreSQL 16 JSONB Performance: `jsonb_path_ops` Index verwenden für `@>` Queries

---

## 4. 📬 BullMQ 5.x - Job Queue

### Aktueller Status im Projekt
- **Verwendete Version:** BullMQ 5.0.0
- **Einsatz:** Worker für Stripe Webhooks

### 🔴 Kritische Production-Issues

#### 1. Memory Management (Muss sofort gefixt werden!)
```typescript
// ❌ FALSCH - Redis läuft voll!
await queue.add('stripe-webhook', data);

// ✅ RICHTIG - Automatische Cleanup
await queue.add('stripe-webhook', data, {
  removeOnComplete: { age: 3600, count: 1000 }, // 1h oder 1000 Jobs
  removeOnFail: { age: 24 * 3600, count: 5000 } // 24h für Debugging
});
```

#### 2. Redis Konfiguration
```conf
# redis.conf
maxmemory-policy noeviction  # Wichtig!
appendonly yes
appendfsync everysec
```

#### 3. Connection Settings
```typescript
const redis = new Redis({
  maxRetriesPerRequest: null,  // Wichtig für BullMQ!
  enableReadyCheck: false
});
```

### Empfohlene Aktionen
1. **SOFORT:** `removeOnComplete/removeOnFail` zu allen Jobs hinzufügen
2. **SOFORT:** Redis `maxmemory-policy` auf `noeviction` setzen
3. **Kurzfristig:** Exponential Backoff für alle externen API-Calls
4. **Mittelfristig:** BullBoard für Monitoring einrichten

---

## 5. 🐘 PostgreSQL 16 - Datenbank

### Aktueller Status im Projekt
- **Verwendete Version:** PostgreSQL 15/16 (Alpine)
- **JSON-Nutzung:** Features-Feld in License-Tabelle

### 🚀 Performance Optimierungen

#### JSONB Indexing Strategy
```sql
-- Für @> Containment Queries (empfohlen)
CREATE INDEX idx_license_features_path 
ON "License" USING GIN (features jsonb_path_ops);

-- Für spezifische Key-Lookups
CREATE INDEX idx_license_feature_x 
ON "License" ((features->>'specific_key'));
```

#### Neue SQL/JSON Funktionen (PG 16)
```sql
-- JSON_TABLE für komplexe Transformationen
SELECT * FROM JSON_TABLE(
  features,
  '$[*]' COLUMNS (
    feature_name TEXT PATH '$.name',
    enabled BOOLEAN PATH '$.enabled'
  )
) AS jt;
```

### Empfohlene Aktionen
1. **Kurzfristig:** GIN Index für License.features hinzufügen
2. **Mittelfristig:** JSON_TABLE für Reporting-Queries nutzen
3. **Langfristig:** Partitioning für PaymentEvent-Tabelle erwägen

---

## 6. 🔗 n8n - Workflow Automation

### Aktueller Status im Projekt
- **Verwendete Version:** n8n 2.4.6
- **Status:** Läuft auf Port 5678

### Best Practices 2024

#### Modular Workflow Architecture
```
❌ Mega-Workflow (Anti-Pattern)
Webhook → 50 Nodes → Output

✅ Main-Sub Pattern (Empfohlen)
Main Controller → Sub-Workflow 1 (Validation)
              → Sub-Workflow 2 (Processing)  
              → Sub-Workflow 3 (Notification)
```

#### Error Handling
- **Error Trigger Node:** Jeder kritische Workflow braucht einen Error-Trigger
- **Retry Logic:** Wait-Node + Counter für 3 Retries
- **Node-Level:** "On Fail → Continue" für nicht-kritische Nodes

#### AI Integration
- LangChain Nodes für unstrukturierte Daten
- Vector Store (Pinecone/Supabase) für RAG
- AI Agent mit Tools statt komplexer If/Else

### Empfohlene Aktionen
1. **Kurzfristig:** Error Trigger Workflows einrichten
2. **Mittelfristig:** Sub-Workflow Pattern implementieren
3. **Langfristig:** Git-Integration für Version Control

---

## 7. 💳 Stripe - Payment Processing

### Aktueller Status im Projekt
- **Version:** Stripe SDK 14.25.0
- **Features:** Checkout, Webhooks, Subscription Management

### Best Practices 2025

#### Idempotency (Bereits implementiert ✅)
```typescript
// ✅ Gut - Idempotency via PaymentEvent.stripeId
await prisma.paymentEvent.upsert({
  where: { stripeId: event.id },
  update: {},
  create: { stripeId: event.id, ... }
});
```

#### Webhook Security
```typescript
// ✅ Bereits implementiert
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
```

### Empfohlene Aktionen
1. **Prüfen:** Webhook Endpoint Versions (auf 2024-12+ aktualisieren)
2. **Monitoring:** Stripe Dashboard für Failed Webhooks
3. **Testing:** Stripe CLI für lokale Webhook-Tests

---

## 8. 🔐 Ed25519 - Licensing Cryptography

### Aktueller Status im Projekt
- **Verwendung:** Ed25519 für License Signing
- **Library:** @noble/ed25519

### Security Best Practices 2024

#### ✅ Bereits Gut Implementiert
- Asymmetrische Kryptographie (Private auf Server, Public im Plugin)
- Deterministische Signaturen (kein RNG nötig)
- Kleine Signatur-Größe (64 Bytes)

#### 🟡 Empfohlene Verbesserungen
1. **License Payload Hardening:**
```typescript
// ✅ Hardware-ID einbinden
const payload = {
  licenseId: 'lic_xxx',
  userId: 'usr_xxx',
  expiresAt: '2026-12-31',
  hardwareIdHash: hash(hardwareId), // Anti-Replay
  version: 'v1' // Für zukünftige Algorithmus-Updates
};
```

2. **Time-Sync Checks:**
```typescript
// NTP-Check gegen Clock-Rolling
const serverTime = await fetchTrustedTime();
if (Math.abs(localTime - serverTime) > 300) { // 5 Min Toleranz
  throw new Error('System clock invalid');
}
```

3. **Post-Quantum Readiness:**
```typescript
// Algorithmus-Versionierung vorbereiten
const verifyLicense = (signedData) => {
  const version = signedData.header.algVersion;
  if (version === 'v1') return ed25519.verify(...);
  if (version === 'v2') return mlDsa.verify(...); // Zukunft
};
```

### Empfohlene Aktionen
1. **Kurzfristig:** Hardware-ID Hash zum Payload hinzufügen
2. **Mittelfristig:** Time-Sync Validation implementieren
3. **Langfristig:** Algorithmus-Versionierung vorbereiten

---

## 📊 Priorisierte Handlungsempfehlungen

### 🔴 Kritisch (SOFORT - Innerhalb 24h)

1. **BullMQ Memory Leak fixen**
   ```typescript
   // Zu ALLEN queue.add() Aufrufen hinzufügen:
   removeOnComplete: { age: 3600, count: 1000 },
   removeOnFail: { age: 24 * 3600, count: 5000 }
   ```

2. **Fastify Helmet installieren**
   ```bash
   pnpm add @fastify/helmet
   ```
   ```typescript
   await app.register(helmet, {
     contentSecurityPolicy: true
   });
   ```

3. **Redis maxmemory-policy setzen**
   ```conf
   # In docker-compose.yml oder redis.conf
   maxmemory-policy noeviction
   ```

### 🟡 Hoch (Diese Woche)

4. **Schema-Validation für alle API Routes**
   - Jeder POST/PUT Endpoint braucht ein JSON Schema
   - Verhindert Injection Attacks

5. **GIN Index für License.features**
   ```sql
   CREATE INDEX CONCURRENTLY idx_license_features 
   ON "License" USING GIN (features jsonb_path_ops);
   ```

6. **Hardware-ID in License Payload**
   - Device Fingerprinting für Anti-Replay

### 🟢 Mittel (Diesen Monat)

7. **BullBoard für Queue Monitoring**
8. **n8n Error Trigger Workflows**
9. **Fastify 5 Upgrade** (nach Security-Review)
10. **Prisma Accelerate Evaluation**

---

## 🎯 Zusammenfassung

| Kategorie | Status | Wichtigste Aktion |
|-----------|--------|-------------------|
| **Security** | ⚠️ Mängel | Helmet + Schema-Validation |
| **Performance** | ✅ Gut | PostgreSQL JSONB Index |
| **Stability** | 🔴 Kritisch | BullMQ Memory Management |
| **Monitoring** | ⚠️ Lücken | BullBoard + n8n Error Handling |
| **Future-Proof** | 🟡 OK | PQ-Readiness + Versionierung |

---

**Quellen:**
- Fastify 5 Security Best Practices (Offizielle Docs)
- BullMQ 5 Production Guide (Taskforce.sh)
- PostgreSQL 16 JSON Performance (PostgreSQL.org)
- n8n 2024 Patterns (n8n.io Blog)
- Ed25519 Security (NIST FIPS 186-5, libsodium)

**Recherche durchgeführt am:** 2026-01-28  
**Nächste Überprüfung:** 2026-04-28 (quartalsweise)
