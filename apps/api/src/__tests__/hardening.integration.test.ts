import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";

// Mock PrismaClient
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
    return { Queue: class { constructor() { } add = vi.fn(); } };
});

// Mock Stripe
vi.mock("stripe", () => {
    return { default: class { constructor() { } webhooks = { constructEvent: vi.fn() }; } };
});

import { buildApp } from "../index";

describe("P1-5 Hardening - Integration", () => {
    let app: any;

    beforeAll(async () => {
        process.env.CORS_ALLOW_ORIGINS = "https://allowed.example";
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
        expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    });

    it("allows allowed CORS origin", async () => {
        const res = await request(app.server)
            .get("/health")
            .set("Origin", "https://allowed.example");
        expect(res.headers["access-control-allow-origin"]).toBe("https://allowed.example");
    });

    it("rate limits /license/activate (expects 429 after exceeding)", async () => {
        const payload = { licenseKey: "test", deviceIdHash: "test" };

        let last = null as any;
        for (let i = 0; i < 50; i++) {
            last = await request(app.server)
                .post("/license/activate")
                .send(payload)
                .set("Content-Type", "application/json");
            if (last.status === 429) break;
        }

        expect(last).not.toBeNull();
        if (last.status !== 429) {
            console.log("Last response status:", last.status);
            console.log("Last response body:", JSON.stringify(last.body, null, 2));
        }
        expect(last.status).toBe(429);
    });
});
