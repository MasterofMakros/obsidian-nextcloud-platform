# Agent Browser Audit Setup

This directory contains a dedicated Docker setup to run `agent-browser` (Vercel Labs) for auditing the Obsidian Nextcloud Media Platform.

## Prerequisites

- Docker Desktop must be running.
- The main application stack must be running (`docker compose up -d` in project root).

## Installation & Build

1. Navigate to the audit directory:
   ```powershell
   cd infra/audit
   ```

2. Build the Agent image:
   ```powershell
   docker compose build
   ```

## Usage

### Interactive Mode (Recommended)

To start an interactive session with the Agent Browser:

```powershell
docker compose run --rm agent start
```
*Note: Check `agent-browser --help` for available commands. If `start` is not the correct command, try running without arguments to see the help menu.*

### Auditing the Website

Since the agent runs inside the Docker network, use the internal service name `web` and port `3010`.

**Command:**
```powershell
docker compose run --rm agent "http://web:3010"
```

### Updates

If you need to update the agent version, rebuild the image:
```powershell
docker compose build --no-cache
```
