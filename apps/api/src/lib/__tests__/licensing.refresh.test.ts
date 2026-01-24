import { describe, it, expect } from "vitest";

import { classifyRefreshResult } from "../licensing";

describe("licensing.refresh - classifyRefreshResult", () => {
    // 1. Happy Path
    it("returns success when token valid and license active", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "active",
            inGrace: false,
            revoked: false,
        });

        expect(out).toBe("success");
    });

    // 2. Precedence: Invalid Token (Highest Priority)
    it("returns invalid_token when token invalid, regardless of other states", () => {
        const out = classifyRefreshResult({
            tokenValid: false,
            tokenExpired: true,      // Even if expired
            licenseStatus: "revoked",// Even if revoked
            inGrace: true,           // Even if in grace
            revoked: true,
        });

        expect(out).toBe("invalid_token");
    });

    // 3. Precedence: Revoked (Second Priority)
    it("returns revoked when revoked flag is true", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "active",
            inGrace: false,
            revoked: true, // explicit revoked flag
        });
        expect(out).toBe("revoked");
    });

    it("returns revoked when licenseStatus is 'revoked'", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "revoked", // license status revoked
            inGrace: false,
            revoked: false,
        });
        expect(out).toBe("revoked");
    });

    it("returns revoked even if expired or in grace", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: true, // expired
            licenseStatus: "grace", // and grace
            inGrace: true,
            revoked: true, // but revoked takes precedence
        });
        expect(out).toBe("revoked");
    });

    // 4. Precedence: Expired (Third Priority)
    it("returns expired when tokenExpired is true", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: true,
            licenseStatus: "active",
            inGrace: false,
            revoked: false,
        });
        expect(out).toBe("expired");
    });

    it("returns expired when licenseStatus is 'expired'", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "expired",
            inGrace: false,
            revoked: false,
        });
        expect(out).toBe("expired");
    });

    it("returns expired even if in grace", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: true,
            licenseStatus: "grace",
            inGrace: true,
            revoked: false,
        });
        expect(out).toBe("expired");
    });

    // 5. Precedence: Grace (Fourth Priority)
    it("returns grace when inGrace is true", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "active",
            inGrace: true,
            revoked: false,
        });
        expect(out).toBe("grace");
    });

    it("returns grace when licenseStatus is 'grace'", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "grace",
            inGrace: false,
            revoked: false,
        });
        expect(out).toBe("grace");
    });

    // 6. Other statuses
    it("returns success for 'past_due' as it falls through to default success in current logic (assuming intent)", () => {
        // The current implementation returns "success" if none of the above match.
        // "past_due" isn't explicitly checked in the function.
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "past_due",
            inGrace: false,
            revoked: false,
        });
        expect(out).toBe("success");
    });
});

