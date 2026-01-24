import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { Queue } from 'bullmq';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any });
const eventQueue = new Queue('stripe-events', { connection: { url: REDIS_URL } });

export async function stripeRoutes(fastify: FastifyInstance) {

    // We need the raw body for signature verification
    fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
        try {
            const newBody = {
                raw: body,
                parsed: JSON.parse(body.toString())
            };
            done(null, newBody);
        } catch (e) {
            done(e as Error, undefined);
        }
    });

    fastify.post('/stripe/webhook', {
        config: { rateLimit: fastify.ratePolicies.webhook }
    }, async (request, reply) => {
        const signature = request.headers['stripe-signature'];
        const body = request.body as { raw: Buffer, parsed: any };

        if (!signature) {
            return reply.code(400).send({ error: 'Missing signature' });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body.raw,
                signature,
                STRIPE_WEBHOOK_SECRET
            );
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return reply.code(401).send({ error: 'Invalid signature' });
        }

        // Push to Queue for Async Processing (Idempotency managed by Worker)
        await eventQueue.add('stripe-event', {
            id: event.id,
            type: event.type,
            data: event.data
        }, {
            jobId: event.id // Deduplication key for BullMQ (optional redundancy to DB check)
        });

        return { received: true };
    });
}
