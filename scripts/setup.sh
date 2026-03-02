#!/bin/bash

# AyurDiet AI - Setup Script
# This script sets up the environment and starts the application

set -e

echo "🚀 AyurDiet AI - Setup Script"
echo "=============================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your:"
    echo "   - OPENAI_API_KEY"
    echo "   - DB_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - ENCRYPTION_KEY"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

echo "✅ Environment file found"
echo ""

# Build Docker images
echo "📦 Building Docker images (this may take a few minutes)..."
docker-compose build

echo ""
echo "✅ Docker images built successfully"
echo ""

# Start services
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Check service health
echo ""
echo "🔍 Checking service health..."

# Check AI Service
if curl -f http://localhost:5001/health &> /dev/null; then
    echo "✅ AI Service: Healthy"
else
    echo "❌ AI Service: Unhealthy"
fi

# Check Backend
if curl -f http://localhost:5000/api/patients &> /dev/null; then
    echo "✅ Backend: Healthy"
else
    echo "❌ Backend: Unhealthy (may need database migration)"
fi

# Check Frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy"
fi

echo ""
echo "📊 Running database migrations..."
docker-compose exec -T backend npm run db:push || echo "⚠️  Database migration failed (may already be up to date)"

echo ""
echo "=============================="
echo "✅ Setup Complete!"
echo "=============================="
echo ""
echo "🌐 Access the application:"
echo "   Frontend:   http://localhost:3000"
echo "   Backend:    http://localhost:5000"
echo "   AI Service: http://localhost:5001"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Clean up:         docker-compose down -v"
echo ""
echo "📚 For more commands, run: make help"
echo ""
