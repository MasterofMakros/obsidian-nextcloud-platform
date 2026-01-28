# Troubleshooting: Bekannte Probleme & Fixes

> Extrahiert aus `SKILL.md` für modulare Struktur (Cole-Medin Style)

## 🔧 Bekannte Probleme & Fixes

### Problem: Prisma Client "not found"
**Fix**: `prisma generate` ausführen mit explizitem Schema-Pfad

### Problem: Docker "port already in use"
**Fix**: `docker compose down -v` und alte Container stoppen

### Problem: TypeScript Fehler in Stripe Types
**Fix**: `as any` Casts für API-Version und Invoice.subscription verwenden

### Problem: dist-Ordner fehlt nach pnpm deploy
**Fix**: Explizites `COPY` in Dockerfile hinzufügen

### Problem: API Container "unhealthy" trotz "Server listening..."
**Ursache**: Alpine Linux (`node:20-alpine`) enthält KEIN `wget` oder `curl` standardmäßig!  
**Fix (per Herstellerdokumentation)**: In Dockerfile hinzufügen:
```dockerfile
RUN apk add --no-cache openssl libc6-compat wget
```
**Quelle**: Docker Compose Healthcheck Docs, Alpine Linux Docs

### Problem: Stripe Client wirft Fehler ohne API-Key beim Container-Start
**Ursache**: `new Stripe(key)` wird bei Moduleimport ausgeführt, nicht erst bei Nutzung  
**Fix**: Lazy-Initialisierung mit Getter-Funktion:
```typescript
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
    if (!stripeClient) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
        stripeClient = new Stripe(key, { apiVersion: '2023-10-16' as any });
    }
    return stripeClient;
}
```
**Quelle**: Stripe Node.js Docs, Fastify Best Practices

### Problem: Zod Schema inkompatibel mit Fastify Route Options
**Ursache**: Fastify erwartet JSON Schema Format, nicht Zod Objekte  
**Fix**: Zod Schema aus `{ schema: {} }` entfernen und manuell validieren:
```typescript
// FALSCH:
fastify.post('/route', { schema: { params: z.object({...}) } }, ...)

// RICHTIG:
fastify.post('/route', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!/^[0-9a-f-]{36}$/i.test(id)) return reply.code(400).send(...);
})
```
**Quelle**: Fastify 5.x Docs
