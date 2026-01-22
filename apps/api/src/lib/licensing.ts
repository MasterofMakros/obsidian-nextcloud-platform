export type RefreshClassifyInput = {
    tokenValid: boolean;
    tokenExpired: boolean;
    licenseStatus: "active" | "past_due" | "grace" | "revoked" | "expired";
    inGrace: boolean;
    revoked: boolean;
};

export function classifyRefreshResult(i: RefreshClassifyInput) {
    if (!i.tokenValid) return "invalid_token";
    if (i.revoked || i.licenseStatus === "revoked") return "revoked";
    if (i.tokenExpired || i.licenseStatus === "expired") return "expired";
    if (i.inGrace || i.licenseStatus === "grace") return "grace";
    return "success";
}
