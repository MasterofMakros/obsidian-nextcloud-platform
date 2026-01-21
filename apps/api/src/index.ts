import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import { Redis } from 'ioredis';

// Environment Variables
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const fastify = Fastify({
    logger: true
});

// Security: Rate Limiting
// Uses Redis to track requests across multiple instances (if scaled)
const redis = new Redis(REDIS_URL);
await fastify.register(rateLimit, {
    redis,
    max: 100, // 100 requests
    timeWindow: '1 minute'
});

await fastify.register(cors, {
    origin: '*', // TODO: Lock down in production
});

await fastify.register(sensible);

// Health Check
fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() };
});

// Start Server
const start = async () => {
    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
