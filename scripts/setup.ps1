# AyurDiet AI - Setup Script (PowerShell)
# This script sets up the environment and starts the application

Write-Host "🚀 AyurDiet AI - Setup Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Visit: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit .env file and add your:" -ForegroundColor Yellow
    Write-Host "   - OPENAI_API_KEY" -ForegroundColor Yellow
    Write-Host "   - DB_PASSWORD" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET" -ForegroundColor Yellow
    Write-Host "   - ENCRYPTION_KEY" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after updating .env file"
}

Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host ""

# Build Docker images
Write-Host "📦 Building Docker images (this may take a few minutes)..." -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "✅ Docker images built successfully" -ForegroundColor Green
Write-Host ""

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check service health
Write-Host ""
Write-Host "🔍 Checking service health..." -ForegroundColor Cyan

# Check AI Service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ AI Service: Healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ AI Service: Unhealthy" -ForegroundColor Red
}

# Check Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/patients" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend: Healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend: Unhealthy (may need database migration)" -ForegroundColor Red
}

# Check Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend: Healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend: Unhealthy" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Running database migrations..." -ForegroundColor Cyan
docker-compose exec -T backend npm run db:push

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend:   http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "   AI Service: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs:        docker-compose logs -f" -ForegroundColor White
Write-Host "   Stop services:    docker-compose down" -ForegroundColor White
Write-Host "   Restart services: docker-compose restart" -ForegroundColor White
Write-Host "   Clean up:         docker-compose down -v" -ForegroundColor White
Write-Host ""
