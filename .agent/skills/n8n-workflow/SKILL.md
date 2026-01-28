---
name: n8n-workflow
description: n8n workflows for automation. Use when user mentions 'n8n', 'workflow', 'automation'.
---

# n8n Workflow

## Quick Start

| Step | Action |
|------|--------|
| 1 | `docker compose -f infra/docker-compose.yml up -d n8n` |
| 2 | Open http://localhost:5678 |
| 3 | Create workflow |

## Gateway Integration

| Setting | Value |
|---------|-------|
| URL | `http://gateway:8080/v1/agent/run` |
| Method | POST |
| Auth | `Bearer ${GATEWAY_BEARER_TOKEN}` |
| Body | `{"task": "issue_intake", "input": {...}}` |

## Database Access

| Setting | Value |
|---------|-------|
| Host | `postgres` |
| Port | 5432 |
| DB | `obsidian_media` |

## Export/Import

| Action | How |
|--------|-----|
| Export | Select nodes → Ctrl+C → paste to JSON |
| Import | Import from File → select JSON |

## Environment

```env
AI_GATEWAY_URL=http://gateway:8080/v1/agent/run
AI_GATEWAY_KEY=local-test-token
```
