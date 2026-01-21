import * as ed from '@noble/ed25519';

// TODO: Replace with Real public key from backend (generated once)
const PUBLIC_KEY_HEX = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

export enum LicenseStatus {
    Unlicensed = 'No License',
    Active = 'Active',
    Expired = 'Expired',
    GracePeriod = 'Grace Period',
    Invalid = 'Invalid'
}

export interface LicenseToken {
    userId: string;
    features: string[];
    expiresAt: number; // Unix timestamp
    // ... other metadata
}

export class LicenseManager {

    /**
     * Verifies an offline token using Ed25519.
     * Format: base64(payload) . base64(signature)
     */
    static async verifyToken(tokenString: string): Promise<{ isValid: boolean, payload?: LicenseToken }> {
        if (!tokenString || !tokenString.includes('.')) return { isValid: false };

        try {
            const [payloadB64, signatureB64] = tokenString.split('.');
            const payloadStr = atob(payloadB64);
            const signature = Buffer.from(signatureB64, 'base64');
            const message = new TextEncoder().encode(payloadStr);

            // Verify signature
            const isValid = await ed.verify(signature, message, PUBLIC_KEY_HEX);
            if (!isValid) return { isValid: false };

            const payload = JSON.parse(payloadStr) as LicenseToken;
            return { isValid: true, payload };
        } catch (e) {
            console.error('License Verification Failed:', e);
            return { isValid: false };
        }
    }

    /**
     * Determines the current status based on the license token.
     */
    static async getStatus(tokenString: string | null): Promise<LicenseStatus> {
        if (!tokenString) return LicenseStatus.Unlicensed;

        const { isValid, payload } = await this.verifyToken(tokenString);
        if (!isValid || !payload) return LicenseStatus.Invalid;

        const now = Date.now();
        // Expiry check
        if (now < payload.expiresAt) {
            return LicenseStatus.Active;
        }

        // Grace Period (e.g., 3 days)
        const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;
        if (now < payload.expiresAt + GRACE_PERIOD_MS) {
            return LicenseStatus.GracePeriod;
        }

        return LicenseStatus.Expired;
    }
}
