# Frontend Testing Strategy

**Goal:** Ensure functional correctness, design consistency, and bug-free user flows from a customer perspective.

While `agent-browser` is a great experimental tool, for a **Commercial Grade** platform on Windows, we rely on the industry-standard **Playwright UI Mode**. It provides the same "watch and interact" experience but with reproducability and deep debugging tools.

---

## 1. Quick Start (Visual Testing)

We use Playwright's **UI Mode** to interactively run tests, see the browser, and inspect the DOM.

1. **Start the Web App** (if not already running):
   ```bash
   pnpm --filter web dev
   ```
   *Verify it's up at [http://localhost:3010](http://localhost:3010).*

2. **Launch Playwright UI:**
   ```bash
   pnpm exec playwright test --ui
   ```
   *This opens a dedicated window showing all tests and a real browser preview.*

---

## 2. Creating New Tests (Codegen)

Instead of writing code manually, you can record your interactions:

```bash
pnpm exec playwright codegen http://localhost:3010
```

1. A browser opens.
2. Click through your app (e.g. "Pricing" -> "Buy Now").
3. Playwright generates the code for you.
4. Copy the code into `apps/web/e2e/user-flow.spec.ts`.

---

## 3. Test Scenarios (Customer Perspective)

### 3.1 Landing Page Smoke Test
* **Goal:** Verify main call-to-actions (CTA) are visible.
* **Flow:**
    * Open Home
    * Check "Get Started" button
    * Check "Features" section

### 3.2 Pricing & Licensing
* **Goal:** Ensure pricing cards are correct.
* **Flow:**
    * Open `/pricing`
    * Verify "Free", "Pro", "Lifetime" cards exist.
    * Click "Buy Pro" -> Should redirect to Checkout (or mock).

---

## 4. Troubleshooting Visual Bugs

If you find a design bug:
1. Use the **Locator Picker** in Playwright UI.
2. Hover over the element.
3. Check computed styles and accessibility roles.

---

## 5. Why not `agent-browser`?
The `agent-browser` tool is currently optimized for Linux/macOS shell environments. On Windows, it encounters path resolution issues (`/bin/sh`). Playwright UI Mode offers a superior, native experience for visual validation on Windows.
