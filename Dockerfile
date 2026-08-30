# UAFSAIDA - Universal AI Software Development Platform
# Multi-stage Dockerfile for production deployment

# ═══════════════════════════════════════════════════════════
# Stage 1: Dependencies
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy lockfile and package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# ═══════════════════════════════════════════════════════════
# Stage 2: Builder
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ═══════════════════════════════════════════════════════════
# Stage 3: Runner (Production)
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 uafsaida

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Set ownership
RUN chown -R uafsaida:nodejs /app

USER uafsaida

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
