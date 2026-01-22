import { describe, it, expect } from "vitest";

// Example: adapt these imports to your actual file/module
import { classifyRefreshResult } from "../licensing";

describe("licensing.refresh - classifyRefreshResult", () => {
    it("returns success when token valid and license active", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "active",
            // @ts-ignore
            inGrace: false,
            revoked: false,
        });

        expect(out).toBe("success");
    });

    it("returns grace when license is in grace", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "grace",
            inGrace: true,
            revoked: false,
        });

        expect(out).toBe("grace");
    });

    it("returns revoked when revoked flag present (must override grace)", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: false,
            licenseStatus: "grace",
            inGrace: true,
            revoked: true,
        });

        expect(out).toBe("revoked");
    });

    it("returns expired when token expired", () => {
        const out = classifyRefreshResult({
            tokenValid: true,
            tokenExpired: true,
            licenseStatus: "active",
            inGrace: false,
            revoked: false,
        });

        expect(out).toBe("expired");
    });

    it("returns invalid_token when token invalid", () => {
        const out = classifyRefreshResult({
            tokenValid: false,
            tokenExpired: false,
            licenseStatus: "active",
            inGrace: false,
            revoked: false,
        });

        expect(out).toBe("invalid_token");
    });
});
