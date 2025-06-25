# Build stage
FROM node:20.19.0-alpine AS builder

WORKDIR /app

# Set npm configurations for optimization
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3

# Copy package files
COPY package*.json ./

# Install dependencies with optimization
RUN npm ci --include=dev --no-audit --no-fund && \
    npm cache clean --force

# Copy the rest of the application
COPY . .

# Ensure public directory exists (create if missing)
RUN mkdir -p public

# Set environment variables for build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_CESIUM_TOKEN
ARG SUPABASE_SERVICE_ROLE_KEY
ARG SUPABASE_JWT_SECRET

# Use ARG values but don't expose them in the final image
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN
ENV NEXT_PUBLIC_CESIUM_TOKEN=$NEXT_PUBLIC_CESIUM_TOKEN
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET

# Build the application and cleanup
RUN npm run build && \
    npm cache clean --force

# Production stage
FROM node:20.19.0-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Set npm configurations for optimization
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3

# Copy package files
COPY package*.json ./

# Install only production dependencies with optimization
RUN npm ci --omit=dev --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/* /root/.npm

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Set non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
