# Build stage
FROM node:20.18.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Set environment variables for build
ARG NODE_ENV=production
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG JWT_SECRET

ENV NODE_ENV=$NODE_ENV
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_KEY=$SUPABASE_KEY
ENV JWT_SECRET=$JWT_SECRET

# Build the application (if there's a build step)
RUN npm run build || echo "No build script found"

# Production stage
FROM node:20.18.0-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server-fastify.js ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/config ./config

# Set non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeapp && \
    chown -R nodeapp:nodejs /app

USER nodeapp

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "server-fastify.js"]
