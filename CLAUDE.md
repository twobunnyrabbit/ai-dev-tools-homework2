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
- Built with React 19, Vite, Tailwind CSS, React Router, Monaco Editor, Socket.io Client
- Includes shadcn/ui utilities (`class-variance-authority`, `clsx`, `tailwind-merge`)
- TypeScript with strict mode enabled
- **Router**: `src/router.tsx` - Route configuration for /, /session/:id, /session-not-found
- **Pages**: `src/pages/` - HomePage, SessionPage, SessionNotFoundPage
- **Components**: `src/components/` - CodeEditor, LanguageSelector, ShareLink, UserList, ConnectionStatus
- **Hooks**: `src/hooks/` - useSocket (connection management), useCollaboration (code sync with debouncing)
- **Types**: `src/types/session.ts` - Frontend TypeScript types
- **API Client**: `src/lib/api.ts` - HTTP client for backend REST API
- **Socket Client**: `src/lib/socket.ts` - Socket.io client instance with reconnection support

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
- ✅ **Phase 3: Monaco Editor Integration** - Working code editor complete
  - Monaco Editor wrapper component with dark theme
  - Support for 6 languages: JavaScript, TypeScript, Python, Java, Go, C++
  - LanguageSelector dropdown component
  - ShareLink component with copy-to-clipboard
  - SessionPage integrated with CodeEditor
  - Proper height/layout configuration for full-screen editor
- ✅ **Phase 4: Real-time Collaboration** - Multi-user code sync complete
  - Socket.io client with connection management and auto-reconnection
  - useSocket hook for connection status tracking (connected/reconnecting/disconnected)
  - useCollaboration hook with 300ms debouncing for code changes
  - Username dialog on session join with blur effect on editor
  - Real-time code and language synchronization between users
  - Connection status indicator with color-coded states
  - Clean socket disconnect on unmount
  - WebSocket proxy in Vite for /socket.io path
- ✅ **Phase 5: User Presence** - Complete
  - UserList component showing connected users with avatar circles
  - ConnectionStatus component with color-coded indicators (green/yellow/red)
  - Real-time user join/leave notifications
  - User count badge and overflow handling (max 5 avatars shown)
  - Duplicate username handling with auto-incrementing numbers
  - Integrated header layout: ShareLink | LanguageSelector | UserList | ConnectionStatus
- ✅ **Phase 6: Polish + Error Handling** - Complete
  - Session cleanup service with TTL-based cleanup (1 hour idle, 5 min empty)
  - React ErrorBoundary for error handling
  - Loading states with skeleton loaders
  - Editor disabled until connected with overlay
  - Reconnecting/disconnected banners
  - Responsive mobile layout (header stacks on mobile)
  - Copy link feedback ("Copied!" state)
  - Graceful shutdown handlers (SIGTERM, SIGINT)
- ✅ **Phase 7: Testing** - Complete
  - Backend tests: Session service, cleanup logic, Socket.io handlers
  - Frontend tests: CodeEditor, LanguageSelector, UserList, ShareLink
  - Manual testing checklist verified
  - All tests passing (24/24)
- 🔄 **Phase 8: Code Execution** - In Progress (Phases 1-3 complete, 4-7 remaining)
  - ✅ Phase 8.1: Core Infrastructure (JS/TS execution with Web Workers, 5s timeout)
  - ✅ Phase 8.2: Python Support (Pyodide WASM, lazy CDN loading, 60s first-load timeout)
  - ✅ Phase 8.3: UI Integration (OutputPanel, RunButton, Cmd/Ctrl+Enter shortcut)
  - ⬜ Phase 8.4: Real-time Output Sharing (Socket.io broadcast)
  - ⬜ Phase 8.5: Security & Error Handling (Output limits, CSP headers)
  - ⬜ Phase 8.6: Polish & UX (Execution stats, ANSI colors, mobile)
  - ⬜ Phase 8.7: Testing & Documentation

**Key Features:**
- Shareable session links for interviews
- Real-time collaborative code editing (Socket.io WebSockets)
- Monaco Editor with multi-language syntax highlighting (6 languages: JS, TS, Python, Java, Go, C++)
- **Browser-based code execution for JavaScript, TypeScript, and Python**
  - Web Workers for isolated execution with 5s timeout
  - Pyodide WASM for Python (lazy loaded from CDN, ~30MB first-time)
  - Console output capture and error handling
  - Collapsible output panel with execution time display
  - Keyboard shortcut: Cmd/Ctrl+Enter to run code
- In-memory session storage (ephemeral)
- Live user presence with avatar display
- Connection status indicator with auto-reconnection
- Username-based session participation with duplicate handling
- Debounced code synchronization (300ms) for performance
- Username dialog with blur effect on editor during join

**When continuing work:** Reference `PLAN.md` to understand the implementation roadmap and track progress through the phases.
