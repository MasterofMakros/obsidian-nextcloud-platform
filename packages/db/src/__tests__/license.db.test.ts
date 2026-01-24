import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

// Mock @prisma/client to avoid runtime issues with generated client
vi.mock('@prisma/client', () => ({
  PrismaClient: class {},
  LicenseStatus: {
    ACTIVE: 'ACTIVE',
    REVOKED: 'REVOKED',
    PAST_DUE: 'PAST_DUE',
    GRACE: 'GRACE',
    EXPIRED: 'EXPIRED'
  },
  LicensePlan: {
    FREE: 'FREE',
    PRO: 'PRO',
    LIFETIME: 'LIFETIME'
  }
}));

import { PrismaClient, LicenseStatus, LicensePlan } from '@prisma/client';
import { prisma } from '../client';

// Mocking the prisma client export
vi.mock('../client', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('License Model', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockDate = new Date();
  const mockLicense = {
    id: 'license-123',
    publicKey: 'pk_12345',
    hashedKey: 'hashed_secret_key',
    keyVersion: 1,
    userId: 'user-123',
    status: LicenseStatus.ACTIVE,
    plan: LicensePlan.PRO,
    stripeSubscriptionId: 'sub_123',
    features: ["4k-streaming"],
    deviceIdHashes: ['hash1', 'hash2'],
    expiresAt: null,
    graceEndsAt: null,
    lastValidatedAt: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  it('should create a new license', async () => {
    prismaMock.license.create.mockResolvedValue(mockLicense);

    const license = await prisma.license.create({
      data: {
        publicKey: 'pk_12345',
        hashedKey: 'hashed_secret_key',
        userId: 'user-123',
        features: ["4k-streaming"],
        deviceIdHashes: ['hash1', 'hash2']
      }
    });

    expect(license).toEqual(mockLicense);
    expect(prismaMock.license.create).toHaveBeenCalledWith({
       data: {
        publicKey: 'pk_12345',
        hashedKey: 'hashed_secret_key',
        userId: 'user-123',
        features: ["4k-streaming"],
        deviceIdHashes: ['hash1', 'hash2']
      }
    });
  });

  it('should read license by publicKey', async () => {
    prismaMock.license.findUnique.mockResolvedValue(mockLicense);

    const license = await prisma.license.findUnique({
      where: { publicKey: 'pk_12345' }
    });

    expect(license).toEqual(mockLicense);
    expect(prismaMock.license.findUnique).toHaveBeenCalledWith({
      where: { publicKey: 'pk_12345' }
    });
  });

  it('should update deviceIdHashes', async () => {
    const updatedLicense = { ...mockLicense, deviceIdHashes: ['hash1', 'hash2', 'hash3'] };
    prismaMock.license.update.mockResolvedValue(updatedLicense);

    const license = await prisma.license.update({
      where: { id: 'license-123' },
      data: {
        deviceIdHashes: ['hash1', 'hash2', 'hash3']
      }
    });

    expect(license.deviceIdHashes).toHaveLength(3);
    expect(prismaMock.license.update).toHaveBeenCalledWith(expect.objectContaining({
       data: { deviceIdHashes: ['hash1', 'hash2', 'hash3'] }
    }));
  });

  it('should update status from ACTIVE to REVOKED', async () => {
     const revokedLicense = { ...mockLicense, status: LicenseStatus.REVOKED };
     prismaMock.license.update.mockResolvedValue(revokedLicense);

     const license = await prisma.license.update({
       where: { id: 'license-123' },
       data: { status: LicenseStatus.REVOKED }
     });

     expect(license.status).toBe(LicenseStatus.REVOKED);
     expect(prismaMock.license.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'license-123' },
        data: { status: LicenseStatus.REVOKED }
     }));
  });
});
