import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { addHours, addDays, isPast } from 'date-fns';
import { sendMagicLinkEmail } from '../services/email';

const prisma = new PrismaClient();

// Configuration
const MAGIC_LINK_EXPIRY_HOURS = 1;
const SESSION_EXPIRY_DAYS = 30;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Schemas
const MagicLinkSchema = z.object({
    email: z.string().email()
});

const VerifyMagicLinkSchema = z.object({
    token: z.string().min(32)
});

/**
 * Generate a cryptographically secure random token
 */
function generateToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token for secure storage
 */
function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export async function authRoutes(fastify: FastifyInstance) {

    /**
     * POST /auth/magic-link
     * Send a magic link email to the user
     */
    fastify.post('/auth/magic-link', async (request, reply) => {
        let email;
        try {
            const body = MagicLinkSchema.parse(request.body);
            email = body.email;
        } catch (error) {
            return reply.code(400).send({ error: 'Invalid email address' });
        }

        // Generate token
        const token = generateToken();
        const hashedToken = hashToken(token);
        const expiresAt = addHours(new Date(), MAGIC_LINK_EXPIRY_HOURS);

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { email }
            });
        }

        // Store hashed token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                magicLinkToken: hashedToken,
                magicLinkExpiry: expiresAt
            }
        });

        // Build magic link URL
        const magicLinkUrl = `${FRONTEND_URL}/login/verify?token=${token}&email=${encodeURIComponent(email)}`;

        // Send email via Nodemailer
        try {
            await sendMagicLinkEmail({ email, magicLinkUrl });
            fastify.log.info({ msg: 'Magic link email sent', email });
        } catch (error) {
            fastify.log.error({ msg: 'Failed to send magic link email', email, error });
            // In dev mode, also log the URL for testing
            if (process.env.NODE_ENV !== 'production') {
                fastify.log.info({ msg: 'Magic link URL (dev fallback)', magicLinkUrl });
            }
        }

        return {
            success: true,
            message: 'If an account exists, a magic link has been sent.'
        };
    });

    /**
     * POST /auth/verify-magic-link
     * Verify magic link token and create session
     */
    fastify.post('/auth/verify-magic-link', async (request, reply) => {
        const { token } = VerifyMagicLinkSchema.parse(request.body);
        const hashedToken = hashToken(token);

        // Find user with matching token
        const user = await prisma.user.findFirst({
            where: {
                magicLinkToken: hashedToken,
                magicLinkExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return reply.code(401).send({ error: 'Invalid or expired token' });
        }

        // Clear magic link token (one-time use)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                magicLinkToken: null,
                magicLinkExpiry: null,
                emailVerified: new Date()
            }
        });

        // Create session
        const sessionToken = generateToken();
        const sessionExpiresAt = addDays(new Date(), SESSION_EXPIRY_DAYS);

        await prisma.session.create({
            data: {
                userId: user.id,
                token: hashToken(sessionToken),
                expiresAt: sessionExpiresAt
            }
        });

        // Set session cookie
        reply.setCookie('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 // seconds
        });

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email
            }
        };
    });

    /**
     * GET /auth/me
     * Get current authenticated user
     */
    fastify.get('/auth/me', async (request, reply) => {
        const sessionToken = request.cookies?.session;

        if (!sessionToken) {
            return reply.code(401).send({ error: 'Not authenticated' });
        }

        const hashedSessionToken = hashToken(sessionToken);
        const session = await prisma.session.findUnique({
            where: { token: hashedSessionToken },
            include: { user: true }
        });

        if (!session || isPast(session.expiresAt)) {
            // Clean up expired session
            if (session) {
                await prisma.session.delete({ where: { id: session.id } });
            }
            reply.clearCookie('session');
            return reply.code(401).send({ error: 'Session expired' });
        }

        return {
            user: {
                id: session.user.id,
                email: session.user.email,
                emailVerified: session.user.emailVerified
            }
        };
    });

    /**
     * POST /auth/logout
     * End current session
     */
    fastify.post('/auth/logout', async (request, reply) => {
        const sessionToken = request.cookies?.session;

        if (sessionToken) {
            const hashedSessionToken = hashToken(sessionToken);
            await prisma.session.deleteMany({
                where: { token: hashedSessionToken }
            });
        }

        reply.clearCookie('session');
        return { success: true };
    });
}
