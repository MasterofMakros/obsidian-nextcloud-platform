# n8n Workflow

## Quick Start

```bash
# n8n starten
docker compose -f infra/docker-compose.yml up -d n8n

# UI öffnen
open http://localhost:5678
```

## Gateway Integration

- URL: `http://gateway:8080/v1/agent/run`
- Auth: Bearer Token

## Weiterführende Dokumentation

Siehe [SKILL.md](SKILL.md) für vollständige Details.
