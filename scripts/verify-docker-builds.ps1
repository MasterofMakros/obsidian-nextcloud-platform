$ErrorActionPreference = "Stop"

Write-Host "🔍 Verifying Docker builds..." -ForegroundColor Cyan

# Define services to build
$services = @("api", "worker", "web")

foreach ($service in $services) {
    Write-Host "🐳 Building $service..." -ForegroundColor Yellow
    # Build specific service using docker compose to respect context and args
    docker compose -f infra/docker-compose.yml build $service
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed for $service" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ $service built successfully" -ForegroundColor Green
}

Write-Host "🎉 All Docker images built successfully!" -ForegroundColor Green
