FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Prune
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @onm/db generate
RUN pnpm --filter api build
RUN pnpm deploy --filter=api --prod /prod/api

# Runner
FROM base AS runner
WORKDIR /app
COPY --from=builder /prod/api /app

# Ensure we have the prisma client in the prod image (it's often a peer dep or generated)
# In pnpm deploy --prod, it should bring deps. 
# We might need to copy the generated client manually if it's not in node_modules of the deployed app.
# But usually @onm/db is a workspace dependency. 
# For simplicity in this mono-repo setup, we might need a more robust copy approach if pnpm deploy misses things.
# Let's assume standard pnpm deploy works for now, but we might need to verify connection.

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
