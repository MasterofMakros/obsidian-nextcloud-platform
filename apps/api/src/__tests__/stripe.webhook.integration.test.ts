import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import request from "supertest";
import crypto from "crypto";

// Setup Mock environment variables BEFORE importing the app or routes
process.env.STRIPE_SECRET_KEY = "sk_test_key";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";

// Use vi.hoisted to ensure mocks are available
const { prismaMock, constructEventMock, eventQueueAddMock } = vi.hoisted(() => {
    return {
        prismaMock: {
            $disconnect: vi.fn(),
        },
        constructEventMock: vi.fn(),
        eventQueueAddMock: vi.fn(),
    };
});

// Mock Prisma
vi.mock("@prisma/client", () => {
    return {
        PrismaClient: class {
            constructor() {
                return prismaMock;
            }
        }
    };
});

// Mock Redis
vi.mock("ioredis", () => {
    const EventEmitter = require("events");
    return {
        Redis: class extends EventEmitter {
            status = 'ready';
            constructor() {
                super();
                setTimeout(() => this.emit("ready"), 0);
                this.quit = vi.fn().mockResolvedValue(undefined);
                this.on = this.on.bind(this);
            }
        }
    };
});

// Mock fastify-rate-limit
vi.mock("@fastify/rate-limit", () => {
    return {
        default: function (instance, opts, next) {
             next();
        }
    };
});

// Mock BullMQ
vi.mock("bullmq", () => {
    return {
        Queue: class {
            constructor() {}
            add = eventQueueAddMock;
        }
    };
});

// Mock Stripe (The one used by the API)
vi.mock("stripe", () => {
    return {
        default: class {
            constructor() {}
            webhooks = {
                constructEvent: constructEventMock,
            };
        }
    };
});

import { buildApp } from "../index";

// Helper to generate signature manually since generateTestHeaderString might be missing/issue
function generateTestHeaderString(payload: string, secret: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const signature = hmac.digest('hex');
    return `t=${timestamp},v1=${signature}`;
}

vi.setConfig({ testTimeout: 10000 });

describe("POST /stripe/webhook Integration", () => {
    let app: any;

    beforeAll(async () => {
        app = await buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Valid Signature -> 200", async () => {
        const payload = {
            id: "evt_test_123",
            object: "event",
            type: "payment_intent.succeeded",
            data: { object: { id: "pi_123" } }
        };
        const payloadString = JSON.stringify(payload);

        // Generate a valid signature
        const header = generateTestHeaderString(payloadString, process.env.STRIPE_WEBHOOK_SECRET!);

        // Mock constructEvent to succeed and return the event
        constructEventMock.mockReturnValue(payload);

        const res = await request(app.server)
            .post("/stripe/webhook")
            .set("stripe-signature", header)
            .set("Content-Type", "application/json")
            .send(payload);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ received: true });
        
        // Verify queue was called
        expect(eventQueueAddMock).toHaveBeenCalledWith(
            "stripe-event",
            expect.objectContaining({
                id: "evt_test_123",
                type: "payment_intent.succeeded"
            }),
            expect.any(Object)
        );
    });

    it("Invalid Signature -> 401", async () => {
        const payload = { type: "test" };
        const payloadString = JSON.stringify(payload);

        // Mock constructEvent to throw error
        constructEventMock.mockImplementation(() => {
            throw new Error("Invalid signature");
        });

        const res = await request(app.server)
            .post("/stripe/webhook")
            .set("stripe-signature", "t=123,v1=bad_signature")
            .set("Content-Type", "application/json")
            .send(payload);

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Invalid signature");
        
        expect(eventQueueAddMock).not.toHaveBeenCalled();
    });

    it("Missing Signature Header -> 400", async () => {
        const res = await request(app.server)
            .post("/stripe/webhook")
            .send({ some: "data" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Missing signature");
    });

    it("Unknown Event Type -> Logged but 200", async () => {
        const payload = {
            id: "evt_unknown",
            type: "unknown.event_type",
            data: {}
        };
        const payloadString = JSON.stringify(payload);
        
        // Setup mock to succeed
        constructEventMock.mockReturnValue(payload);
        
        const header = generateTestHeaderString(payloadString, process.env.STRIPE_WEBHOOK_SECRET!);

        const res = await request(app.server)
            .post("/stripe/webhook")
            .set("stripe-signature", header)
            .set("Content-Type", "application/json")
            .send(payload);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ received: true });
        
        // Should still be added to queue
        expect(eventQueueAddMock).toHaveBeenCalled();
    });
});

