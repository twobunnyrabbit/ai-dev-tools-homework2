# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Monorepo using pnpm workspaces with two main apps:
- **apps/backend**: Express.js API server (TypeScript, ESM)
- **apps/frontend**: React + Vite app (TypeScript, Tailwind CSS)
- **packages/api-types**: Shared TypeScript types generated from OpenAPI spec
- **packages/tsconfig**: Shared TypeScript configuration

## Essential Commands

### Development
```bash
# Run both frontend and backend in parallel
pnpm dev

# Run individual apps
pnpm dev:frontend  # Vite dev server (default: http://localhost:5173)
pnpm dev:backend   # tsx watch mode (default: http://localhost:3000)
```

### Building
```bash
pnpm build              # Build all apps
pnpm build:frontend     # TypeScript + Vite build
pnpm build:backend      # TypeScript compilation to dist/
```

### Type Checking & Code Generation
```bash
pnpm type-check         # Run TypeScript type check across all packages
pnpm generate:types     # Generate TypeScript types from openapi.yaml
```

## Architecture

### Backend
- **Entry**: `apps/backend/src/index.ts` - Server initialization with HTTP server + Socket.io
- **App setup**: `apps/backend/src/app.ts` - Express app, CORS, Swagger UI at `/api-docs`
- **Routes**: `apps/backend/src/routes/` - API route definitions (all prefixed with `/api`)
- **Controllers**: `apps/backend/src/controllers/` - Request handlers
- **Services**: `apps/backend/src/services/` - Business logic (session management)
- **Socket.io**: `apps/backend/src/socket/` - WebSocket handlers for real-time collaboration
- **Types**: `apps/backend/src/types/` - TypeScript interfaces
- **Middleware**: `apps/backend/src/middleware/` - Error handling, etc.
- **API spec**: `apps/backend/openapi.yaml` - OpenAPI 3.0 specification

Uses ESM modules (`.js` extensions in imports required).

### Frontend
- Built with React 19, Vite, Tailwind CSS, React Router
- Includes shadcn/ui utilities (`class-variance-authority`, `clsx`, `tailwind-merge`)
- TypeScript with strict mode enabled
- **Router**: `src/router.tsx` - Route configuration for /, /session/:id, /session-not-found
- **Pages**: `src/pages/` - HomePage, SessionPage, SessionNotFoundPage
- **Types**: `src/types/session.ts` - Frontend TypeScript types
- **API Client**: `src/lib/api.ts` - HTTP client for backend REST API

### Type Generation Workflow
1. Update `apps/backend/openapi.yaml` with API changes
2. Run `pnpm generate:types` to regenerate TypeScript types in `packages/api-types/src/schema.ts`
3. Both frontend and backend can import these types for type-safe API contracts

### TypeScript Configuration
- Root config at `tsconfig.json` provides shared strict settings
- Apps extend root config with app-specific overrides
- Backend uses `module: "ESNext"` with bundler resolution
- Frontend uses project references pattern

## Environment Setup

- **Node**: >=20 required
- **pnpm**: >=9 required
- Backend reads `.env` file via dotenv (PORT defaults to 3000)

## Current Work

**Project Goal:** Build a collaborative online coding interview platform with real-time multi-user editing.

**Implementation Plan:** See `PLAN.md` in the root directory for the complete 7-phase implementation plan with detailed checklists.

**Progress:**
- ✅ **Phase 1: Backend Foundation** - REST API + Socket.io infrastructure complete
  - Session CRUD operations with in-memory storage
  - WebSocket handlers for real-time collaboration
  - API endpoints: POST /api/sessions, GET /api/sessions/:id, GET /api/sessions/:id/code
  - Socket.io events for join/leave, code sync, language changes, cursor position
- ✅ **Phase 2: Frontend Routing + Basic UI** - Navigation and session creation complete
  - React Router setup with HomePage, SessionPage, SessionNotFoundPage
  - HTTP client (src/lib/api.ts) for REST API calls
  - Homepage with language selector and "Create Session" button
  - Session page with shareable link, copy functionality, metadata display
  - Frontend types and error handling
- ⬜ **Phase 3: Monaco Editor Integration** - Next up
- ⬜ **Phase 4-7**: Remaining phases

**Key Features:**
- Shareable session links for interviews
- Real-time collaborative code editing (Socket.io WebSockets)
- Monaco Editor with multi-language syntax highlighting
- In-memory session storage (ephemeral)
- User presence and connection status

**When continuing work:** Reference `PLAN.md` to understand the implementation roadmap and track progress through the phases.
