# ---- build stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# ---- runtime stage ----
FROM node:20-alpine

WORKDIR /app

# Run as non-root user
USER node

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node src ./src
COPY --chown=node:node package.json ./

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
