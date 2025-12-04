# Collaborative Coding Interview Platform

Real-time collaborative code editor for technical interviews with multi-user editing, browser-based code execution, and shareable session links.

## Features

- **Real-time collaboration** - Multiple users editing code simultaneously via WebSocket
- **Monaco Editor** - VSCode-style editor with syntax highlighting for 6 languages
- **Browser execution** - Run JavaScript, TypeScript, and Python code directly in the browser
  - JS/TS: Web Workers with 5s timeout
  - Python: Pyodide WASM (~30MB, lazy loaded from CDN)
- **Live output sharing** - See execution results from all users in real-time
- **Session management** - Shareable links, auto-cleanup (1hr idle, 5min empty)
- **User presence** - Live user list with avatars, connection status
- **Production ready** - Docker containerization, cloud platform deployment

**Supported Languages:** JavaScript, TypeScript, Python, Java, Go, C++

## Quick Start

### Prerequisites
- Node.js ≥20
- pnpm ≥9

### Local Development

```bash
# Install dependencies
pnpm install

# Run both frontend (5173) and backend (3000)
pnpm dev

# Open http://localhost:5173
```

### Individual Services

```bash
# Backend only (http://localhost:3000)
pnpm dev:backend

# Frontend only (http://localhost:5173)
pnpm dev:frontend

# API docs: http://localhost:3000/api-docs
```

## Docker Deployment

### Production (Single Container)

Backend serves frontend static files, optimized for cloud platforms.

```bash
# Build image (259MB, ~3-5min)
docker build -t interview-platform:latest .

# Run container
docker run -p 3000:3000 -e NODE_ENV=production interview-platform:latest

# Access at http://localhost:3000
```

**Features:**
- Multi-stage build (5 stages)
- node:20-alpine base (minimal size)
- Production dependencies only
- Frontend served from backend
- Single port exposure (3000)

### Development Container

Full dev environment with hot reload.

```bash
# Build dev image
docker build -f Dockerfile.dev -t interview-platform:dev .

# Run with hot reload
docker run -p 3000:3000 -p 5173:5173 interview-platform:dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Cloud Deployment

**Railway:**
```bash
railway login
railway link
railway up  # Auto-detects Dockerfile
```

**Render:**
1. Connect GitHub repo
2. Create "Web Service"
3. Auto-deploys on push

**Fly.io:**
```bash
fly launch
fly deploy
```

All platforms auto-inject `PORT` and provide SSL/public URLs.

## Project Structure

```
├── apps/
│   ├── backend/           # Express API + Socket.io
│   │   ├── src/
│   │   │   ├── index.ts            # Server entry
│   │   │   ├── app.ts              # Express setup + static serving
│   │   │   ├── routes/             # API routes (/api/*)
│   │   │   ├── controllers/        # Request handlers
│   │   │   ├── services/           # Session management, cleanup
│   │   │   ├── socket/             # WebSocket handlers
│   │   │   └── middleware/         # Error handling
│   │   ├── openapi.yaml   # API specification
│   │   └── tests/         # Integration tests (Vitest + supertest)
│   │
│   └── frontend/          # React + Vite + Tailwind
│       ├── src/
│       │   ├── pages/              # HomePage, SessionPage
│       │   ├── components/         # CodeEditor, UserList, ShareLink
│       │   ├── hooks/              # useSocket, useCollaboration
│       │   ├── lib/                # API client, Socket.io client
│       │   └── workers/            # Code execution workers
│       └── tests/         # Component tests (Vitest + Testing Library)
│
├── packages/
│   ├── api-types/         # Generated TypeScript types from OpenAPI
│   └── tsconfig/          # Shared TypeScript config
│
├── Dockerfile             # Production build
├── Dockerfile.dev         # Development container
├── .dockerignore          # Docker build context optimization
└── pnpm-workspace.yaml    # Monorepo config
```

## Development Workflow

### Build

```bash
# Build all apps
pnpm build

# Build individual apps
pnpm build:frontend
pnpm build:backend
```

### Type Checking

```bash
# Check all packages
pnpm type-check

# Generate types from OpenAPI spec
pnpm generate:types
```

### Testing

```bash
# Run all tests
pnpm test

# Backend tests only
pnpm test:backend

# Frontend tests only
pnpm test:frontend

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

**Test Stack:**
- **Vitest** - Fast test runner with native TypeScript/ESM
- **supertest** - HTTP assertions for API testing
- **@testing-library/react** - React component testing
- **@repo/api-types** - Type-safe API contracts

## API Documentation

Interactive API docs available at `http://localhost:3000/api-docs` (Swagger UI).

### Key Endpoints

- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session metadata
- `GET /api/sessions/:id/code` - Get current code

### WebSocket Events

**Client → Server:**
- `join-session` - Join with username
- `code-change` - Broadcast code update
- `language-change` - Update language
- `execute-code` - Run code, share output

**Server → Client:**
- `user-joined` - New user notification
- `user-left` - User disconnection
- `code-update` - Code sync
- `language-update` - Language change
- `execution-result` - Code execution output

## Architecture Notes

### Monorepo (pnpm workspaces)
- Shared types via `@repo/api-types`
- Common TypeScript config
- Workspace dependencies (no duplication)

### Backend (ESM)
- `.js` extensions required in imports
- `"type": "module"` in package.json
- tsx for dev, tsc for build

### Frontend
- React 19 + Vite 7
- Tailwind CSS + shadcn/ui patterns
- Monaco Editor via `@monaco-editor/react`
- Pyodide 0.29 for Python execution

### Type Generation
1. Update `apps/backend/openapi.yaml`
2. Run `pnpm generate:types`
3. TypeScript types regenerated in `packages/api-types/`
4. Both apps import from `@repo/api-types`

## Environment Variables

### Backend (.env)
```bash
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```bash
# Optional: Override API URL
VITE_API_URL=http://localhost:3000
```

Production uses same-origin (backend serves frontend).

## Implementation Progress

See `PLAN.md` for complete 7-phase implementation roadmap.

**Completed:**
- ✅ Phase 1: Backend Foundation (REST API + Socket.io)
- ✅ Phase 2: Frontend Routing + UI
- ✅ Phase 3: Monaco Editor Integration
- ✅ Phase 4: Real-time Collaboration
- ✅ Phase 5: User Presence
- ✅ Phase 6: Polish + Error Handling
- ✅ Phase 7: Testing
- 🔄 Phase 8: Code Execution (Phases 1-4 complete)

## Contributing

### Prerequisites
- Node.js ≥20
- pnpm ≥9

### Setup
```bash
# Clone repo
git clone <repo-url>
cd ai-dev-tools-homework2

# Install dependencies
pnpm install

# Start dev servers
pnpm dev
```

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier (future)
- ESM modules (`.js` extensions required)

### Testing
All PRs require passing tests:
```bash
pnpm test
pnpm type-check
```

## License

MIT

## Support

Issues and questions: [GitHub Issues](https://github.com/your-repo/issues)
