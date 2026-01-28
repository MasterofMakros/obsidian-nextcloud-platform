# Open TODOs & Known Issues

> **Tracking document for outstanding tasks and known issues.**

**Last Updated:** 2026-01-29  
**Source:** SKILL-EXECUTION-REPORT.md (2026-01-28)

---

## 🔴 Critical TODOs (Security-Related)

### TODO-001: Secure Secret Storage for License Keys

**File:** `apps/plugin/src/license.ts` (Zeile 9)  
**Priority:** 🔴 Critical  
**Status:** Open

**Description:**
License keys should be loaded from secure secret storage instead of being hardcoded or stored insecurely.

**Action Required:**
- Implement secure key storage (e.g., OS keychain, encrypted storage)
- Never store private keys in plaintext
- Consider using environment variables with encryption

---

### TODO-002: Admin API Key Authentication

**File:** `apps/api/src/routes/license.ts` (Zeile 197)  
**Priority:** 🔴 Critical  
**Status:** Open

**Description:**
Admin API endpoints need proper API key authentication via AdminApiKey header.

**Action Required:**
- Implement middleware to check AdminApiKey header
- Validate key against secure storage
- Add rate limiting for admin endpoints

---

### TODO-003: Admin API Key Authentication (Duplicate)

**File:** `apps/api/src/routes/license.ts` (Zeile 210)  
**Priority:** 🔴 Critical  
**Status:** Open

**Description:**
Same as TODO-002, second occurrence.

**Action Required:**
- See TODO-002

---

## 🟡 Medium Priority TODOs

### TODO-004: License Activation API Integration

**File:** `apps/plugin/src/main.ts` (Zeile 122)  
**Priority:** 🟡 Medium  
**Status:** Open

**Description:**
Plugin needs to fetch from `/api/v1/license/activate` endpoint.

**Action Required:**
- Implement HTTP client in plugin
- Handle network errors gracefully
- Cache responses appropriately

---

### TODO-005: Real Public Key Deployment

**File:** `apps/plugin/src/license.ts` (Zeile 3)  
**Priority:** 🟡 Medium  
**Status:** Open

**Description:**
Replace placeholder/test public key with real production key.

**Action Required:**
- Generate production Ed25519 keypair
- Deploy public key with plugin
- Store private key securely in environment
- Document key rotation process

---

## 🟠 Known Issues

### Issue-001: E2E Test Failure - Legal Pages

**Test:** CJ7  
**Error:** `ERR_ABORTED - Netzwerk`  
**Status:** ⚠️ Flaky

**Description:**
Legal pages (Impressum, Privacy, Terms) occasionally fail to load in E2E tests due to network errors.

**Possible Causes:**
- Race condition in page loading
- Missing wait for static assets
- Network timeout too short

**Workaround:**
Retry test usually passes.

**Fix Required:**
- Add explicit waits for page load
- Increase timeout for legal pages
- Check static file serving

---

### Issue-002: E2E Test Failure - Navigation to Docs

**Test:** T1.2  
**Error:** `Timeout - Routing`  
**Status:** ⚠️ Flaky

**Description:**
Navigation to documentation pages times out.

**Possible Causes:**
- Docs route not properly configured
- Missing docs pages in build
- Routing configuration issue

**Workaround:**
None known.

**Fix Required:**
- Verify docs route exists
- Check Next.js routing configuration
- Ensure docs pages are included in build

---

## 🐳 Infrastructure Issues

### Issue-003: Gateway Docker Build

**Status:** 🔴 Blocked  
**Source:** SKILL-EXECUTION-REPORT.md

**Description:**
Gateway Docker build fails due to missing node_modules.

**Error:**
```
node_modules not found in gateway container
```

**Action Required:**
- Fix Dockerfile COPY commands
- Ensure node_modules are included in build context
- Verify multi-stage build configuration

**Temporary Workaround:**
Run gateway locally instead of in container (Port 8081).

---

## 📊 Test Summary

### Current Status (2026-01-28)

| Test Type | Passed | Failed | Flaky | Total |
|-----------|--------|--------|-------|-------|
| Unit/Integration | 76 | 0 | 0 | 76 ✅ |
| E2E | 26 | 0 | 2 | 28 ⚠️ |
| **Total** | **102** | **0** | **2** | **104** |

### Coverage Status

| Package | Status |
|---------|--------|
| API | 48 tests ✅ |
| Worker | 3 tests ✅ |
| DB | 4 tests ✅ |
| Gateway | 21 tests ✅ |

---

## 🎯 Next Actions

### Immediate (This Week)

1. [ ] **TODO-001:** Implement secure secret storage
2. [ ] **TODO-002 & 003:** Add Admin API key authentication
3. [ ] **Issue-003:** Fix Gateway Docker build

### Short-term (This Month)

4. [ ] **TODO-004:** Complete license activation API integration
5. [ ] **TODO-005:** Deploy real production keys
6. [ ] **Issue-001 & 002:** Fix flaky E2E tests

### Long-term (Next Quarter)

7. [ ] Increase E2E test coverage
8. [ ] Implement load testing (k6)
9. [ ] Set up monitoring & alerting

---

## 📝 Notes

- All TODOs extracted from SKILL-EXECUTION-REPORT.md (2026-01-28)
- Security TODOs should be prioritized before production deployment
- E2E test failures are not blocking but reduce confidence
- Gateway Docker issue has workaround (local execution)

---

**Maintainer:** Development Team  
**Review Schedule:** Weekly
