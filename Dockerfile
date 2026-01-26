# syntax=docker/dockerfile:1.7-labs

ARG BUN_VERSION=1.3.6

# Stage 1: Build stage
FROM oven/bun:${BUN_VERSION}-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun --bun run build

# Stage 2: Production stage
FROM oven/bun:${BUN_VERSION}-alpine
LABEL fly_launch_runtime="Bun"
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json /app/bun.lock ./
RUN bun install --production --frozen-lockfile

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/drizzle.config.ts ./

RUN mkdir -p /data

EXPOSE 3000

CMD ["sh", "-c", "bun run db:migrate && bun run .output/server/index.mjs"]
