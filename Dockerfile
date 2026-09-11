# Production Dockerfile for Ganpati Festival Intelligence Platform
FROM node:24-alpine AS runner

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY server/ ./server/
COPY public/ ./public/
COPY src/ ./src/

# Set production environment
ENV NODE_ENV=production
ENV PORT=30000
ENV HOST=0.0.0.0

EXPOSE 30000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:30000/api/cities || exit 1

CMD ["node", "server/index.js"]
