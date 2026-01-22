# Agent Output Schemas (Strict)

## Overview

All agent tasks return strictly validated JSON. The gateway enforces these schemas using Zod validation and fails closed on any schema mismatch.

---

## 1. `issue_intake` Output

Classifies support emails into structured issue metadata.

```json
{
  "type": "bug" | "question" | "billing" | "feature",
  "severity": "critical" | "major" | "minor",
  "area": "plugin" | "api" | "website" | "licensing" | "unknown",
  "summary": "string (3-160 chars)",
  "repro_steps": "string (0-8000 chars)",
  "confidence": 0.0-1.0,
  "suggested_labels": ["string (max 40 chars each, max 5 items)"]
}
```

### Field Constraints

| Field | Type | Constraints |
|-------|------|-------------|
| `type` | enum | `bug`, `question`, `billing`, `feature` |
| `severity` | enum | `critical`, `major`, `minor` |
| `area` | enum | `plugin`, `api`, `website`, `licensing`, `unknown` |
| `summary` | string | 3-160 characters |
| `repro_steps` | string | 0-8000 characters |
| `confidence` | number | 0.0 to 1.0 |
| `suggested_labels` | array | Max 5 items, each max 40 chars, no spaces |

---

## 2. `analysis` Output

Provides root-cause analysis without code changes.

```json
{
  "analysis_md": "string (0-20000 chars, markdown)",
  "risk": "low" | "medium" | "high",
  "confidence": 0.0-1.0
}
```

### Field Constraints

| Field | Type | Constraints |
|-------|------|-------------|
| `analysis_md` | string | 0-20000 characters, valid markdown |
| `risk` | enum | `low`, `medium`, `high` |
| `confidence` | number | 0.0 to 1.0 |

---

## 3. `fix_proposal` Output

Proposes a fix with optional unified diff patch.

```json
{
  "analysis_md": "string (0-20000 chars, markdown)",
  "risk": "low" | "medium" | "high",
  "confidence": 0.0-1.0,
  "patch_unified_diff": "string (max 200000 chars) | null",
  "pr_title": "string (3-120 chars)",
  "pr_body": "string (0-20000 chars)"
}
```

### Field Constraints

| Field | Type | Constraints |
|-------|------|-------------|
| `analysis_md` | string | 0-20000 characters |
| `risk` | enum | `low`, `medium`, `high` |
| `confidence` | number | 0.0 to 1.0 |
| `patch_unified_diff` | string/null | Max 200000 chars, or null if no patch |
| `pr_title` | string | 3-120 characters |
| `pr_body` | string | 0-20000 characters |

### Patch Rules

- If `patch_unified_diff` is `null`, the output is analysis-only
- Patch must be valid unified diff format
- File paths must be relative to repo root
- No placeholders like `TODO` or `...`
- Never include tokens/secrets

---

## Validation Behavior

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Valid output | 200 | `{ task, output, meta }` |
| Missing required field | 422 | `{ error: "schema_validation_failed" }` |
| Invalid enum value | 422 | `{ error: "schema_validation_failed" }` |
| String too long | 422 | `{ error: "schema_validation_failed" }` |
| LLM error | 500 | `{ error: "internal_error" }` |

---

*Created: January 2026*
