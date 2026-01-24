import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient, LicenseStatus } from '@prisma/client';
import Stripe from 'stripe';
import crypto from 'crypto';
import { isPast } from 'date-fns';

const prisma = new PrismaClient();

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

/**
 * Hash a token for secure storage
 */
function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Middleware to require authentication
 */
async function requireAuth(request: any, reply: any) {
    const sessionToken = request.cookies?.session;

    if (!sessionToken) {
        return reply.code(401).send({ error: 'Not authenticated' });
    }

    const hashedSessionToken = hashToken(sessionToken);
    const session = await prisma.session.findUnique({
        where: { token: hashedSessionToken },
        include: { user: true }
    });

    if (!session || isPast(session.expiresAt)) {
        if (session) {
            await prisma.session.delete({ where: { id: session.id } });
        }
        reply.clearCookie('session');
        return reply.code(401).send({ error: 'Session expired' });
    }

    // Attach user to request for use in handlers
    request.user = session.user;
}

export async function dashboardRoutes(fastify: FastifyInstance) {

    // Apply auth middleware to all dashboard routes
    fastify.addHook('preHandler', requireAuth);

    /**
     * GET /dashboard/licenses
     * Get all licenses for the current user
     */
    fastify.get('/dashboard/licenses', async (request: any, reply) => {
        const licenses = await prisma.license.findMany({
            where: { userId: request.user.id },
            select: {
                id: true,
                publicKey: true,
                status: true,
                plan: true,
                features: true,
                deviceIdHashes: true,
                expiresAt: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Mask license keys for display (show first 8 and last 4 chars)
        const maskedLicenses = licenses.map(license => ({
            ...license,
            publicKey: maskLicenseKey(license.publicKey),
            deviceCount: license.deviceIdHashes.length,
            deviceLimit: 3
        }));

        return { licenses: maskedLicenses };
    });

    /**
     * POST /dashboard/licenses/:id/reset-devices
     * Reset device list for a license (self-service)
     */
    fastify.post('/dashboard/licenses/:id/reset-devices', async (request: any, reply) => {
        const { id } = request.params as { id: string };

        // Validate UUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return reply.code(400).send({ error: 'Invalid license ID format' });
        }

        // Verify license belongs to user
        const license = await prisma.license.findFirst({
            where: { id, userId: request.user.id }
        });

        if (!license) {
            return reply.code(404).send({ error: 'License not found' });
        }

        // Reset devices
        await prisma.license.update({
            where: { id },
            data: { deviceIdHashes: [] }
        });

        return { success: true, message: 'Device list cleared' };
    });

    /**
     * GET /dashboard/billing
     * Get billing/subscription information
     */
    fastify.get('/dashboard/billing', async (request: any, reply) => {
        const user = request.user;

        if (!user.stripeCustomerId) {
            return {
                hasSubscription: false,
                message: 'No active subscription'
            };
        }

        try {
            // Get active subscriptions from Stripe
            const subscriptions = await getStripe().subscriptions.list({
                customer: user.stripeCustomerId,
                status: 'active',
                limit: 1
            });

            if (subscriptions.data.length === 0) {
                return {
                    hasSubscription: false,
                    message: 'No active subscription'
                };
            }

            const sub = subscriptions.data[0] as any;
            const plan = sub.items?.data?.[0]?.price?.nickname || 'Unknown Plan';

            return {
                hasSubscription: true,
                subscription: {
                    id: sub.id,
                    status: sub.status,
                    plan: plan,
                    currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
                    cancelAtPeriodEnd: sub.cancel_at_period_end
                }
            };
        } catch (error) {
            fastify.log.error({ msg: 'Failed to fetch subscription', error });
            return {
                hasSubscription: false,
                error: 'Failed to fetch subscription details'
            };
        }
    });

    /**
     * POST /dashboard/billing/cancel
     * Cancel subscription (stop auto-renewal)
     */
    fastify.post('/dashboard/billing/cancel', async (request: any, reply) => {
        const user = request.user;

        if (!user.stripeCustomerId) {
            return reply.code(400).send({ error: 'No subscription to cancel' });
        }

        try {
            const subscriptions = await getStripe().subscriptions.list({
                customer: user.stripeCustomerId,
                status: 'active',
                limit: 1
            });

            if (subscriptions.data.length === 0) {
                return reply.code(400).send({ error: 'No active subscription' });
            }

            // Cancel at period end (don't immediately terminate)
            await getStripe().subscriptions.update(subscriptions.data[0].id, {
                cancel_at_period_end: true
            });

            return {
                success: true,
                message: 'Subscription will not renew after current period'
            };
        } catch (error) {
            fastify.log.error({ msg: 'Failed to cancel subscription', error });
            return reply.code(500).send({ error: 'Failed to cancel subscription' });
        }
    });

    /**
     * GET /dashboard/billing/portal
     * Get Stripe Customer Portal URL
     */
    fastify.get('/dashboard/billing/portal', async (request: any, reply) => {
        const user = request.user;
        const returnUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        if (!user.stripeCustomerId) {
            return reply.code(400).send({ error: 'No billing account' });
        }

        try {
            const session = await getStripe().billingPortal.sessions.create({
                customer: user.stripeCustomerId,
                return_url: `${returnUrl}/dashboard/billing`
            });

            return { url: session.url };
        } catch (error) {
            fastify.log.error({ msg: 'Failed to create portal session', error });
            return reply.code(500).send({ error: 'Failed to access billing portal' });
        }
    });
}

/**
 * Mask license key for display (show first 8 and last 4 chars)
 */
function maskLicenseKey(key: string): string {
    if (key.length <= 12) return key;
    return `${key.slice(0, 8)}${'*'.repeat(key.length - 12)}${key.slice(-4)}`;
}
