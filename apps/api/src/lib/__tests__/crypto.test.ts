import { describe, it, expect } from 'vitest';
import { generateKeyPair, sign, verify, hash } from '../crypto';

describe('Crypto Module', () => {
    describe('generateKeyPair', () => {
        it('should generate a valid key pair with hex strings', async () => {
            const keys = await generateKeyPair();
            expect(keys).toHaveProperty('privateKey');
            expect(keys).toHaveProperty('publicKey');
            expect(typeof keys.privateKey).toBe('string');
            expect(typeof keys.publicKey).toBe('string');
            // Ed25519 private keys are 32 bytes (64 hex chars)
            expect(keys.privateKey.length).toBe(64);
            // Public keys are 32 bytes (64 hex chars)
            expect(keys.publicKey.length).toBe(64);
        });
    });

    describe('Sign & Verify', () => {
        it('should sign and verify a message correctly', async () => {
            const { privateKey, publicKey } = await generateKeyPair();
            const message = 'Hello, World!';

            const signature = await sign(message, privateKey);
            expect(typeof signature).toBe('string');
            // Base64 check roughly
            expect(signature).toMatch(/^[a-zA-Z0-9+/]+={0,2}$/);

            const isValid = await verify(signature, message, publicKey);
            expect(isValid).toBe(true);
        });

        it('should fail verification if message is changed', async () => {
            const { privateKey, publicKey } = await generateKeyPair();
            const message = 'Original Message';
            const signature = await sign(message, privateKey);

            const isValid = await verify(signature, 'Modified Message', publicKey);
            expect(isValid).toBe(false);
        });

        it('should fail verification if signature is invalid', async () => {
            const { privateKey, publicKey } = await generateKeyPair();
            const message = 'Test Message';
            await sign(message, privateKey); // just to ensure it works

            const invalidSignature = Buffer.from('invalid_signature_bytes').toString('base64');
            const isValid = await verify(invalidSignature, message, publicKey);
            expect(isValid).toBe(false);
        });

        it('should fail verification if public key is different', async () => {
            const pair1 = await generateKeyPair();
            const pair2 = await generateKeyPair();
            const message = 'Test Message';

            const signature = await sign(message, pair1.privateKey);
            
            // Verify with wrong public key
            const isValid = await verify(signature, message, pair2.publicKey);
            expect(isValid).toBe(false);
        });
    });

    describe('Hash', () => {
        it('should generate correct SHA-256 hash', () => {
            const input = 'test';
            const expectedHash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
            const result = hash(input);
            expect(result).toBe(expectedHash);
        });

        it('should generate different hashes for different inputs', () => {
            const hash1 = hash('abc');
            const hash2 = hash('abd');
            expect(hash1).not.toBe(hash2);
        });
    });
});
