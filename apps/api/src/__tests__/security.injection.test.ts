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

// Import buildApp after mocking
import { buildApp } from "../index";
import * as crypto from "crypto";
import * as ed from "@noble/ed25519";

// Increase timeout
vi.setConfig({ testTimeout: 10000 });

describe("Security Injection Tests", () => {
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

    describe("SQL Injection Prevention", () => {
        it("should handle SQL Injection payload in licenseKey gracefully (404 Not Found)", async () => {
            const sqlPayload = "' OR '1'='1";
            (prismaMock.license.findFirst as any).mockResolvedValue(null);

            const res = await request(app.server)
                .post("/license/activate")
                .send({ licenseKey: sqlPayload, deviceIdHash: "valid-device" });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("License not found");

            // Verify the payload was passed to Prisma exactly as is (parameterized), not concatenated
            expect(prismaMock.license.findFirst).toHaveBeenCalledWith(expect.objectContaining({
                where: { hashedKey: sqlPayload }
            }));
        });

        it("should handle SQL Injection payload in deviceIdHash gracefully", async () => {
            const sqlPayload = "'; DROP TABLE License; --";
            // Mock a valid license found to proceed to device check
            (prismaMock.license.findFirst as any).mockResolvedValue({
                id: "lic_123",
                hashedKey: "valid-key",
                status: "ACTIVE",
                deviceIdHashes: [],
                userId: "user_1",
                plan: "PRO",
                features: [],
                keyVersion: 1,
                expiresAt: new Date(Date.now() + 1000000),
            });
            (prismaMock.license.update as any).mockResolvedValue({});

            const res = await request(app.server)
                .post("/license/activate")
                .send({ licenseKey: "valid-key", deviceIdHash: sqlPayload });

            expect(res.status).toBe(200);
            
            // Verify update was called with the "dangerous" string as a value, not executing it
            expect(prismaMock.license.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    deviceIdHashes: { push: sqlPayload }
                })
            }));
        });
        
        it("should handle Union-based SQL Injection in validate endpoint", async () => {
            const unionPayload = "' UNION SELECT 1, 'admin', 'password' --";
            (prismaMock.license.findFirst as any).mockResolvedValue(null);

            const res = await request(app.server)
                .post("/license/validate")
                .send({ licenseKey: unionPayload, deviceIdHash: "valid-device" });

            expect(res.status).toBe(404);
            expect(prismaMock.license.findFirst).toHaveBeenCalledWith(expect.objectContaining({
                where: { hashedKey: unionPayload }
            }));
        });
    });

    describe("XSS Payload Prevention", () => {
        it("should accept XSS payload in deviceIdHash but treat it as literal string", async () => {
            const xssPayload = "<script>alert('xss')</script>";
            
            (prismaMock.license.findFirst as any).mockResolvedValue({
                id: "lic_xss",
                hashedKey: "valid-key",
                status: "ACTIVE",
                deviceIdHashes: [],
                userId: "user_1",
                plan: "PRO",
                features: [],
                keyVersion: 1,
                expiresAt: new Date(Date.now() + 1000000),
            });
            (prismaMock.license.update as any).mockResolvedValue({});

            const res = await request(app.server)
                .post("/license/activate")
                .send({ licenseKey: "valid-key", deviceIdHash: xssPayload });

            expect(res.status).toBe(200);
            
            // Verify the XSS string is just stored as data
            expect(prismaMock.license.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    deviceIdHashes: { push: xssPayload }
                })
            }));
        });
    });
});
