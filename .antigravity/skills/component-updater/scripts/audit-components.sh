#!/bin/bash
# Component Audit Script
# Scans package.json and docker-compose.yml for dependencies

set -e

PROJECT_ROOT="${1:-.}"
OUTPUT_DIR="$PROJECT_ROOT/.antigravity"
AUDIT_FILE="$OUTPUT_DIR/component-audit.json"

echo "🔍 Starting Component Audit..."
echo "Project Root: $PROJECT_ROOT"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Initialize JSON
echo "{" > "$AUDIT_FILE"
echo '  "timestamp": "'$(date -Iseconds)'",' >> "$AUDIT_FILE"
echo '  "packages": {' >> "$AUDIT_FILE"

# Find all package.json files
FIRST=true
find "$PROJECT_ROOT" -name "package.json" -not -path "*/node_modules/*" | while read -r pkg; do
    APP_NAME=$(dirname "$pkg" | xargs basename)
    
    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        echo "," >> "$AUDIT_FILE"
    fi
    
    echo "  📦 Scanning: $APP_NAME"
    
    # Extract dependencies
    echo "    \"$APP_NAME\": {" >> "$AUDIT_FILE"
    echo '      "dependencies": '$(jq '.dependencies // {}' "$pkg")',' >> "$AUDIT_FILE"
    echo '      "devDependencies": '$(jq '.devDependencies // {}' "$pkg") >> "$AUDIT_FILE"
    echo -n "    }" >> "$AUDIT_FILE"
done

echo "" >> "$AUDIT_FILE"
echo "  }," >> "$AUDIT_FILE"

# Docker images
echo '  "docker": {' >> "$AUDIT_FILE"
if [ -f "$PROJECT_ROOT/infra/docker-compose.yml" ]; then
    echo "  🐳 Scanning Docker Compose..."
    IMAGES=$(grep -E "image:" "$PROJECT_ROOT/infra/docker-compose.yml" | sed 's/.*image: *//' | tr -d '"' | tr '\n' ',' | sed 's/,$//')
    echo "    \"images\": [\"${IMAGES//,/\", \"}\"]" >> "$AUDIT_FILE"
else
    echo '    "images": []' >> "$AUDIT_FILE"
fi
echo "  }" >> "$AUDIT_FILE"

echo "}" >> "$AUDIT_FILE"

echo ""
echo "✅ Audit complete!"
echo "📄 Output: $AUDIT_FILE"
echo ""
echo "Next steps:"
echo "1. Review audit results"
echo "2. Run: 'Erstelle COMPONENT_INVENTORY.md aus component-audit.json'"
