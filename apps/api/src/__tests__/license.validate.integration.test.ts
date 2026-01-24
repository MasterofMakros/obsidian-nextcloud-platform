import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import request from "supertest";

// Use vi.hoisted to ensure prismaMock is available in the mock factory
const { prismaMock } = vi.hoisted(() => {
    return {
        prismaMock: {
            license: {
                findFirst: vi.fn(),
                update: vi.fn(),
                findUnique: vi.fn(),
            },
            $disconnect: vi.fn(),
        }
    };
});

vi.mock("@prisma/client", () => {
    return {
        // Mock the constructor to return our shared prismaMock object
        PrismaClient: class {
            constructor() {
                return prismaMock;
            }
        },
        LicenseStatus: {
            ACTIVE: "ACTIVE",
            REVOKED: "REVOKED",
            EXPIRED: "EXPIRED",
            GRACE: "GRACE",
        },
        LicensePlan: {
            PRO: "PRO",
            FREE: "FREE",
        },
    };
});

// Mock Redis to avoid connection errors during tests
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

// Mock fastify-rate-limit to avoid Redis dependency issues
vi.mock("@fastify/rate-limit", () => {
    return {
        default: function (instance, opts, next) {
             next();
        }
    };
});

// Mock Stripe
vi.mock("stripe", () => {
    return {
        default: class {
            constructor() {}
            webhooks = {
                constructEvent: vi.fn(),
            };
        }
    };
});

// Mock BullMQ
vi.mock("bullmq", () => {
    return {
        Queue: class {
            constructor() {}
            add = vi.fn();
        }
    };
});

import { buildApp } from "../index";

vi.setConfig({ testTimeout: 10000 });

describe("POST /license/validate Integration", () => {
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

    it("Valid Device + Active License -> 200 + Status", async () => {
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_active",
            hashedKey: "valid-key",
            status: "ACTIVE",
            deviceIdHashes: ["known-device"],
            expiresAt: new Date(Date.now() + 1000000),
            userId: "u1",
            plan: "PRO"
        });

        const res = await request(app.server)
            .post("/license/validate")
            .send({ licenseKey: "valid-key", deviceIdHash: "known-device" });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("valid");
        expect(res.body.licenseStatus).toBe("ACTIVE");
    });

    it("Unknown Device -> 401", async () => {
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_active",
            hashedKey: "valid-key",
            status: "ACTIVE",
            deviceIdHashes: ["other-device"],
            expiresAt: new Date(Date.now() + 1000000),
            userId: "u1",
            plan: "PRO"
        });

        const res = await request(app.server)
            .post("/license/validate")
            .send({ licenseKey: "valid-key", deviceIdHash: "unknown-device" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Unknown Device");
    });

    it("Revoked License -> 403", async () => {
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_revoked",
            hashedKey: "revoked-key",
            status: "REVOKED",
            deviceIdHashes: ["known-device"],
            userId: "u1",
            plan: "PRO"
        });

        const res = await request(app.server)
            .post("/license/validate")
            .send({ licenseKey: "revoked-key", deviceIdHash: "known-device" });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("License revoked");
    });

    it("Expired License -> 401 with hint", async () => {
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_expired",
            hashedKey: "expired-key",
            status: "EXPIRED",
            deviceIdHashes: ["known-device"],
            expiresAt: new Date(Date.now() - 1000000), // Past
            userId: "u1",
            plan: "PRO"
        });

        const res = await request(app.server)
            .post("/license/validate")
            .send({ licenseKey: "expired-key", deviceIdHash: "known-device" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("License expired");
        expect(res.body).toHaveProperty("hint");
    });
});
