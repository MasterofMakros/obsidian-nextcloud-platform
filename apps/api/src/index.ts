import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cookie from '@fastify/cookie';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';

// Hardening Plugins
import rateLimitPlugin from './plugins/rate-limit';
import corsPlugin from './plugins/cors';
import securityHeaders from './plugins/security-headers';

// Observability
import { metricsPlugin } from './plugins/metrics';
import healthRoutes from './routes/health';

// Routes
import { authRoutes } from './routes/auth';
import { dashboardRoutes } from './routes/dashboard';
import { licenseRoutes } from './routes/license';
import { stripeRoutes } from './routes/stripe';

// Environment Variables
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3011;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const SERVICE_NAME = 'api';

// 3. Register Core Plugins
export const buildApp = async () => {
    // 1. Dependency Initialization (inside factory to avoid side-effects in tests if needed, 
    // or keep global if you want shared singleton. For integration tests, shared singleton is usually fine 
    // BUT fastify instance should be fresh.)

    // Note: We are using global prisma/redis here. 
    // For strict isolation, we would pass them in or create them here.
    // Keeping current structure but wrapping fastify creation.

    const app = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || "info",
            base: { service: SERVICE_NAME },
            redact: {
                paths: [
                    "req.headers.authorization",
                    "req.headers.cookie",
                    "req.body.licenseKey",
                    "req.body.token",
                    "headers.authorization",
                ],
                remove: true,
            },
            formatters: {
                level(label) {
                    return { level: label };
                },
            },
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
        }
    });

    // Instantiate Dependencies
    const prisma = new PrismaClient();
    const redis = new Redis(REDIS_URL);

    // Graceful Shutdown
    app.addHook('onClose', async (instance) => {
        await prisma.$disconnect();
        await redis.quit();
    });

    try {
        // Decorate dependencies so they are accessible if needed
        app.decorate('prisma', prisma);
        app.decorate('redis', redis);

        await app.register(sensible);

        // 1. Observability (Logger init is implicit in Fastify constructor)
        await app.register(metricsPlugin);

        // 2. Security Headers (Hardening)
        await app.register(securityHeaders, { enableHsts: process.env.NODE_ENV === "production" });

        // 3. CORS (Allowlist)
        await app.register(corsPlugin);

        // 4. Rate Limiting (Redis-backed, route policies)
        await app.register(rateLimitPlugin);

        // 5. Cookie Support (for sessions)
        await app.register(cookie, {
            secret: process.env.COOKIE_SECRET || 'dev-secret-change-in-production',
            parseOptions: {}
        });

        // 6. Health & Readiness
        await app.register(healthRoutes, { prisma, redis });

        // 7. App Routes
        await app.register(authRoutes);
        await app.register(dashboardRoutes);
        await app.register(licenseRoutes);
        await app.register(stripeRoutes);

        return app;
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

const start = async () => {
    const app = await buildApp();
    try {
        await app.listen({ port: PORT, host: '0.0.0.0' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

if (require.main === module) {
    start();
}
