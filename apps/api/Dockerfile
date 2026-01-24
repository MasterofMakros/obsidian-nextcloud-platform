FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache openssl libc6-compat

# Prune
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm --filter @onm/db exec prisma generate --schema=prisma/schema.prisma
# Handle pnpm nested structure by finding the generated client
RUN PRISMA_LOCATION=$(find /app -path "*/.prisma/client" -print -quit) && \
    mkdir -p /app/prisma-copy && \
    cp -r "$PRISMA_LOCATION/"* /app/prisma-copy/

RUN pnpm --filter api build
RUN pnpm deploy --filter=api --prod /prod/api

# Runner
FROM base AS runner
WORKDIR /app
COPY --from=builder /prod/api /app
COPY --from=builder /app/apps/api/dist /app/dist

# Copy Prisma client to the correct pnpm nested location
RUN mkdir -p /app/node_modules/.prisma/client
COPY --from=builder /app/prisma-copy /app/node_modules/.prisma/client

# Also copy to the nested pnpm path where @prisma/client looks for it
RUN PRISMA_DEST=$(find /app/node_modules/.pnpm -type d -name ".prisma" 2>/dev/null | head -1) && \
    if [ -n "$PRISMA_DEST" ]; then \
    mkdir -p "$PRISMA_DEST/client" && \
    cp -r /app/node_modules/.prisma/client/* "$PRISMA_DEST/client/"; \
    fi

# Ensure we have the prisma client in the prod image (it's often a peer dep or generated)
# In pnpm deploy --prod, it should bring deps. 
# We might need to copy the generated client manually if it's not in node_modules of the deployed app.
# But usually @onm/db is a workspace dependency. 
# For simplicity in this mono-repo setup, we might need a more robust copy approach if pnpm deploy misses things.
# Let's assume standard pnpm deploy works for now, but we might need to verify connection.

ENV NODE_ENV=production
ENV PORT=3011

CMD ["node", "dist/index.js"]
