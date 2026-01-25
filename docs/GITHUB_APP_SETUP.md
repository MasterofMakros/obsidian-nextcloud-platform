# GitHub App Setup Guide

## Overview

This GitHub App enables automatic AI-powered issue analysis and fix proposals.

## Features

- **Auto-Classification**: New issues are automatically classified (bug/feature/billing)
- **AI Fix Proposals**: Issues labeled `ai-fix-requested` trigger automated analysis
- **Secure Webhooks**: HMAC-SHA256 signature verification

## Setup Steps

### 1. Create GitHub App

1. Go to **Settings → Developer settings → GitHub Apps → New GitHub App**
2. Fill in:
   - **Name**: `Obsidian Nextcloud AI Bot`
   - **Homepage URL**: Your website
   - **Webhook URL**: `https://YOUR_DOMAIN/webhooks/github`
   - **Webhook Secret**: Generate a secure random string
3. **Permissions**:
   - Issues: Read & Write
   - Pull Requests: Read & Write
   - Contents: Read
   - Metadata: Read
4. **Events**:
   - Issues
   - Issue comment
   - Pull request

### 2. Generate Private Key

1. After creating the app, click **Generate a private key**
2. Save the `.pem` file securely

### 3. Install App

1. Click **Install App** in the left sidebar
2. Select your repository
3. Authorize permissions

### 4. Configure Environment

Add to your `.env`:

```env
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY_PATH=/path/to/private-key.pem
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo
```

### 5. Create Labels

Create these labels in your repository:

| Label | Color | Purpose |
|-------|-------|---------|
| `ai-fix-requested` | `#0E8A16` | Request AI analysis |
| `ai-fix-running` | `#444444` | AI is processing |
| `ai-fix-complete` | `#1D76DB` | AI analysis done |
| `from-customer` | `#FBCA04` | Customer-reported |

## Testing

```bash
# Trigger via curl (simulates GitHub webhook)
curl -X POST http://localhost:8080/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: issues" \
  -H "X-GitHub-Delivery: test-123" \
  -d '{
    "action": "opened",
    "issue": {
      "number": 1,
      "title": "Test Issue",
      "body": "This is a test",
      "labels": [],
      "html_url": "https://github.com/test/repo/issues/1"
    }
  }'
```

## Troubleshooting

- **401 Invalid Signature**: Check `GITHUB_WEBHOOK_SECRET` matches
- **No response**: Check Gateway logs with `docker logs onm-gateway`
- **n8n not triggered**: Verify `AI_GATEWAY_URL` in n8n env
