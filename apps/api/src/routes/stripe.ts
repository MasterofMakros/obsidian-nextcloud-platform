import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Lazy-initialized Stripe client to prevent startup crash if key is missing
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
    if (!stripeClient) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }
        stripeClient = new Stripe(key, { apiVersion: '2023-10-16' as any });
    }
    return stripeClient;
}

function getWebhookSecret(): string {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return secret;
}

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
            event = getStripe().webhooks.constructEvent(
                body.raw,
                signature,
                getWebhookSecret()
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
