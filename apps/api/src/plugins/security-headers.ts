import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

export type SecurityHeadersOptions = {
    enableHsts?: boolean; // only if behind TLS
};

const securityHeaders: FastifyPluginAsync<SecurityHeadersOptions> = async (
    fastify: FastifyInstance,
    opts
) => {
    const enableHsts =
        opts.enableHsts ?? (process.env.ENABLE_HSTS === "true");

    // Register Helmet for comprehensive security headers
    await fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for APIs
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false, // Disable for API server
        crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow CORS
    });

    // Additional custom headers
    fastify.addHook("onSend", async (_req, reply, payload) => {
        // Basic hardening headers (complementing Helmet)
        reply.header("X-Content-Type-Options", "nosniff");
        reply.header("X-Frame-Options", "DENY");
        reply.header("Referrer-Policy", "no-referrer");
        reply.header("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

        // If you serve over TLS, HSTS is helpful
        if (enableHsts) {
            reply.header("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
        }

        // Avoid caching sensitive API responses
        reply.header("Cache-Control", "no-store");

        return payload;
    });
};

export default fp(securityHeaders, { name: "onm-security-headers" });
