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
RUN pnpm --filter worker build
RUN pnpm deploy --filter=worker --prod /prod/worker

# Runner
FROM base AS runner
WORKDIR /app
COPY --from=builder /prod/worker /app
COPY --from=builder /app/node_modules/.prisma/client /app/node_modules/.prisma/client

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
