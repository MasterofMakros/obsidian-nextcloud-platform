FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm
COPY . .
RUN pnpm install --frozen-lockfile
# Design tokens must be built before web
RUN pnpm --filter @onm/design-tokens build
RUN pnpm --filter web build

FROM base AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app .
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
