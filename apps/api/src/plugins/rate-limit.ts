import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

export type RateLimitPluginOptions = {
    // Comma-separated allowlist of IPs for webhooks (optional)
    webhookIpAllowlist?: string[];
};

function parseAllowlist(raw?: string): string[] {
    if (!raw) return [];
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

const rateLimitPlugin: FastifyPluginAsync<RateLimitPluginOptions> = async (
    fastify: FastifyInstance,
    opts
) => {
    // Expect fastify.redis to exist; otherwise fallback to in-memory (NOT recommended for prod)
    const redis = (fastify as any).redis;
    const allowlist =
        opts.webhookIpAllowlist ??
        parseAllowlist(process.env.STRIPE_WEBHOOK_IP_ALLOWLIST);

    await fastify.register(rateLimit, {
        // Redis store strongly recommended
        redis,
        // Global default (very permissive, overridden per route)
        max: 600,
        timeWindow: "1 minute",
        // Standard headers for clients
        addHeaders: {
            "x-ratelimit-limit": true,
            "x-ratelimit-remaining": true,
            "x-ratelimit-reset": true,
        },
        // Use a stable key: ip + (optional) route
        keyGenerator: (req) => req.ip,
        onExceeded: (req, _key) => {
            // Telemetry (optional): count + log
            fastify.metrics?.httpRequestsTotal?.inc?.({
                method: req.method,
                route: (req as any).routerPath ?? (req.routeOptions?.url as string) ?? "unknown",
                status_code: "429",
            });
            req.log.warn(
                {
                    event: "RateLimitExceeded",
                    msg: "Rate limit exceeded",
                    context: { ip: req.ip, route: (req as any).routerPath ?? req.url },
                },
                "Rate limit exceeded"
            );
        },
    });

    // Route-level policies (register AFTER routes exist or attach per route)
    // Recommended: attach in route options (preferred), see usage below.

    // Convenience decorator to apply policies consistently
    fastify.decorate("ratePolicies", {
        activate: {
            max: 20,
            timeWindow: "1 minute",
        },
        refresh: {
            max: 120,
            timeWindow: "1 minute",
        },
        webhook: {
            max: 300,
            timeWindow: "1 minute",
        },
    });

    // Optional hard gate for webhook by IP allowlist (only if you actually maintain it)
    if (allowlist.length > 0) {
        fastify.addHook("onRequest", async (req, reply) => {
            // Apply only to webhook route
            const route = (req as any).routerPath ?? req.routeOptions?.url;
            if (route === "/stripe/webhook" || route === "/v1/stripe/webhook") {
                if (!allowlist.includes(req.ip)) {
                    req.log.warn(
                        { event: "StripeWebhookRejected", context: { ip: req.ip, reason: "ip_not_allowlisted" } },
                        "Stripe webhook rejected"
                    );
                    return reply.code(403).send({ error: "forbidden" });
                }
            }
        });
    }
};

export default fp(rateLimitPlugin, { name: "onm-rate-limit" });

declare module "fastify" {
    interface FastifyInstance {
        ratePolicies: {
            activate: { max: number; timeWindow: string };
            refresh: { max: number; timeWindow: string };
            webhook: { max: number; timeWindow: string };
        };
    }
}
