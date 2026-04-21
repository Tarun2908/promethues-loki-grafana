# Stage 1: Build - install production dependencies
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

# Stage 2: Production - minimal runtime image
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production dependencies from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy application source
COPY src ./src

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

CMD ["node", "src/server.js"]
