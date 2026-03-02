# AyurDiet AI - Ayurvedic Diet Management System

🌿 AI-powered Ayurvedic diet planning platform for healthcare professionals

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🚀 Quick Start with Docker (Recommended)

### ⚡ Fast Mode (30 seconds - Recommended for Development)

**Windows:**

```cmd
start-fast.bat
```

**Linux/Mac:**

```bash
chmod +x start-fast.sh && ./start-fast.sh
```

**Using Make:**

```bash
make fast
```

### 🔒 Production Mode (60 seconds - Full Health Checks)

**Windows:**

```cmd
start.bat
```

**Linux/Mac:**

```bash
chmod +x start.sh && ./start.sh
```

**Using Make:**

```bash
make prod
```

That's it! The application will be available at:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **AI Service:** http://localhost:5001

> **💡 Tip:** First build takes 3-5 minutes. Subsequent starts are much faster!  
> **⚡ Speed:** Use `start-fast.bat` or `make fast` for instant startups after first build!

---

## 📋 Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

---

## 🎯 Features

- ✅ **Patient Management** - Complete CRUD operations
- ✅ **Prakriti Assessment** - AI-powered constitution analysis
- ✅ **Diet Chart Generation** - Personalized Ayurvedic meal plans
- ✅ **Food Database** - 25+ Ayurvedic foods with properties
- ✅ **Chat Assistant** - AI-powered Ayurvedic health advisor
- ✅ **Dashboard** - Analytics and insights
- ✅ **Dark/Light Theme** - Modern, responsive UI

---

## 🏗️ Architecture

```
Frontend (React + Vite) → Backend (Express + TypeScript) → AI Service (FastAPI + LangChain)
                                    ↓
                          PostgreSQL + Redis
```

---

## 📚 Documentation

- [Docker Setup Guide](DOCKER_SETUP.md) - Complete Docker documentation
- [Setup Guide](SETUP.md) - Manual setup without Docker
- [Blueprint](BLUEPRINT.md) - System architecture and issues
- [Requirements](requirements.md) - Project requirements
- [Design](design.md) - System design document

---

## 🛠️ Development

### Start Development Mode

```bash
# With hot reload
make dev

# Or using docker-compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Useful Commands

```bash
make help       # Show all commands
make build      # Build Docker images
make up         # Start services
make down       # Stop services
make logs       # View logs
make clean      # Clean everything
make health     # Check service health
```

---

## 🔧 Manual Setup (Without Docker)

See [SETUP.md](SETUP.md) for detailed manual setup instructions.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

---

## 📄 License

This project is part of the AI for Bharat Healthcare initiative.

---

## 👥 Team Agix

Built for AI for Bharat 2026 Hackathon
