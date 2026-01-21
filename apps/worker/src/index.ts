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
            case 'checkout.session.completed': {
                const session = data.object as Stripe.Checkout.Session;
                const email = session.customer_details?.email;
                const stripeCustomerId = session.customer as string;
                const subscriptionId = session.subscription as string;

                if (!email) throw new Error('No email in session');

                console.log(`Processing Checkout for ${email}`);

                // 1. Create or Update User
                let user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    user = await prisma.user.create({
                        data: { email, stripeCustomerId }
                    });
                } else if (!user.stripeCustomerId) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { stripeCustomerId }
                    });
                }

                // 2. Generate/Link License
                // Check if user already has a license
                let license = await prisma.license.findFirst({ where: { userId: user.id } });

                if (!license) {
                    // Create New License
                    // In real impl, use proper key generation
                    const publicKey = `pub_key_${Date.now()}`;
                    const hashedKey = `hashed_priv_${Date.now()}`;

                    license = await prisma.license.create({
                        data: {
                            userId: user.id,
                            publicKey,
                            hashedKey,
                            stripeSubscriptionId: subscriptionId,
                            status: 'ACTIVE',
                            plan: 'PRO',
                            features: ['4k-streaming'],
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
                        }
                    });
                } else {
                    // Reactivate existing
                    await prisma.license.update({
                        where: { id: license.id },
                        data: {
                            status: 'ACTIVE',
                            stripeSubscriptionId: subscriptionId,
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        }
                    });
                }

                // TODO: Send Email with License Key
                console.log(`License ${license.id} activated for ${email}`);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;
                console.log(`Payment failed for sub ${subscriptionId}`);

                // Enter Grace Period
                await prisma.license.updateMany({
                    where: { stripeSubscriptionId: subscriptionId },
                    data: {
                        status: 'GRACE',
                        graceEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // +14 days grace
                    }
                });
                break;
            }

            case 'invoice.paid': {
                const invoice = data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;
                console.log(`Payment succeeded for sub ${subscriptionId}`);

                // Reactivate
                await prisma.license.updateMany({
                    where: { stripeSubscriptionId: subscriptionId },
                    data: {
                        status: 'ACTIVE',
                        graceEndsAt: null,
                        expiresAt: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000) // Extend validity
                    }
                });
                break;
            }

            case 'customer.subscription.deleted': {
                const sub = data.object as Stripe.Subscription;
                console.log(`Subscription ${sub.id} deleted`);

                // Expire immediately or keep until period end? Spec says 'expired'
                await prisma.license.updateMany({
                    where: { stripeSubscriptionId: sub.id },
                    data: {
                        status: 'EXPIRED',
                        expiresAt: new Date() // Expire now
                    }
                });
                break;
            }

            default:
                console.log(`Unhandled event type: ${type}`);
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
