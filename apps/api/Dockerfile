FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @onm/db generate
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app .
EXPOSE 3001
CMD ["pnpm", "--filter", "api", "start"]
