import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { createHmac, timingSafeEqual } from "crypto";

interface GitHubWebhookPayload {
    action: string;
    issue?: {
        number: number;
        title: string;
        body: string;
        labels: Array<{ name: string }>;
        html_url: string;
    };
    repository?: {
        full_name: string;
    };
    sender?: {
        login: string;
    };
}

/**
 * GitHub Webhook Handler
 * Receives GitHub events and triggers n8n workflows via Gateway
 */
export async function webhookRoutes(app: FastifyInstance) {
    // GitHub Webhook endpoint
    app.post("/webhooks/github", async (req: FastifyRequest, reply: FastifyReply) => {
        const signature = req.headers["x-hub-signature-256"] as string;
        const event = req.headers["x-github-event"] as string;
        const deliveryId = req.headers["x-github-delivery"] as string;

        // Verify signature
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        if (secret && signature) {
            const isValid = verifySignature(
                JSON.stringify(req.body),
                signature,
                secret
            );
            if (!isValid) {
                req.log.warn({ deliveryId }, "Invalid GitHub webhook signature");
                return reply.code(401).send({ error: "Invalid signature" });
            }
        }

        const payload = req.body as GitHubWebhookPayload;
        req.log.info({ event, action: payload.action, deliveryId }, "GitHub webhook received");

        try {
            // Route to appropriate handler
            if (event === "issues") {
                await handleIssueEvent(app, payload, req);
            } else if (event === "issue_comment") {
                await handleCommentEvent(app, payload, req);
            }

            return reply.send({ status: "processed", event, deliveryId });
        } catch (error) {
            req.log.error({ error, deliveryId }, "Webhook processing failed");
            return reply.code(500).send({ error: "Processing failed" });
        }
    });

    // Health check for webhooks
    app.get("/webhooks/health", async () => ({ status: "ok", service: "webhooks" }));
}

/**
 * Handle issue events (opened, labeled, etc.)
 */
async function handleIssueEvent(
    app: FastifyInstance,
    payload: GitHubWebhookPayload,
    req: FastifyRequest
) {
    const { action, issue } = payload;
    if (!issue) return;

    const labels = issue.labels.map(l => l.name);

    // Issue opened → Trigger intake classification
    if (action === "opened") {
        req.log.info({ issue: issue.number }, "New issue opened, triggering intake");

        // Call our own agent endpoint
        const response = await fetch("http://localhost:8080/v1/agent/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GATEWAY_BEARER_TOKEN}`,
            },
            body: JSON.stringify({
                task: "issue_intake",
                input: {
                    title: issue.title,
                    body: issue.body,
                    labels,
                    number: issue.number,
                    url: issue.html_url,
                },
            }),
        });

        const result = await response.json();
        req.log.info({ issue: issue.number, result }, "Intake classification complete");
    }

    // Issue labeled with 'ai-fix-requested' → Trigger fix proposal
    if (action === "labeled" && labels.includes("ai-fix-requested")) {
        req.log.info({ issue: issue.number }, "AI fix requested, triggering analysis");

        const response = await fetch("http://localhost:8080/v1/agent/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GATEWAY_BEARER_TOKEN}`,
            },
            body: JSON.stringify({
                task: "fix_proposal",
                input: {
                    title: issue.title,
                    body: issue.body,
                    labels,
                    number: issue.number,
                    url: issue.html_url,
                },
            }),
        });

        const result = await response.json();
        req.log.info({ issue: issue.number, result }, "Fix proposal complete");
    }
}

/**
 * Handle issue comment events
 */
async function handleCommentEvent(
    _app: FastifyInstance,
    payload: GitHubWebhookPayload,
    req: FastifyRequest
) {
    req.log.info({ action: payload.action }, "Comment event received (not yet implemented)");
}

/**
 * Verify GitHub webhook signature using HMAC SHA-256
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = `sha256=${createHmac("sha256", secret)
        .update(payload)
        .digest("hex")}`;

    try {
        return timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch {
        return false;
    }
}

export default webhookRoutes;
