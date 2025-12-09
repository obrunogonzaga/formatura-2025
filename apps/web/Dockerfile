FROM node:20-slim AS base
ENV PRISMA_CLI_BINARY_TARGETS=linux-arm64-openssl-3.0.x
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY prisma ./prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
# Force install ALL dependencies regardless of NODE_ENV
RUN npm ci --include=dev

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate --workspace apps/web
# Build without NODE_ENV restrictions
RUN npm run build --workspace apps/web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

