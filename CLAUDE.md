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
- **Entry**: `apps/backend/src/index.ts` - Server initialization with dotenv config
- **App setup**: `apps/backend/src/app.ts` - Express app, CORS, Swagger UI at `/api-docs`
- **Routes**: `apps/backend/src/routes/` - API route definitions (all prefixed with `/api`)
- **Controllers**: `apps/backend/src/controllers/` - Request handlers
- **Middleware**: `apps/backend/src/middleware/` - Error handling, etc.
- **API spec**: `apps/backend/openapi.yaml` - OpenAPI 3.0 specification

Uses ESM modules (`.js` extensions in imports required).

### Frontend
- Built with React 19, Vite, Tailwind CSS
- Includes shadcn/ui utilities (`class-variance-authority`, `clsx`, `tailwind-merge`)
- TypeScript with strict mode enabled

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
