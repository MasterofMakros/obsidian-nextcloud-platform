FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @onm/db generate
RUN pnpm --filter worker build

FROM base AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app .
CMD ["pnpm", "--filter", "worker", "start"]
