import * as ed from '@noble/ed25519';
import { createHash } from 'node:crypto';

// Configure @noble/ed25519 to use Node.js crypto for SHA-512
// This is required for version 2.0+
ed.etc.sha512Sync = (...m) => createHash('sha512').update(ed.etc.concatBytes(...m)).digest();
// @ts-ignore
ed.etc.sha512Async = (...m) => Promise.resolve(ed.etc.sha512Sync(...m));

/**
 * Generates a new Ed25519 key pair.
 * Returns keys in Hex format.
 */
export async function generateKeyPair() {
    const privateKey = ed.utils.randomPrivateKey();
    const publicKey = await ed.getPublicKey(privateKey);
    return {
        privateKey: Buffer.from(privateKey).toString('hex'),
        publicKey: Buffer.from(publicKey).toString('hex')
    };
}

/**
 * Signs a message using Ed25519.
 * @param message The string message to sign.
 * @param privateKeyHex The private key in Hex format.
 * @returns The signature in Base64 format.
 */
export async function sign(message: string, privateKeyHex: string): Promise<string> {
    const msgBytes = new TextEncoder().encode(message);
    const signature = await ed.sign(msgBytes, privateKeyHex);
    return Buffer.from(signature).toString('base64');
}

/**
 * Verifies an Ed25519 signature.
 * @param signatureB64 The signature in Base64 format.
 * @param message The original message string.
 * @param publicKeyHex The public key in Hex format.
 * @returns True if valid, false otherwise.
 */
export async function verify(signatureB64: string, message: string, publicKeyHex: string): Promise<boolean> {
    try {
        const signature = Buffer.from(signatureB64, 'base64');
        const msgBytes = new TextEncoder().encode(message);
        return await ed.verify(signature, msgBytes, publicKeyHex);
    } catch (error) {
        return false;
    }
}

/**
 * Creates a SHA-256 hash of the input.
 * @param input The input string.
 * @returns The hash in Hex format.
 */
export function hash(input: string): string {
    return createHash('sha256').update(input).digest('hex');
}
