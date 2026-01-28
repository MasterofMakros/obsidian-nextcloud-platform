---
name: github-webhook
description: GitHub webhooks with Gateway. Verify signatures, parse payloads. Use for GitHub App integrations.
---

# GitHub Webhook

## Route Template

```typescript
// src/routes/github.ts
app.post("/webhooks/github", async (req, reply) => {
    const sig = req.headers["x-hub-signature-256"] as string;
    const event = req.headers["x-github-event"] as string;
    
    if (!verifySignature(JSON.stringify(req.body), sig)) {
        return reply.code(401).send({ error: "Invalid signature" });
    }
    
    // Handle event
    if (event === "issues" && req.body.action === "opened") {
        // Trigger AI intake
    }
    return { status: "processed" };
});
```

## Verify Signature

```typescript
import { createHmac, timingSafeEqual } from "crypto";

function verifySignature(payload: string, sig: string) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET!;
    const digest = "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
    return timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
}
```

## Events

| Event | Action | Use |
|-------|--------|-----|
| issues | opened | AI intake |
| push | - | Deploy trigger |
| pull_request | opened | Review |

## Environment

```env
GITHUB_WEBHOOK_SECRET=your-secret
```
