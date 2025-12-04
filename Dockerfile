# Stage 1: Base - pnpm + workspace deps
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace configuration and lock file
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files to set up workspace structure
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/api-types/package.json ./packages/api-types/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Stage 2: Build frontend (static assets)
FROM base AS build-frontend

# Install all dependencies (including dev deps for building)
RUN pnpm install --frozen-lockfile

# Copy root tsconfig (referenced by frontend tsconfig)
COPY tsconfig.json ./

# Copy shared packages and frontend source
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

# Build frontend - output to apps/frontend/dist/
RUN pnpm --filter frontend build

# Stage 3: Build backend (needs all deps including TypeScript)
FROM base AS build-backend

# Install all dependencies (including dev deps needed for building)
RUN pnpm install --frozen-lockfile

# Copy root tsconfig (may be referenced by backend tsconfig)
COPY tsconfig.json ./

# Copy shared packages and backend source
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

# Build backend - output to apps/backend/dist/
RUN pnpm --filter backend build

# Stage 4: Production dependencies (only runtime deps)
FROM base AS prod-deps

# Install only production dependencies for runtime
RUN pnpm install --frozen-lockfile --prod

# Stage 5: Production runtime
FROM node:20-alpine AS production

WORKDIR /app

# Copy production node_modules from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy backend build output
COPY --from=build-backend /app/apps/backend/dist ./apps/backend/dist

# Copy runtime files (openapi.yaml needed for Swagger UI)
COPY --from=build-backend /app/apps/backend/openapi.yaml ./apps/backend/
COPY --from=build-backend /app/apps/backend/package.json ./apps/backend/

# Copy frontend build output to backend's public directory
# Backend will serve these static files in production
COPY --from=build-frontend /app/apps/frontend/dist ./apps/backend/public

# Set working directory to backend
WORKDIR /app/apps/backend

# Set environment to production
ENV NODE_ENV=production

# Expose port 3000 (cloud platforms may override with PORT env var)
EXPOSE 3000

# Start the Node.js server
CMD ["node", "dist/index.js"]
