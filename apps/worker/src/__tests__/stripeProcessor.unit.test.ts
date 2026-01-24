import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processStripeEventJob } from '../stripeProcessor';

// Mock Prisma Client
const mockPrisma = {
    paymentEvent: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
    user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
    license: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
    },
};

describe('stripeProcessor Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const baseJob = {
        data: {
            id: 'evt_123',
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_123',
                    customer: 'cus_123',
                    subscription: 'sub_123',
                    customer_details: { email: 'test@example.com' }
                }
            }
        }
    };

    it('should process a successful job (checkout.session.completed)', async () => {
        // Mock Idempotency check: Event not found (or not processed)
        mockPrisma.paymentEvent.findUnique.mockResolvedValue(null);
        
        // Mock User check: User not found, then create
        mockPrisma.user.findUnique.mockResolvedValue(null);
        mockPrisma.user.create.mockResolvedValue({ id: 'user_1', email: 'test@example.com', stripeCustomerId: 'cus_123' });

        // Mock License check: License not found, then create
        mockPrisma.license.findFirst.mockResolvedValue(null);
        mockPrisma.license.create.mockResolvedValue({ id: 'lic_1', userId: 'user_1', status: 'ACTIVE' });

        const result = await processStripeEventJob({ 
            prisma: mockPrisma as any, 
            job: baseJob 
        });

        // Verify Idempotency check
        expect(mockPrisma.paymentEvent.findUnique).toHaveBeenCalledWith({ where: { stripeId: 'evt_123' } });

        // Verify Event Creation
        expect(mockPrisma.paymentEvent.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ stripeId: 'evt_123', status: 'PENDING' })
        }));

        // Verify Logic (User creation)
        expect(mockPrisma.user.create).toHaveBeenCalled();

        // Verify Logic (License creation)
        expect(mockPrisma.license.create).toHaveBeenCalled();

        // Verify Event Update to PROCESSED
        expect(mockPrisma.paymentEvent.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { stripeId: 'evt_123' },
            data: expect.objectContaining({ status: 'PROCESSED' })
        }));
    });

    it('should handle Idempotency (skip if already PROCESSED)', async () => {
        // Mock Idempotency check: Event found and PROCESSED
        mockPrisma.paymentEvent.findUnique.mockResolvedValue({ 
            stripeId: 'evt_123', 
            status: 'PROCESSED' 
        });

        const result = await processStripeEventJob({ 
            prisma: mockPrisma as any, 
            job: baseJob 
        });

        expect(result).toBe('skipped_idempotent');
        
        // Should NOT create a new event record
        expect(mockPrisma.paymentEvent.create).not.toHaveBeenCalled();
        
        // Should NOT run logic
        expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should handle Failed Job -> Retry (throw error and update to FAILED)', async () => {
        // Mock Idempotency check: Event not found
        mockPrisma.paymentEvent.findUnique.mockResolvedValue(null);

        // Make the logic fail (e.g., Prisma error during User lookup)
        const fakeError = new Error('DB Connection Failed');
        mockPrisma.user.findUnique.mockRejectedValue(fakeError);

        await expect(processStripeEventJob({ 
            prisma: mockPrisma as any, 
            job: baseJob 
        })).rejects.toThrow('DB Connection Failed');

        // Verify Event Update to FAILED
        expect(mockPrisma.paymentEvent.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { stripeId: 'evt_123' },
            data: expect.objectContaining({ status: 'FAILED', error: 'DB Connection Failed' })
        }));
    });
});
