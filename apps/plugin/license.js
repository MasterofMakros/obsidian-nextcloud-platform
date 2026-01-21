"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseManager = exports.LicenseStatus = void 0;
const tslib_1 = require("tslib");
const ed = require("@noble/ed25519");
// TODO: Replace with Real public key from backend (generated once)
const PUBLIC_KEY_HEX = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
var LicenseStatus;
(function (LicenseStatus) {
    LicenseStatus["Unlicensed"] = "No License";
    LicenseStatus["Active"] = "Active";
    LicenseStatus["Expired"] = "Expired";
    LicenseStatus["GracePeriod"] = "Grace Period";
    LicenseStatus["Invalid"] = "Invalid";
})(LicenseStatus || (exports.LicenseStatus = LicenseStatus = {}));
class LicenseManager {
    /**
     * Verifies an offline token using Ed25519.
     * Format: base64(payload) . base64(signature)
     */
    static verifyToken(tokenString) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!tokenString || !tokenString.includes('.'))
                return { isValid: false };
            try {
                const [payloadB64, signatureB64] = tokenString.split('.');
                const payloadStr = atob(payloadB64);
                const signature = Buffer.from(signatureB64, 'base64');
                const message = new TextEncoder().encode(payloadStr);
                // Verify signature
                const isValid = yield ed.verify(signature, message, PUBLIC_KEY_HEX);
                if (!isValid)
                    return { isValid: false };
                const payload = JSON.parse(payloadStr);
                return { isValid: true, payload };
            }
            catch (e) {
                console.error('License Verification Failed:', e);
                return { isValid: false };
            }
        });
    }
    /**
     * Determines the current status based on the license token.
     */
    static getStatus(tokenString) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!tokenString)
                return LicenseStatus.Unlicensed;
            const { isValid, payload } = yield this.verifyToken(tokenString);
            if (!isValid || !payload)
                return LicenseStatus.Invalid;
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
        });
    }
}
exports.LicenseManager = LicenseManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGljZW5zZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpY2Vuc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLHFDQUFxQztBQUVyQyxtRUFBbUU7QUFDbkUsTUFBTSxjQUFjLEdBQUcsa0VBQWtFLENBQUM7QUFFMUYsSUFBWSxhQU1YO0FBTkQsV0FBWSxhQUFhO0lBQ3JCLDBDQUF5QixDQUFBO0lBQ3pCLGtDQUFpQixDQUFBO0lBQ2pCLG9DQUFtQixDQUFBO0lBQ25CLDZDQUE0QixDQUFBO0lBQzVCLG9DQUFtQixDQUFBO0FBQ3ZCLENBQUMsRUFOVyxhQUFhLDZCQUFiLGFBQWEsUUFNeEI7QUFTRCxNQUFhLGNBQWM7SUFFdkI7OztPQUdHO0lBQ0gsTUFBTSxDQUFPLFdBQVcsQ0FBQyxXQUFtQjs7WUFDeEMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFFMUUsSUFBSSxDQUFDO2dCQUNELE1BQU0sQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXJELG1CQUFtQjtnQkFDbkIsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ3BFLElBQUksQ0FBQyxPQUFPO29CQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7Z0JBRXhDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFpQixDQUFDO2dCQUN2RCxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUN0QyxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDVCxPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQzlCLENBQUM7UUFDTCxDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNILE1BQU0sQ0FBTyxTQUFTLENBQUMsV0FBMEI7O1lBQzdDLElBQUksQ0FBQyxXQUFXO2dCQUFFLE9BQU8sYUFBYSxDQUFDLFVBQVUsQ0FBQztZQUVsRCxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFPLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFFdkQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLGVBQWU7WUFDZixJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzFCLE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxDQUFDO1lBRUQsOEJBQThCO1lBQzlCLE1BQU0sZUFBZSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDaEQsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsR0FBRyxlQUFlLEVBQUUsQ0FBQztnQkFDNUMsT0FBTyxhQUFhLENBQUMsV0FBVyxDQUFDO1lBQ3JDLENBQUM7WUFFRCxPQUFPLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDakMsQ0FBQztLQUFBO0NBQ0o7QUFsREQsd0NBa0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZWQgZnJvbSAnQG5vYmxlL2VkMjU1MTknO1xyXG5cclxuLy8gVE9ETzogUmVwbGFjZSB3aXRoIFJlYWwgcHVibGljIGtleSBmcm9tIGJhY2tlbmQgKGdlbmVyYXRlZCBvbmNlKVxyXG5jb25zdCBQVUJMSUNfS0VZX0hFWCA9ICcxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmJztcclxuXHJcbmV4cG9ydCBlbnVtIExpY2Vuc2VTdGF0dXMge1xyXG4gICAgVW5saWNlbnNlZCA9ICdObyBMaWNlbnNlJyxcclxuICAgIEFjdGl2ZSA9ICdBY3RpdmUnLFxyXG4gICAgRXhwaXJlZCA9ICdFeHBpcmVkJyxcclxuICAgIEdyYWNlUGVyaW9kID0gJ0dyYWNlIFBlcmlvZCcsXHJcbiAgICBJbnZhbGlkID0gJ0ludmFsaWQnXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGljZW5zZVRva2VuIHtcclxuICAgIHVzZXJJZDogc3RyaW5nO1xyXG4gICAgZmVhdHVyZXM6IHN0cmluZ1tdO1xyXG4gICAgZXhwaXJlc0F0OiBudW1iZXI7IC8vIFVuaXggdGltZXN0YW1wXHJcbiAgICAvLyAuLi4gb3RoZXIgbWV0YWRhdGFcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExpY2Vuc2VNYW5hZ2VyIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFZlcmlmaWVzIGFuIG9mZmxpbmUgdG9rZW4gdXNpbmcgRWQyNTUxOS5cclxuICAgICAqIEZvcm1hdDogYmFzZTY0KHBheWxvYWQpIC4gYmFzZTY0KHNpZ25hdHVyZSlcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIHZlcmlmeVRva2VuKHRva2VuU3RyaW5nOiBzdHJpbmcpOiBQcm9taXNlPHsgaXNWYWxpZDogYm9vbGVhbiwgcGF5bG9hZD86IExpY2Vuc2VUb2tlbiB9PiB7XHJcbiAgICAgICAgaWYgKCF0b2tlblN0cmluZyB8fCAhdG9rZW5TdHJpbmcuaW5jbHVkZXMoJy4nKSkgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgW3BheWxvYWRCNjQsIHNpZ25hdHVyZUI2NF0gPSB0b2tlblN0cmluZy5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkU3RyID0gYXRvYihwYXlsb2FkQjY0KTtcclxuICAgICAgICAgICAgY29uc3Qgc2lnbmF0dXJlID0gQnVmZmVyLmZyb20oc2lnbmF0dXJlQjY0LCAnYmFzZTY0Jyk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUocGF5bG9hZFN0cik7XHJcblxyXG4gICAgICAgICAgICAvLyBWZXJpZnkgc2lnbmF0dXJlXHJcbiAgICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSBhd2FpdCBlZC52ZXJpZnkoc2lnbmF0dXJlLCBtZXNzYWdlLCBQVUJMSUNfS0VZX0hFWCk7XHJcbiAgICAgICAgICAgIGlmICghaXNWYWxpZCkgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnBhcnNlKHBheWxvYWRTdHIpIGFzIExpY2Vuc2VUb2tlbjtcclxuICAgICAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSwgcGF5bG9hZCB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTGljZW5zZSBWZXJpZmljYXRpb24gRmFpbGVkOicsIGUpO1xyXG4gICAgICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVybWluZXMgdGhlIGN1cnJlbnQgc3RhdHVzIGJhc2VkIG9uIHRoZSBsaWNlbnNlIHRva2VuLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0U3RhdHVzKHRva2VuU3RyaW5nOiBzdHJpbmcgfCBudWxsKTogUHJvbWlzZTxMaWNlbnNlU3RhdHVzPiB7XHJcbiAgICAgICAgaWYgKCF0b2tlblN0cmluZykgcmV0dXJuIExpY2Vuc2VTdGF0dXMuVW5saWNlbnNlZDtcclxuXHJcbiAgICAgICAgY29uc3QgeyBpc1ZhbGlkLCBwYXlsb2FkIH0gPSBhd2FpdCB0aGlzLnZlcmlmeVRva2VuKHRva2VuU3RyaW5nKTtcclxuICAgICAgICBpZiAoIWlzVmFsaWQgfHwgIXBheWxvYWQpIHJldHVybiBMaWNlbnNlU3RhdHVzLkludmFsaWQ7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgICAgLy8gRXhwaXJ5IGNoZWNrXHJcbiAgICAgICAgaWYgKG5vdyA8IHBheWxvYWQuZXhwaXJlc0F0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMaWNlbnNlU3RhdHVzLkFjdGl2ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdyYWNlIFBlcmlvZCAoZS5nLiwgMyBkYXlzKVxyXG4gICAgICAgIGNvbnN0IEdSQUNFX1BFUklPRF9NUyA9IDMgKiAyNCAqIDYwICogNjAgKiAxMDAwO1xyXG4gICAgICAgIGlmIChub3cgPCBwYXlsb2FkLmV4cGlyZXNBdCArIEdSQUNFX1BFUklPRF9NUykge1xyXG4gICAgICAgICAgICByZXR1cm4gTGljZW5zZVN0YXR1cy5HcmFjZVBlcmlvZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBMaWNlbnNlU3RhdHVzLkV4cGlyZWQ7XHJcbiAgICB9XHJcbn1cclxuIl19