import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";

// Mock PrismaClient (Global instantiation in routes/license.ts causes failure without this)
vi.mock("@prisma/client", () => {
    return {
        PrismaClient: class {
            constructor() {
                return {
                    $disconnect: vi.fn(),
                    license: {
                        findFirst: vi.fn(),
                        update: vi.fn()
                    }
                };
            }
        },
        LicenseStatus: { ACTIVE: "ACTIVE", REVOKED: "REVOKED", EXPIRED: "EXPIRED" },
        LicensePlan: { PRO: "PRO", FREE: "FREE" }
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
                (this as any).defineCommand = vi.fn();
            }
        }
    };
});

// Mock BullMQ
vi.mock("bullmq", () => {
    return { Queue: class { constructor() {} add = vi.fn(); } };
});

// Mock Stripe
vi.mock("stripe", () => {
    return { default: class { constructor() {} webhooks = { constructEvent: vi.fn() }; } };
});

// Adapt import to your server factory.
// Must return FastifyInstance with .ready() and .close()
import { buildApp } from "../index";

describe("P1-5 Hardening - Integration", () => {
    let app: any;

    beforeAll(async () => {
        process.env.CORS_ALLOW_ORIGINS = "https://allowed.example";
        // Ensure rate limit store works for tests; if you require redis, run these in CI with redis.
        // If your app hard-requires Redis, keep as-is; CI will provide it.
        app = await buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it("adds security headers on /health", async () => {
        const res = await request(app.server).get("/health");

        expect(res.status).toBe(200);
        expect(res.headers["x-content-type-options"]).toBe("nosniff");
        expect(res.headers["x-frame-options"]).toBe("DENY");
        expect(res.headers["referrer-policy"]).toBe("no-referrer");
        expect(res.headers["cache-control"]).toContain("no-store");
    });

    it("allows requests without Origin (curl)", async () => {
        const res = await request(app.server).get("/health");
        expect(res.status).toBe(200);
    });

    it("rejects disallowed CORS origin", async () => {
        const res = await request(app.server)
            .get("/health")
            .set("Origin", "https://evil.example");

        // Depending on @fastify/cors behavior, it may:
        // - not set access-control-allow-origin
        // - or error out based on your implementation
        // Adjust to your actual behavior:
        expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    });

    it("allows allowed CORS origin", async () => {
        const res = await request(app.server)
            .get("/health")
            .set("Origin", "https://allowed.example");

        // Should explicitly allow
        expect(res.headers["access-control-allow-origin"]).toBe("https://allowed.example");
    });

    it("rate limits /license/activate (expects 429 after exceeding)", async () => {
        // If you require a body, provide a minimal payload.
        const payload = { licenseKey: "test", deviceIdHash: "test" };

        // Hit multiple times; tune count to your activate policy (e.g., 20/min).
        let last = null as any;
        for (let i = 0; i < 50; i++) {
            // Need to provide minimal valid body schema for zod or else 400 Bad Request
            last = await request(app.server)
                .post("/license/activate")
                .send(payload)
                .set("Content-Type", "application/json");
            if (last.status === 429) break;
        }

        expect(last).not.toBeNull();
        expect(last.status).toBe(429);
    });
});
