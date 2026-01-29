import { FastifyPluginAsync } from "fastify";
import { prisma, License, EmailLog, PaymentEvent } from "@onm/db";
import { z } from "zod";

/**
 * Revenue Protection Endpoints
 * 
 * Used by n8n workflows for:
 * - Churn Prevention (expiring licenses)
 * - Dunning (failed payments)
 * - Upsell (FREE → PRO conversion)
 */

const ExpiringLicensesQuery = z.object({
    days: z.coerce.number().min(1).max(30).default(7),
});

const LogEmailBody = z.object({
    userId: z.string().uuid(),
    licenseId: z.string().uuid().optional(),
    emailType: z.enum([
        "churn_7d", "churn_3d", "churn_1d",
        "dunning_1", "dunning_2", "dunning_3",
        "upsell"
    ]),
});

const revenueRoutes: FastifyPluginAsync = async (app) => {

    /**
     * GET /v1/revenue/expiring-licenses
     * Returns licenses expiring within N days (for churn prevention)
     */
    app.get("/v1/revenue/expiring-licenses", async (req, reply) => {
        if (!app.requireAuth(req, reply)) return;

        const { days } = ExpiringLicensesQuery.parse(req.query);

        const now = new Date();
        const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const licenses = await prisma.license.findMany({
            where: {
                status: "ACTIVE",
                plan: { not: "LIFETIME" }, // Lifetime licenses don't expire
                expiresAt: {
                    gte: now,
                    lte: targetDate,
                },
            },
            include: {
                user: {
                    select: { id: true, email: true },
                },
                emailLogs: {
                    where: {
                        emailType: { startsWith: "churn_" },
                        sentAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
                    },
                    select: { emailType: true, sentAt: true },
                },
            },
        });

        // Filter out licenses that already received this reminder
        const emailTypeForDays = days <= 1 ? "churn_1d" : days <= 3 ? "churn_3d" : "churn_7d";

        const filtered = licenses.filter((lic: License & { emailLogs: EmailLog[] }) => {
            const alreadySent = lic.emailLogs.some((log: EmailLog) => log.emailType === emailTypeForDays);
            return !alreadySent;
        });

        return reply.send({
            count: filtered.length,
            emailType: emailTypeForDays,
            licenses: filtered.map((lic: License & { user: { email: string } }) => ({
                id: lic.id,
                userId: lic.userId,
                email: lic.user.email,
                plan: lic.plan,
                expiresAt: lic.expiresAt,
                daysRemaining: Math.ceil((lic.expiresAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
            })),
        });
    });

    /**
     * GET /v1/revenue/failed-payments
     * Returns unprocessed failed payment events (for dunning)
     */
    app.get("/v1/revenue/failed-payments", async (req, reply) => {
        if (!app.requireAuth(req, reply)) return;

        const failedPayments = await prisma.paymentEvent.findMany({
            where: {
                type: "invoice.payment_failed",
                status: { in: ["PENDING", "FAILED"] },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        // Extract relevant info from Stripe payload
        const results = failedPayments.map((event: PaymentEvent) => {
            const payload = event.payload as Record<string, unknown>;
            const invoice = (payload.data as Record<string, unknown>)?.object as Record<string, unknown> || {};

            return {
                id: event.id,
                stripeId: event.stripeId,
                customerEmail: invoice.customer_email || "unknown",
                customerId: invoice.customer || null,
                attemptCount: invoice.attempt_count || 1,
                amountDue: invoice.amount_due || 0,
                currency: invoice.currency || "usd",
                createdAt: event.createdAt,
            };
        });

        return reply.send({
            count: results.length,
            failedPayments: results,
        });
    });

    /**
     * GET /v1/revenue/upsell-candidates
     * Returns FREE users who might convert to PRO
     */
    app.get("/v1/revenue/upsell-candidates", async (req, reply) => {
        if (!app.requireAuth(req, reply)) return;

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        // Find FREE users with high device usage (>3 devices = power user)
        const candidates = await prisma.license.findMany({
            where: {
                plan: "FREE",
                status: "ACTIVE",
                createdAt: { lte: fourteenDaysAgo }, // Account older than 14 days
            },
            include: {
                user: {
                    select: { id: true, email: true },
                },
                emailLogs: {
                    where: {
                        emailType: "upsell",
                        sentAt: { gte: thirtyDaysAgo },
                    },
                },
            },
        });

        // Filter: high usage + no recent upsell email
        const filtered = candidates.filter((lic: License & { emailLogs: EmailLog[] }) => {
            const deviceCount = lic.deviceIdHashes?.length || 0;
            const recentUpsell = lic.emailLogs.length > 0;
            return deviceCount >= 3 && !recentUpsell;
        });

        return reply.send({
            count: filtered.length,
            candidates: filtered.map((lic: License & { user: { email: string } }) => ({
                licenseId: lic.id,
                userId: lic.userId,
                email: lic.user.email,
                deviceCount: lic.deviceIdHashes?.length || 0,
                accountAgeDays: Math.floor((Date.now() - lic.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
            })),
        });
    });

    /**
     * POST /v1/revenue/log-email
     * Records that an automated email was sent (prevents spam)
     */
    app.post("/v1/revenue/log-email", async (req, reply) => {
        if (!app.requireAuth(req, reply)) return;

        const body = LogEmailBody.parse(req.body);

        const log = await prisma.emailLog.create({
            data: {
                userId: body.userId,
                licenseId: body.licenseId,
                emailType: body.emailType,
            },
        });

        return reply.code(201).send({
            success: true,
            logId: log.id,
        });
    });

    /**
     * POST /v1/revenue/mark-payment-processed
     * Marks a failed payment event as processed (after dunning sequence)
     */
    app.post("/v1/revenue/mark-payment-processed", async (req, reply) => {
        if (!app.requireAuth(req, reply)) return;

        const { eventId } = z.object({ eventId: z.string().uuid() }).parse(req.body);

        await prisma.paymentEvent.update({
            where: { id: eventId },
            data: {
                status: "PROCESSED",
                processedAt: new Date(),
            },
        });

        return reply.send({ success: true });
    });
};

export default revenueRoutes;
