import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import type { PrismaClient } from "@prisma/client";

/**
 * Health + readiness + metrics routes.
 *
 * Assumptions:
 * - fastify.metrics is registered (plugins/metrics.ts)
 * - fastify has access to Prisma and Redis instances via decorations or closures
 *
 * Adjust the dependency injection to your project style:
 * - fastify.decorate("prisma", prisma)
 * - fastify.decorate("redis", redis)
 */

export type HealthRoutesOptions = {
    prisma: PrismaClient;
    redis: { ping: () => Promise<string> };
};

const healthRoutes: FastifyPluginAsync<HealthRoutesOptions> = async (
    fastify: FastifyInstance,
    opts
) => {
    const { prisma, redis } = opts;

    fastify.get("/health", async (_req, reply) => {
        return reply.code(200).send({ status: "ok" });
    });

    fastify.get("/readyz", async (_req, reply) => {
        const result = {
            status: "ready" as "ready" | "not_ready",
            db: "ok" as "ok" | "fail",
            redis: "ok" as "ok" | "fail",
        };

        // Tight timeouts to avoid flakiness
        const timeoutMs = 500;

        const withTimeout = async <T>(p: Promise<T>, name: string): Promise<T> => {
            let t: NodeJS.Timeout | undefined;
            const timeout = new Promise<never>((_, reject) => {
                t = setTimeout(() => reject(new Error(`${name}_timeout`)), timeoutMs);
            });
            try {
                return await Promise.race([p, timeout]);
            } finally {
                if (t) clearTimeout(t);
            }
        };

        try {
            await withTimeout(prisma.$queryRaw`SELECT 1`, "db");
        } catch {
            result.status = "not_ready";
            result.db = "fail";
        }

        try {
            await withTimeout(redis.ping(), "redis");
        } catch {
            result.status = "not_ready";
            result.redis = "fail";
        }

        if (result.status === "ready") {
            return reply.code(200).send(result);
        }
        return reply.code(503).send(result);
    });

    fastify.get("/metrics", async (_req, reply) => {
        const registry = fastify.metrics?.registry;
        if (!registry) {
            return reply
                .code(500)
                .send({ status: "error", message: "metrics_not_initialized" });
        }

        const body = await registry.metrics();
        reply.header("Content-Type", registry.contentType);
        return reply.code(200).send(body);
    });
};

export default healthRoutes;
