import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { buildApp } from "../index";

// Mock Date to control "isPast" checks
vi.mock("date-fns", async () => {
    const actual = await vi.importActual("date-fns");
    return { ...actual, isPast: () => false };
});


const { mockPrisma, mockStripe, mockUser, mockSession } = vi.hoisted(() => {
    const user = { id: "user_1", stripeCustomerId: "cus_123" };
    const session = {
        id: "sess_1",
        token: "hashed_token",
        expiresAt: new Date(Date.now() + 10000),
        user
    };

    return {
        mockUser: user,
        mockSession: session,
        mockPrisma: {
            license: {
                findFirst: vi.fn(),
                findMany: vi.fn(),
                update: vi.fn()
            },
            session: {
                findUnique: vi.fn().mockResolvedValue(session),
                delete: vi.fn()
            },
            $disconnect: vi.fn()
        },
        mockStripe: {
            subscriptions: {
                list: vi.fn(),
                update: vi.fn()
            },
            billingPortal: {
                sessions: {
                    create: vi.fn()
                }
            }
        }
    };
});

vi.mock("@prisma/client", () => ({
    PrismaClient: class {
        constructor() {
            return mockPrisma;
        }
    },
    LicenseStatus: { ACTIVE: "ACTIVE" },
    LicensePlan: { PRO: "PRO" }
}));

vi.mock("stripe", () => ({
    default: class {
        constructor() { return mockStripe; }
    }
}));

// Mock BullMQ to prevent Redis connection
vi.mock("bullmq", () => {
    return { Queue: class { constructor() { } add = vi.fn(); } };
});

// Cancelled crypto mock - using real crypto module



// Mock Redis
// Mock Redis Class for Injection
class MockRedis extends require("events") {
    status = 'ready';
    constructor() {
        super();
        setTimeout(() => this.emit("ready"), 0);
        this.quit = vi.fn().mockResolvedValue(undefined);
        this.on = this.on.bind(this);
        (this as any).defineCommand = vi.fn();
    }
}

describe("Dashboard Routes", () => {
    let app: any;
    let cookie = "";

    beforeAll(async () => {
        process.env.STRIPE_SECRET_KEY = "sk_test_mock"; // Required for getStripe()
        // Inject mocks directly
        app = await buildApp({
            redis: new MockRedis() as any
        });
        await app.ready();
        // Simulate logged in cookie
        cookie = "session=valid_token";
    });

    afterAll(async () => {
        await app.close();
    });

    it("GET /dashboard/licenses returns masked keys", async () => {
        mockPrisma.license.findMany.mockResolvedValue([
            {
                id: "lic_1",
                publicKey: "12345678-xxxx-xxxx-xxxx-1234",
                status: "ACTIVE",
                deviceIdHashes: ["d1", "d2"],
                plan: "PRO",
                createdAt: new Date()
            }
        ]);

        const res = await request(app.server)
            .get("/dashboard/licenses")
            .set("Cookie", [cookie]);

        expect(res.status).toBe(200);
        expect(res.body.licenses).toHaveLength(1);
        expect(res.body.licenses[0].publicKey).toContain("12345678");
        expect(res.body.licenses[0].publicKey).toContain("****");
    });

    it("POST /dashboard/billing/cancel cancels subscription", async () => {
        mockStripe.subscriptions.list.mockResolvedValue({
            data: [{ id: "sub_1", status: "active" }]
        });
        mockStripe.subscriptions.update.mockResolvedValue({});

        const res = await request(app.server)
            .post("/dashboard/billing/cancel")
            .set("Cookie", [cookie]);

        if (res.status !== 200) {
            console.log("Billing Cancel Error:", JSON.stringify(res.body));
        }
        expect(res.status).toBe(200);
        expect(mockStripe.subscriptions.update).toHaveBeenCalledWith("sub_1", { cancel_at_period_end: true });
    });

    it("GET /dashboard/billing/portal returns url", async () => {
        mockStripe.billingPortal.sessions.create.mockResolvedValue({
            url: "https://billing.stripe.com/..."
        });

        const res = await request(app.server)
            .get("/dashboard/billing/portal")
            .set("Cookie", [cookie]);

        if (res.status !== 200) {
            console.log("Portal Error:", JSON.stringify(res.body));
        }
        expect(res.status).toBe(200);
        expect(res.body.url).toContain("https://billing.stripe.com");
    });

});
