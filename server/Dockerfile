# Stage 1: Base with pnpm enabled
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 2: Install all dependencies and compile TypeScript
FROM base AS builder
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

# Stage 3: Install production-only dependencies
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Stage 4: Minimal production runtime image
FROM node:22-alpine AS runner
WORKDIR /app

ENV PORT=3000

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
