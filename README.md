# StudyMate

A real-time collaborative study platform for competitive exam aspirants.

## Features

- **Virtual Study Rooms** — Synchronized Pomodoro timers, live presence tracking, real-time chat
- **Social Resource Feed** — Share study materials with likes, comments, follows, and saves
- **Analytics** — Study hours tracking, streaks, leaderboard
- **Exam Categories** — JEE, NEET, UPSC, GATE

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Backend | Express.js + TypeScript |
| Database | MongoDB (Mongoose ODM) |
| Cache | Redis (node-redis) |
| WebSocket | Socket.io |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Queue | BullMQ |
| Logger | Winston |
| Monorepo | TurboRepo |

## Project Structure

```
studymate/
├── apps/
│   ├── api/          # REST API Server (Express + Bun)
│   ├── websocket/    # WebSocket Server (Socket.io + Bun)
│   ├── web/          # Next.js Frontend
│   └── admin/        # Admin Dashboard
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Shared configuration
│   ├── validation/   # Zod schemas
│   ├── database/     # Mongoose models
│   ├── auth/         # JWT + bcrypt utilities
│   ├── cache/        # Redis caching layer
│   ├── storage/      # File storage abstraction
│   ├── queue/        # BullMQ background jobs
│   ├── logger/       # Winston logger
│   ├── analytics/    # Study metrics & leaderboard
│   ├── notifications/# Push & email services
│   └── utils/        # Shared utilities
└── scripts/          # Automation scripts
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2+
- MongoDB (cloud or local via Docker)
- Redis (cloud or local via Docker)

### Installation

```bash
# Install dependencies
bun install

# Start local MongoDB + Redis (optional, if not using cloud)
docker-compose up -d

# Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/websocket/.env.example apps/websocket/.env

# Run all apps in development
bun run dev

# Run only the API
bun run dev:api

# Run only the WebSocket server
bun run dev:ws
```

### Build

```bash
bun run build
```

## Architecture

```
Client → API Server (Express) → Services → Repositories → MongoDB
                ↕                    ↕
         WebSocket Server      Redis Cache
                ↕                    ↕
         Socket.io Rooms       BullMQ Queue → Workers
```
