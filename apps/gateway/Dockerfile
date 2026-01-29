FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/gateway/package.json ./apps/gateway/
COPY packages/db/package.json ./packages/db/
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
RUN pnpm install --frozen-lockfile

# Copy source files for build
COPY packages/db ./packages/db
COPY apps/gateway ./apps/gateway

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/gateway/node_modules ./apps/gateway/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY packages/db ./packages/db
COPY apps/gateway ./apps/gateway
WORKDIR /app/apps/gateway
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
RUN pnpm build

# Production
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/apps/gateway/dist ./dist
COPY --from=build /app/apps/gateway/package.json ./package.json
# Copy both root and gateway node_modules for hoisted dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/gateway/node_modules ./apps_node_modules
# Merge them (gateway deps override root deps)
RUN cp -r ./apps_node_modules/* ./node_modules/ 2>/dev/null || true && rm -rf ./apps_node_modules

EXPOSE 8080
CMD ["node", "dist/index.js"]
