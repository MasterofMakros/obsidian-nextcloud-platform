# Brand & Product Identity: obsidian-nextcloud-media

## 1. Brand Fundamentals

### Mission
To bridge the gap between personal knowledge management (Obsidian) and private cloud sovereignty (Nextcloud) seamlessly, enabling a privacy-first, offline-capable media workflow for power users.

### Core Values
*   **Privacy-First:** Your data is yours. No telemetry, no third-party tracking. Direct P2P/WebDAV connection.
*   **Calm & Technical:** No gamification, no loud marketing. Functionality speaks for itself. The tool is invisible; the content is king.
*   **Offline-First:** Designed for local-first workflows that sync when ready. Robustness over speed.

### Tone of Voice
*   **Direct & Precise:** Avoid fluff. Use correct terminology (e.g., "WebDAV Endpoint" instead of "Cloud Link").
*   **Professional:** Respect the user's intelligence.
*   **Helpful:** Error messages explain *why* something failed and *how* to fix it.

---

## 2. Visual Identity

### Color Palette (Dark Mode First)
Designed to blend perfectly with Obsidian's default dark theme (`#1e1e1e`) while checking accessibility.

*   **Backgrounds:** Deep grays (`#1e1e1e` primary, `#252525` secondary) to reduce eye strain.
*   **Primary Accent:** `Obsidian Purple` (`#7a63a8`) - used sparingly for active states, toggles, and primary actions.
*   **Secondary Accent:** `Nextcloud Blue` (`#0082c9`) - used specifically for network/sync status indicators to visually denote the "connection".
*   **Text:** High contrast off-white (`#dcddde`) for readability. Muted gray (`#999999`) for metadata.

### Typography
*   **UI Font:** `Inter` (or system sans-serif). Clean, legible, neutral.
*   **Mono Font:** `JetBrains Mono`. Used for: API keys, file paths, logs, and error codes.
*   **Hierarchy:**
    *   **H1:** 24px, Medium (Settings Page Titles)
    *   **H2:** 16px, Bold (Section Headers)
    *   **Body:** 14px, Regular (Standard UI text)
    *   **Label:** 12px, Regular (Input labels, hints)

---

## 3. UI Design Language

### Principles
1.  **Native Feel:** The plugin settings and modal windows should look like they shipped with Obsidian. Do not reinvent standard controls.
2.  **Data Density:** Make efficient use of space. Use compact lists for file browsers.
3.  **Visual Feedback:** Every sync action needs a subtle status indicator (spinner, checkmark, fade).

### Component Rules
*   **Buttons:**
    *   *Primary:* Solid Obsidian Purple background, white text. No shadow.
    *   *Secondary:* Transparent background, Subtle Border (`#333`).
*   **Inputs:**
    *   Dark background (`#161616`), subtle border. Focus state highlights visually with Primary Accent.
*   **Modals:**
    *   Dark overlay (`rgba(0,0,0,0.7)`).
    *   Sharp or slightly rounded corners (`4px` or `8px`).

---

## 4. Usage of Tokens
Refer to `tokens.json` for exact values. Use these keys in CSS variables (e.g., `--color-bg-primary`).

```css
:root {
  --onm-bg-primary: var(--background-primary); /* #1e1e1e */
  --onm-text-normal: var(--text-normal);       /* #dcddde */
  --onm-accent: var(--brand-primary);          /* #7a63a8 */
}
```
