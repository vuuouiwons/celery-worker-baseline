FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency specifications
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./

# Install dependencies without running untrusted build scripts
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to JavaScript
RUN pnpm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
