import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { buildApp } from "../index";

// Mock Email Service
vi.mock("../services/email", () => ({
    sendMagicLinkEmail: vi.fn().mockResolvedValue(true)
}));

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn()
        },
        session: {
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn()
        },
        $disconnect: vi.fn()
    }
}));

vi.mock("@prisma/client", () => ({
    PrismaClient: class {
        constructor() {
            return mockPrisma;
        }
    }
}));

// Mock BullMQ
vi.mock("bullmq", () => {
    return { Queue: class { constructor() { } add = vi.fn(); } };
});

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

describe("Auth Routes", () => {
    let app: any;

    beforeAll(async () => {
        app = await buildApp({
            redis: new MockRedis() as any
        });
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it("POST /auth/magic-link sends email for valid address", async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ id: "user_1", email: "test@example.com" });
        mockPrisma.user.update.mockResolvedValue({});

        const res = await request(app.server)
            .post("/auth/magic-link")
            .send({ email: "test@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("POST /auth/magic-link creates user if not exists", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({ id: "user_new", email: "new@example.com" });
        mockPrisma.user.update.mockResolvedValue({});

        const res = await request(app.server)
            .post("/auth/magic-link")
            .send({ email: "new@example.com" });

        expect(res.status).toBe(200);
        expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it("POST /auth/magic-link rejects invalid email", async () => {
        const res = await request(app.server)
            .post("/auth/magic-link")
            .send({ email: "not-an-email" });

        expect(res.status).toBe(400);
    });
});
