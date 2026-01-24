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

// Mock Stripe to avoid env var requirement and external calls
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

// Import buildApp after mocking
import { buildApp } from "../index";

import * as crypto from "crypto";
import * as ed from "@noble/ed25519";

// Increase timeout
vi.setConfig({ testTimeout: 10000 });

describe("POST /license/activate Integration", () => {
    let app: any;

    beforeAll(async () => {
        // Polyfill ed25519 hashes for Node environment in tests
        ed.etc.sha512Sync = (...m) => crypto.createHash("sha512").update(ed.etc.concatBytes(...m)).digest();
        ed.etc.sha512Async = (...m) => Promise.resolve(ed.etc.sha512Sync(...m));

        // Setup app
        app = await buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Happy Path: Successfully activates a valid license", async () => {
        const licenseKey = "valid-key";
        const deviceIdHash = "device-123";

        // Mock DB response for findFirst
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_123",
            hashedKey: licenseKey,
            status: "ACTIVE",
            deviceIdHashes: [],
            userId: "user_1",
            plan: "PRO",
            features: [],
            keyVersion: 1,
            expiresAt: new Date(Date.now() + 1000000), // Future
        });

        // Mock DB response for update
        (prismaMock.license.update as any).mockResolvedValue({
            id: "lic_123",
            deviceIdHashes: [deviceIdHash],
        });

        const res = await request(app.server)
            .post("/license/activate")
            .send({ licenseKey, deviceIdHash });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.status).toBe("ACTIVE");
        expect(res.body.plan).toBe("PRO");
        
        expect(prismaMock.license.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: { hashedKey: licenseKey }
        }));
        
        expect(prismaMock.license.update).toHaveBeenCalled();
    });

    it("Invalid Key: Returns 404 for non-existent key", async () => {
        (prismaMock.license.findFirst as any).mockResolvedValue(null);

        const res = await request(app.server)
            .post("/license/activate")
            .send({ licenseKey: "invalid", deviceIdHash: "device-1" });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("License not found");
    });

    it("Revoked Key: Returns 403", async () => {
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_revoked",
            hashedKey: "revoked-key",
            status: "REVOKED",
            deviceIdHashes: [],
        });

        const res = await request(app.server)
            .post("/license/activate")
            .send({ licenseKey: "revoked-key", deviceIdHash: "device-1" });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("License is not active");
    });

    it("Expired Key: Returns 403", async () => {
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_expired",
            hashedKey: "expired-key",
            status: "EXPIRED",
            deviceIdHashes: [],
        });

        const res = await request(app.server)
            .post("/license/activate")
            .send({ licenseKey: "expired-key", deviceIdHash: "device-1" });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("License is not active");
    });

    it("Device Limit: Returns 403 when limit is reached (max 3)", async () => {
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_limit",
            hashedKey: "limit-key",
            status: "ACTIVE",
            // Already 3 devices
            deviceIdHashes: ["dev1", "dev2", "dev3"], 
        });

        const res = await request(app.server)
            .post("/license/activate")
            .send({ licenseKey: "limit-key", deviceIdHash: "dev4" });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("Device limit reached");
        expect(res.body.limit).toBe(3);
    });

    it("Device Limit: Allows activation if device is already registered", async () => {
        const deviceIdHash = "dev1";
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_limit",
            hashedKey: "limit-key",
            status: "ACTIVE",
            deviceIdHashes: ["dev1", "dev2", "dev3"], // Full, but dev1 matches
            userId: "u1",
            plan: "PRO",
            features: [],
            keyVersion: 1
        });

        (prismaMock.license.update as any).mockResolvedValue({});

        const res = await request(app.server)
            .post("/license/activate")
            .send({ licenseKey: "limit-key", deviceIdHash });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    it("Grace Period: Activates with GRACE status if in grace period", async () => {
        // The prompt says "Abgelaufene Subscription im Grace → spezielle Response"
        (prismaMock.license.findFirst as any).mockResolvedValue({
            id: "lic_grace",
            hashedKey: "grace-key",
            status: "GRACE",
            deviceIdHashes: [],
            userId: "u1",
            plan: "PRO",
            features: [],
            keyVersion: 1
        });
        
        (prismaMock.license.update as any).mockResolvedValue({});

        const res = await request(app.server)
            .post("/license/activate")
            .send({ licenseKey: "grace-key", deviceIdHash: "dev1" });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("GRACE");
    });
});
