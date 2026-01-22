FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/gateway/package.json ./apps/gateway/
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/gateway/node_modules ./apps/gateway/node_modules
COPY apps/gateway ./apps/gateway
WORKDIR /app/apps/gateway
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
RUN pnpm build

# Production
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/apps/gateway/dist ./dist
COPY --from=build /app/apps/gateway/package.json ./package.json
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
RUN pnpm install --prod --frozen-lockfile

EXPOSE 8080
CMD ["node", "dist/index.js"]
