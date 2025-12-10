# Use Node 20 (Next.js 16 requirement) in slim image
FROM node:20-slim AS base
WORKDIR /app

# Install OS deps needed by pdfkit (fonts, etc.)
RUN apt-get update && apt-get install -y \
  fontconfig \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Next.js 16 standalone server
EXPOSE 3000
CMD ["npm", "run", "start"]
