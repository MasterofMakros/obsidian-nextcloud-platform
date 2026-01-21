import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = { url: REDIS_URL }; // BullMQ supports connection url directly or ioredis options

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

console.log('Worker started...');

const worker = new Worker('stripe-events', async job => {
    const { id, type, data } = job.data;
    console.log(`Processing event: ${type} [${id}]`);

    // Idempotency: Check if already processed
    const existingEvent = await prisma.paymentEvent.findUnique({
        where: { stripeId: id }
    });

    if (existingEvent && existingEvent.status === 'PROCESSED') {
        console.log('Skipping - already processed.');
        return;
    }

    // Record Event as Pending (if not exists)
    if (!existingEvent) {
        await prisma.paymentEvent.create({
            data: {
                stripeId: id,
                type: type,
                payload: data as any,
                status: 'PENDING'
            }
        });
    }

    try {
        switch (type) {
            case 'checkout.session.completed':
                // TODO: Generate License Logic Here
                const session = data.object;
                const email = session.customer_details?.email;
                if (email) {
                    console.log(`Issuing license for ${email}`);
                    // Logic: Create User -> Generate Ed25519 Keypair -> Store License -> Email User
                }
                break;
            default:
                console.log('Unhandled event type');
        }

        // Mark Processed
        await prisma.paymentEvent.update({
            where: { stripeId: id },
            data: { status: 'PROCESSED', processedAt: new Date() }
        });

    } catch (e: any) {
        console.error('Job failed:', e);
        await prisma.paymentEvent.update({
            where: { stripeId: id },
            data: { status: 'FAILED', error: e.message }
        });
        throw e;
    }

}, { connection });

worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`);
});
