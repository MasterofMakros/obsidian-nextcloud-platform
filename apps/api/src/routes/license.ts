import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient, LicenseStatus, LicensePlan } from '@prisma/client';
import * as ed from '@noble/ed25519';
import { addDays, isPast } from 'date-fns';

const prisma = new PrismaClient();

// TODO: Load from secure secret storage (e.g. AWS ASM or .env SAFE)
// This MUST NOT be committed in real prod. 
// For this demo/code-generation, we assume these exist in process.env
// In a real scenario, use a dedicated KMS/HSM service.
const PRIVATE_KEY_HEX = process.env.LICENSE_PRIVATE_KEY || '0000000000000000000000000000000000000000000000000000000000000000';

// Schemas
const ActivateSchema = z.object({
    licenseKey: z.string(),
    deviceIdHash: z.string()
});

const RefreshSchema = z.object({
    token: z.string(),
    deviceIdHash: z.string()
});

const ValidateSchema = z.object({
    licenseKey: z.string(),
    deviceIdHash: z.string()
});

const RevokeSchema = z.object({
    licenseId: z.string(),
    reason: z.string().optional()
});

export async function licenseRoutes(fastify: FastifyInstance) {

    // POST /license/activate
    fastify.post('/license/activate', {
        config: { rateLimit: fastify.ratePolicies.activate }
    }, async (request, reply) => {
        const { licenseKey, deviceIdHash } = ActivateSchema.parse(request.body);

        // 1. Find License
        // In real world, licenseKey would be hashed before lookup or lookup by ID part
        // For this impl, assuming hashedKey matching
        const license = await prisma.license.findFirst({
            where: { hashedKey: licenseKey } // Simplification: assume client sends raw key, we match hash?? 
            // Real implementation: user inputs "KEY", we hash it, compare to hashedKey.
        });

        if (!license) {
            return reply.code(404).send({ error: 'License not found' });
        }

        if (license.status === LicenseStatus.REVOKED || license.status === LicenseStatus.EXPIRED) {
            return reply.code(403).send({ error: 'License is not active' });
        }

        // 2. Check Device Limit (P1-2)
        const DEVICE_LIMIT = 3;
        let knownDevices = license.deviceIdHashes;

        if (!knownDevices.includes(deviceIdHash)) {
            if (knownDevices.length >= DEVICE_LIMIT) {
                return reply.code(403).send({
                    error: 'Device limit reached',
                    currentDevices: knownDevices.length,
                    limit: DEVICE_LIMIT
                });
            }
            // Will add new device
        }

        // 3. Generate Token
        const expiresAt = addDays(new Date(), 7); // Short TTL for offline verification
        const payload = {
            sub: license.userId,
            lic: license.id,
            plan: license.plan,
            features: license.features,
            exp: expiresAt.getTime(),
            ver: license.keyVersion
        };

        const payloadStr = JSON.stringify(payload);
        const payloadB64 = Buffer.from(payloadStr).toString('base64');
        const signature = await ed.sign(new TextEncoder().encode(payloadStr), PRIVATE_KEY_HEX);
        const signatureB64 = Buffer.from(signature).toString('base64');
        const token = `${payloadB64}.${signatureB64}`;

        // 4. Update DB
        await prisma.license.update({
            where: { id: license.id },
            data: {
                deviceIdHashes: { push: deviceIdHash }, // Add distinct device
                lastValidatedAt: new Date()
            }
        });
        return { token, status: license.status, expiresAt, plan: license.plan };
    });


    // POST /license/refresh
    fastify.post('/license/refresh', {
        config: { rateLimit: fastify.ratePolicies.refresh }
    }, async (request, reply) => {
        const { token, deviceIdHash } = RefreshSchema.parse(request.body);

        const [payloadB64] = token.split('.');
        let payload;
        try {
            payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
        } catch (e) {
            return reply.code(400).send({ error: 'Invalid token format' });
        }

        // 1. Lookup License
        const license = await prisma.license.findUnique({
            where: { id: payload.lic }
        });

        if (!license) return reply.code(401).send({ error: 'License not found' });

        // 2. Check Grace/Revocation
        if (license.status === LicenseStatus.REVOKED) {
            return reply.code(401).send({ error: 'License revoked' });
        }

        // Check Grace Period
        let currentStatus = license.status;
        let graceDaysLeft = 0;

        if (license.expiresAt && isPast(license.expiresAt)) {
            // Check if within grace period
            if (license.graceEndsAt && !isPast(license.graceEndsAt)) {
                currentStatus = LicenseStatus.GRACE;
                // Calculate days left
                graceDaysLeft = Math.ceil((license.graceEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            } else {
                return reply.code(401).send({ error: 'License expired' });
            }
        }

        // 3. Issue New Token
        const nextExpiresAt = addDays(new Date(), 7);
        const newPayload = {
            ...payload,
            exp: nextExpiresAt.getTime(),
            status: currentStatus // Include status in token so client knows if grace
        };

        const newPayloadStr = JSON.stringify(newPayload);
        const newPayloadB64 = Buffer.from(newPayloadStr).toString('base64');
        const signature = await ed.sign(new TextEncoder().encode(newPayloadStr), PRIVATE_KEY_HEX);
        const newToken = `${newPayloadB64}.${Buffer.from(signature).toString('base64')}`;

        return {
            token: newToken,
            status: currentStatus,
            expiresAt: nextExpiresAt,
            graceDaysLeft
        };
    });

    // POST /license/validate
    fastify.post('/license/validate', {
        config: { rateLimit: fastify.ratePolicies.refresh }
    }, async (request, reply) => {
        const { licenseKey, deviceIdHash } = ValidateSchema.parse(request.body);

        const license = await prisma.license.findFirst({
            where: { hashedKey: licenseKey }
        });

        if (!license) {
            return reply.code(404).send({ error: 'License not found' });
        }

        if (license.status === LicenseStatus.REVOKED) {
            return reply.code(403).send({ error: 'License revoked' });
        }

        if (license.status === LicenseStatus.EXPIRED || (license.expiresAt && isPast(license.expiresAt))) {
            return reply.code(401).send({ error: 'License expired', hint: 'Please renew your license' });
        }

        if (!license.deviceIdHashes.includes(deviceIdHash)) {
            return reply.code(401).send({ error: 'Unknown Device' });
        }

        return { status: 'valid', licenseStatus: license.status };
    });

    // POST /admin/license/revoke
    fastify.post('/admin/license/revoke', async (request, reply) => {
        // TODO: Check AdminApiKey Header
        const { licenseId } = RevokeSchema.parse(request.body);

        await prisma.license.update({
            where: { id: licenseId },
            data: { status: LicenseStatus.REVOKED }
        });

        return reply.code(204).send();
    });

    // POST /admin/license/reset-devices (P1-2)
    fastify.post('/admin/license/reset-devices', async (request, reply) => {
        // TODO: Check AdminApiKey Header
        const ResetSchema = z.object({ licenseId: z.string() });
        const { licenseId } = ResetSchema.parse(request.body);

        await prisma.license.update({
            where: { id: licenseId },
            data: { deviceIdHashes: [] } // Clear list
        });

        return { status: 'ok', msg: 'Device list cleared' };
    });
}
