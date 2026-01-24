import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";

// Adapt these imports to your worker code structure:
import { processStripeEventJob } from "../stripeProcessor";

describe("E2E-light: Stripe event -> Worker -> DB license state", () => {
    const prisma = new PrismaClient();
    let redis: IORedis;
    let queue: Queue;
    let worker: Worker;

    const queueName = "stripe-events";

    beforeAll(async () => {
        redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
            maxRetriesPerRequest: null // BullMQ requirement
        });
        queue = new Queue(queueName, { connection: redis });

        // Worker: either start BullMQ worker with the same processor you use in prod
        worker = new Worker(
            queueName,
            async (job) => {
                await processStripeEventJob({ prisma, job });
            },
            { connection: redis }
        );
    });

    afterAll(async () => {
        await worker.close();
        await queue.close();
        await redis.quit();
        await prisma.$disconnect();
    });

    it("checkout.session.completed -> license becomes active", async () => {
        // Arrange: minimal stripe event payload (adapt shape to your job schema)
        const event = {
            id: "evt_test_1",
            type: "checkout.session.completed",
            data: {
                object: {
                    id: "cs_test_1",
                    customer: "cus_test_1",
                    subscription: "sub_test_1",
                    metadata: {
                        // include whatever you use to map user/license
                    },
                    customer_details: {
                        email: "test_e2e@example.com"
                    }
                },
            },
        };

        // Act: add job
        await queue.add("stripe-event", { id: event.id, type: event.type, data: event.data }, { removeOnComplete: true });

        // Wait: small poll for DB to reflect processing
        const deadline = Date.now() + 10_000;
        let state: any = null;

        while (Date.now() < deadline) {
            // Adapt to your schema: locate by subscriptionId/customerId
            state = await prisma.license.findFirst({
                where: { stripeSubscriptionId: "sub_test_1" },
            });

            if (state?.status === "ACTIVE") break; // Enum is uppercase in Schema
            await new Promise((r) => setTimeout(r, 250));
        }

        expect(state).toBeTruthy();
        expect(state.status).toBe("ACTIVE");
    });

    it("invoice.payment_failed -> license becomes grace", async () => {
        const event = {
            id: "evt_test_2",
            type: "invoice.payment_failed",
            data: {
                object: {
                    id: "in_test_1",
                    subscription: "sub_test_1",
                    customer: "cus_test_1",
                },
            },
        };

        await queue.add("stripe-event", { id: event.id, type: event.type, data: event.data }, { removeOnComplete: true });

        const deadline = Date.now() + 10_000;
        let state: any = null;

        while (Date.now() < deadline) {
            state = await prisma.license.findFirst({
                where: { stripeSubscriptionId: "sub_test_1" },
            });

            if (state?.status === "GRACE") break; // Enum is uppercase in Schema
            await new Promise((r) => setTimeout(r, 250));
        }

        expect(state).toBeTruthy();
        expect(state.status).toBe("GRACE");
    });
});
