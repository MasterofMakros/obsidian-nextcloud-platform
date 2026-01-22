import fp from "fastify-plugin";
import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import client from "prom-client";

/**
 * Commercial-grade metrics plugin.
 * - Exposes prom-client registry
 * - Instruments HTTP requests with low-cardinality labels
 * - Collects default process/node metrics with `onm_` prefix
 */

export type MetricsPluginOptions = {
    serviceName?: "api"; // keep narrow for now
    collectDefaultMetrics?: boolean;
};

declare module "fastify" {
    interface FastifyInstance {
        metrics: {
            registry: client.Registry;
            httpRequestsTotal: client.Counter<string>;
            httpRequestDurationSeconds: client.Histogram<string>;
            licenseActivationsTotal: client.Counter<string>;
            licenseRefreshesTotal: client.Counter<string>;
            tokenIssueDurationSeconds: client.Histogram<string>;
            stripeWebhooksReceivedTotal: client.Counter<string>;
            stripeWebhookEnqueueDurationSeconds: client.Histogram<string>;
        };
    }
}

function normalizeRoute(req: FastifyRequest): string {
    // Prefer Fastify's routerPath (template) to avoid high-cardinality URLs.
    // Fallback to raw routeOptions.url or "unknown".
    return (
        // @ts-expect-error fastify internal typing differs by version
        (req as any).routerPath ||
        (req.routeOptions && (req.routeOptions.url as string)) ||
        "unknown"
    );
}

export const metricsPlugin: FastifyPluginAsync<MetricsPluginOptions> = async (
    fastify: FastifyInstance,
    opts
) => {
    const registry = new client.Registry();

    // Default metrics (CPU/mem/event loop/etc.)
    if (opts.collectDefaultMetrics !== false) {
        client.collectDefaultMetrics({
            register: registry,
            prefix: "onm_",
        });
    }

    // HTTP metrics
    const httpRequestsTotal = new client.Counter({
        name: "onm_api_http_requests_total",
        help: "Total number of HTTP requests",
        labelNames: ["method", "route", "status_code"] as const,
        registers: [registry],
    });

    const httpRequestDurationSeconds = new client.Histogram({
        name: "onm_api_http_request_duration_seconds",
        help: "HTTP request latency in seconds",
        labelNames: ["method", "route", "status_code"] as const,
        buckets: [0.01, 0.025, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1, 2, 5],
        registers: [registry],
    });

    // Licensing metrics
    const licenseActivationsTotal = new client.Counter({
        name: "onm_api_license_activations_total",
        help: "License activation attempts",
        labelNames: ["result"] as const,
        registers: [registry],
    });

    const licenseRefreshesTotal = new client.Counter({
        name: "onm_api_license_refreshes_total",
        help: "License refresh attempts",
        labelNames: ["result"] as const,
        registers: [registry],
    });

    const tokenIssueDurationSeconds = new client.Histogram({
        name: "onm_api_token_issue_duration_seconds",
        help: "Token issuance latency in seconds",
        labelNames: ["op"] as const, // activate|refresh
        buckets: [0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1],
        registers: [registry],
    });

    // Stripe webhook metrics
    const stripeWebhooksReceivedTotal = new client.Counter({
        name: "onm_api_stripe_webhooks_received_total",
        help: "Stripe webhook ingress events",
        labelNames: ["result"] as const, // ok|invalid_sig|parse_error|unsupported_event|error
        registers: [registry],
    });

    const stripeWebhookEnqueueDurationSeconds = new client.Histogram({
        name: "onm_api_stripe_webhook_enqueue_duration_seconds",
        help: "Time to enqueue a webhook for async processing",
        labelNames: ["result"] as const, // ok|error
        buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.2],
        registers: [registry],
    });

    fastify.decorate("metrics", {
        registry,
        httpRequestsTotal,
        httpRequestDurationSeconds,
        licenseActivationsTotal,
        licenseRefreshesTotal,
        tokenIssueDurationSeconds,
        stripeWebhooksReceivedTotal,
        stripeWebhookEnqueueDurationSeconds,
    });

    // Lightweight HTTP instrumentation
    fastify.addHook("onRequest", async (req) => {
        // Store start time on request (avoid allocating closures repeatedly)
        (req as any).__onmStartHrTime = process.hrtime.bigint();
    });

    fastify.addHook("onResponse", async (req, reply) => {
        try {
            const start = (req as any).__onmStartHrTime as bigint | undefined;
            const end = process.hrtime.bigint();
            const durSeconds = start ? Number(end - start) / 1e9 : 0;

            const method = req.method;
            const route = normalizeRoute(req);
            const statusCode = String(reply.statusCode);

            httpRequestsTotal.inc({ method, route, status_code: statusCode }, 1);
            httpRequestDurationSeconds.observe(
                { method, route, status_code: statusCode },
                durSeconds
            );
        } catch {
            // never throw from hooks
        }
    });
};

export default fp(metricsPlugin, { name: "onm-metrics" });
