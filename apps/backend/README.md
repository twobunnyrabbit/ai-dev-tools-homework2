# Backend API Server

Express.js API server with TypeScript, OpenAPI documentation, and integration tests.

## Starting the Server

```bash
# Development mode (auto-reload on changes)
pnpm dev

# Production build
pnpm build
pnpm start
```

The server runs on `http://localhost:3000` (configurable via `PORT` env var).

**API Documentation:** `http://localhost:3000/api-docs` (Swagger UI)

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (re-runs on file changes)
pnpm test:watch

# Coverage report
pnpm test:coverage
```

**From root directory:**
```bash
pnpm test:backend
```

## Test Suite

Integration tests verify API endpoints via HTTP requests.

**Packages:**
- **[Vitest](https://vitest.dev/)** - Fast test framework with native ESM + TypeScript support
- **[supertest](https://github.com/ladjs/supertest)** - HTTP assertion library for testing Express apps
- **@repo/api-types** - Type-safe API contracts generated from OpenAPI spec

**Test location:** `tests/integration/`

**Why this stack:**
- Vitest: Zero-config TypeScript + ESM, Vite-compatible, Jest-like API
- supertest: Industry standard for API testing, no server.listen() required
- Type safety: OpenAPI → TypeScript ensures tests match API contract

See `tests/integration/README.md` for test patterns and examples.

## Available Endpoints

- `GET /api/health` - Health check endpoint

See `openapi.yaml` for full API specification.

## Environment Variables

Create `.env` file:
```bash
PORT=3000
NODE_ENV=development
```

## Type Generation

After modifying `openapi.yaml`:
```bash
pnpm generate:types
```

Regenerates TypeScript types in `packages/api-types/src/schema.ts`.
