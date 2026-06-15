# ─────────────────────────────────────────────────────────────
# Stage 1: Install ALL dependencies
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db/package.json    ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json       ./apps/api/

RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────────────────────
# Stage 2: Build TypeScript
# ─────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY turbo.json ./

# Generate Prisma client
RUN pnpm --filter @startupsaarthi/db exec prisma generate

# Compile TypeScript
RUN pnpm --filter @startupsaarthi/api run build

# ─────────────────────────────────────────────────────────────
# Stage 3: Production runner (production deps only)
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache curl libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user
RUN addgroup --system --gid 1001 nestjs \
 && adduser  --system --uid 1001 nestjs

# Install production deps only
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db/package.json    ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json       ./apps/api/

RUN pnpm install --frozen-lockfile --prod

# Copy compiled output + Prisma client
COPY --from=builder /app/apps/api/dist          ./apps/api/dist
COPY --from=builder /app/packages/db/prisma     ./packages/db/prisma
COPY --from=builder /app/node_modules/.prisma   ./node_modules/.prisma

USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "apps/api/dist/main.js"]
