# Use Node 20 (Next.js 16 requirement) in slim image
FROM node:20-slim AS base
WORKDIR /app

# Install OS deps needed by pdfkit (fonts) and Prisma (OpenSSL)
RUN apt-get update && apt-get install -y \
  fontconfig \
  openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Garantir existência de public (mesmo vazio) para COPY no runner
RUN mkdir -p public
# Gera Prisma Client dentro do node_modules que será reutilizado
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Next.js 16 standalone server
EXPOSE 3000
CMD ["npm", "run", "start"]
