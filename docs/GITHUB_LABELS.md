# GitHub Label Matrix

## Setup Instructions

Create these labels in your GitHub repository:
**Settings → Labels → New Label**

---

## Core Labels

| Name | Color | Description |
|------|-------|-------------|
| `from-customer` | `0E8A16` (green) | Customer originated ticket |
| `private-needed` | `B60205` (red) | Contains billing/account context (handle privately) |

---

## Type Labels

| Name | Color | Description |
|------|-------|-------------|
| `type:bug` | `D73A4A` (red) | Bug report |
| `type:question` | `1D76DB` (blue) | Usage question |
| `type:billing` | `5319E7` (purple) | Billing or license issue |
| `type:feature` | `A2EEEF` (cyan) | Feature request |

---

## Severity Labels

| Name | Color | Description |
|------|-------|-------------|
| `severity:critical` | `B60205` (dark red) | Critical issue (blocking, data loss, security) |
| `severity:major` | `D93F0B` (orange) | Major issue (feature broken, workaround exists) |
| `severity:minor` | `FBCA04` (yellow) | Minor issue (cosmetic, edge-case) |

---

## Area Labels

| Name | Color | Description |
|------|-------|-------------|
| `area:plugin` | `0052CC` (dark blue) | Obsidian plugin |
| `area:api` | `0E8A16` (green) | Backend API |
| `area:website` | `5319E7` (purple) | Marketing website |
| `area:licensing` | `D4C5F9` (lavender) | Licensing system |
| `area:unknown` | `C2E0C6` (pale green) | Undetermined area |

---

## AI Workflow Labels

| Name | Color | Description |
|------|-------|-------------|
| `ai-fix-requested` | `111111` (black) | Maintainer requests AI fix proposal |
| `ai-fix-running` | `444444` (dark gray) | n8n is processing |
| `ai-fix-ready` | `0E8A16` (green) | Proposal posted / PR draft ready |
| `ai-fix-blocked` | `B60205` (red) | Missing info / unsafe / needs human decision |

---

## Quick Setup Script

You can use GitHub CLI to create labels:

```bash
# Core
gh label create "from-customer" --color "0E8A16" --description "Customer originated ticket"
gh label create "private-needed" --color "B60205" --description "Handle privately (billing/account)"

# Type
gh label create "type:bug" --color "D73A4A" --description "Bug report"
gh label create "type:question" --color "1D76DB" --description "Usage question"
gh label create "type:billing" --color "5319E7" --description "Billing or license issue"
gh label create "type:feature" --color "A2EEEF" --description "Feature request"

# Severity
gh label create "severity:critical" --color "B60205" --description "Critical issue"
gh label create "severity:major" --color "D93F0B" --description "Major issue"
gh label create "severity:minor" --color "FBCA04" --description "Minor issue"

# Area
gh label create "area:plugin" --color "0052CC" --description "Obsidian plugin"
gh label create "area:api" --color "0E8A16" --description "Backend API"
gh label create "area:website" --color "5319E7" --description "Marketing website"
gh label create "area:licensing" --color "D4C5F9" --description "Licensing system"
gh label create "area:unknown" --color "C2E0C6" --description "Undetermined area"

# AI Workflow
gh label create "ai-fix-requested" --color "111111" --description "Request AI fix proposal"
gh label create "ai-fix-running" --color "444444" --description "AI processing"
gh label create "ai-fix-ready" --color "0E8A16" --description "AI proposal ready"
gh label create "ai-fix-blocked" --color "B60205" --description "AI blocked (human needed)"
```

---

*Created: January 2026*
