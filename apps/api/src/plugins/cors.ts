import fp from "fastify-plugin";
import cors from "@fastify/cors";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

function parseOrigins(raw?: string): string[] {
    if (!raw) return [];
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

export type CorsPluginOptions = {
    origins?: string[];
};

const corsPlugin: FastifyPluginAsync<CorsPluginOptions> = async (
    fastify: FastifyInstance,
    opts
) => {
    const allowlist =
        opts.origins ?? parseOrigins(process.env.CORS_ALLOW_ORIGINS);

    await fastify.register(cors, {
        origin: (origin, cb) => {
            // Requests like curl have no origin → allow
            if (!origin) return cb(null, true);

            // Allow only allowlist entries
            if (allowlist.includes(origin)) return cb(null, true);

            // Reject
            cb(new Error("CORS_ORIGIN_NOT_ALLOWED"), false);
        },
        credentials: false,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature", "X-ADMIN-API-KEY"],
        maxAge: 86400, // 24h
    });

    fastify.addHook("onError", async (req, _reply, err) => {
        if (err?.message === "CORS_ORIGIN_NOT_ALLOWED") {
            req.log.warn(
                { event: "CorsRejected", context: { origin: req.headers.origin } },
                "CORS rejected"
            );
        }
    });
};

export default fp(corsPlugin, { name: "onm-cors" });
