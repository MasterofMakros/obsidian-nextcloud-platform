# Slack Integration Setup Guide

## Overview

This integration enables AI-powered analysis of messages in your Slack support channels.

## Features

- **#support channel**: Messages are analyzed and classified automatically
- **Thread replies**: AI responds in thread with analysis (type, severity, area)
- **Non-intrusive**: Only responds to human messages, ignores bots

## Prerequisites

- Slack workspace with admin access
- n8n running with Slack credentials configured
- Gateway running with OpenAI API key

## Setup Steps

### 1. Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name: `ONM Support Bot`
4. Select your workspace

### 2. Configure Bot Permissions

Go to **OAuth & Permissions** and add these scopes:

| Scope | Purpose |
|-------|---------|
| `channels:history` | Read messages in public channels |
| `channels:read` | List channels |
| `chat:write` | Post messages |
| `users:read` | Get user info |

### 3. Enable Event Subscriptions

1. Go to **Event Subscriptions**
2. Enable Events: **On**
3. Request URL: `https://YOUR_N8N_URL/webhook/slack`
4. Subscribe to bot events:
   - `message.channels`

### 4. Install App

1. Go to **Install App**
2. Click **Install to Workspace**
3. Authorize the permissions
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### 5. Configure n8n

1. Open n8n: `http://localhost:5678`
2. Go to **Credentials** → **New**
3. Select **Slack API**
4. Paste your Bot User OAuth Token
5. Import `docs/n8n/slack-support-workflow.json`
6. Update credential references in the workflow
7. Activate the workflow

### 6. Test

1. Post a message in #support:
   ```
   Help! The plugin crashes when I try to sync files
   ```
2. Wait ~5 seconds
3. AI should reply in thread with analysis

## Environment Variables

Add to your `.env` or n8n environment:

```env
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
AI_GATEWAY_URL=http://gateway:8080/v1/agent/run
AI_GATEWAY_KEY=your-gateway-token
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No response | Check n8n workflow is active |
| 401 error | Verify Slack credentials |
| Bot loops | Check bot message filtering |

## Security Notes

- Slack Signing Secret is used to verify webhook requests
- Bot token should be kept secret
- Use environment variables, not hardcoded values
