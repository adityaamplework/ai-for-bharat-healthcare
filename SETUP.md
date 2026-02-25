# AyurDiet AI — Setup Guide

A full-stack Ayurvedic diet planning platform with a **React frontend**, **Express backend**, and **Python AI service** (LangChain + LangGraph).

---

## Prerequisites

| Tool           | Version | Purpose                |
| -------------- | ------- | ---------------------- |
| **Node.js**    | ≥ 18    | Frontend + Backend     |
| **Python**     | ≥ 3.10  | AI Service (LangGraph) |
| **PostgreSQL** | ≥ 14    | Database               |
| **npm**        | ≥ 9     | Package management     |

---

## 1. Clone & Install Dependencies

```bash
# Clone the project
git clone <your-repo-url>
cd AyurDiet-AI

# Install root dependencies (concurrently)
npm install

# Install frontend + backend dependencies
npm run install:all

# Install Python AI service dependencies
pip install -r ai_services/requirements.txt
```

---

## 2. Environment Setup

Create a `.env` file in the **project root** with the following variables:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ayurdiet

# Backend server port
PORT=5000

# Python AI Service URL
AI_SERVICE_URL=http://localhost:5001

# OpenAI API key (required for AI features)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

> **Note:** The backend, frontend proxy, and Python AI service all read from this single `.env` file.

---

## 3. Database Setup

### Create the database

```bash
# Connect to PostgreSQL and create the database
psql -U postgres
CREATE DATABASE ayurdiet;
\q
```

### Push the schema

```bash
npm run db:push
```

This uses **Drizzle ORM** to push the schema defined in `backend/schema.ts` to your PostgreSQL database.

---

## 4. Run the Application

### Start all services at once (recommended)

```bash
npm run dev
```

This starts **3 services concurrently**:

| Service                            | Port                    | Color  |
| ---------------------------------- | ----------------------- | ------ |
| **Frontend** (Vite + React)        | `http://localhost:3000` | Cyan   |
| **Backend** (Express + TypeScript) | `http://localhost:5000` | Green  |
| **AI Service** (FastAPI + Python)  | `http://localhost:5001` | Yellow |

### Or start services individually

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# AI service only
npm run dev:ai
```

---

## 5. Verify Everything is Working

1. **Frontend** → Open `http://localhost:3000` in your browser
2. **Backend health** → `http://localhost:5000/api/patients` should return `[]`
3. **AI service health** → `http://localhost:5001/health` should return:
   ```json
   { "status": "ok", "service": "ayurdiet-ai", "engine": "langgraph" }
   ```

---

## Project Structure

```
AyurDiet-AI/
├── .env                    # Environment variables (all services)
├── package.json            # Root scripts (dev, install:all, db:push)
│
├── frontend/               # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/          # assessment, dashboard, patients, chat
│   │   ├── components/     # UI components (shadcn/ui)
│   │   └── lib/            # API client, utilities
│   └── vite.config.ts      # Dev server on :3000, proxies /api → :5000
│
├── backend/                # Express + TypeScript + Drizzle ORM
│   ├── schema.ts           # Database schema (patients, foods, diet_charts, etc.)
│   ├── src/
│   │   ├── routes.ts       # API endpoints
│   │   ├── storage.ts      # Database operations
│   │   ├── ai-service.ts   # Proxy to Python AI service
│   │   └── index.ts        # Express server entry point
│   └── drizzle.config.ts   # Drizzle Kit configuration
│
└── ai_services/            # Python FastAPI + LangChain + LangGraph
    ├── main.py             # FastAPI endpoints (/analyze-prakriti, /generate-diet-chart, /chat)
    ├── requirements.txt    # Python dependencies
    ├── graph/
    │   ├── prakriti.py     # Prakriti assessment LangGraph workflow
    │   ├── diet_chart.py   # Diet chart generation workflow
    │   └── chat.py         # Chat assistant workflow
    └── models/
        └── schemas.py      # Pydantic request/response models
```

---

## Available Scripts

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `npm run dev`            | Start all 3 services concurrently        |
| `npm run dev:frontend`   | Start frontend only (port 3000)          |
| `npm run dev:backend`    | Start backend only (port 5000)           |
| `npm run dev:ai`         | Start Python AI service only (port 5001) |
| `npm run install:all`    | Install frontend + backend npm deps      |
| `npm run db:push`        | Push Drizzle schema to PostgreSQL        |
| `npm run build:frontend` | Production build of frontend             |
| `npm run build:backend`  | Production build of backend              |

---

## Troubleshooting

| Issue                           | Fix                                                                   |
| ------------------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL` error on startup | Ensure PostgreSQL is running and `.env` has a valid connection string |
| AI service returns 500 errors   | Check that `OPENAI_API_KEY` is valid and has credits                  |
| Frontend shows API errors       | Ensure backend is running on port 5000 (Vite proxies `/api` to it)    |
| `pip install` fails             | Make sure you're using Python 3.10+                                   |
| Port already in use             | Kill existing processes: `taskkill /F /IM node.exe /T`                |
