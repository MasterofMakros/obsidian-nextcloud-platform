FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache openssl libc6-compat

# Builder
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm --filter @onm/db exec prisma generate --schema=prisma/schema.prisma
# Handle pnpm nested structure by finding the generated client
RUN PRISMA_LOCATION=$(find /app -path "*/.prisma/client" -print -quit) && \
    mkdir -p /app/prisma-copy && \
    cp -r "$PRISMA_LOCATION/"* /app/prisma-copy/

RUN pnpm --filter worker build
RUN pnpm deploy --filter=worker --prod /prod/worker

# Runner
FROM base AS runner
WORKDIR /app
COPY --from=builder /prod/worker /app
COPY --from=builder /app/apps/worker/dist /app/dist
COPY --from=builder /app/prisma-copy /app/node_modules/.prisma/client

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
