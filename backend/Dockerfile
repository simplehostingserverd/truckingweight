# Build stage
FROM node:20.19.0-alpine AS builder

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

# Generate Prisma client first
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20.19.0-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy prisma directory first
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production stage
RUN npx prisma generate

# Copy built application from builder stage (no .env file needed in production)
COPY --from=builder /app/server-fastify.mjs ./
COPY --from=builder /app/server.cjs ./
COPY --from=builder /app/config ./config
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/services ./services
COPY --from=builder /app/plugins ./plugins
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeapp && \
    chown -R nodeapp:nodejs /app

USER nodeapp

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "server-fastify.mjs"]
