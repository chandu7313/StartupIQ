# Same build stages as API — different entrypoint
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db/package.json    ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY apps/workers/package.json   ./apps/workers/
COPY apps/api/package.json       ./apps/api/

RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app

COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY apps/workers/ ./apps/workers/
COPY turbo.json ./

RUN pnpm --filter @startupsaarthi/db exec prisma generate
RUN pnpm --filter @startupsaarthi/workers run build

FROM node:20-alpine AS runner
RUN apk add --no-cache curl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 workers \
 && adduser  --system --uid 1001 workers

RUN corepack enable && corepack prepare pnpm@9 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db/package.json    ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY apps/workers/package.json   ./apps/workers/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/workers/dist        ./apps/workers/dist
COPY --from=builder /app/packages/db/prisma       ./packages/db/prisma
COPY --from=builder /app/node_modules/.prisma     ./node_modules/.prisma

USER workers

HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Workers entrypoint — runs Bull queue processors
CMD ["node", "apps/workers/dist/main.js"]
