# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_CESIUM_TOKEN

# Use ARG values but don't expose them in the final image
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN
ENV NEXT_PUBLIC_CESIUM_TOKEN=$NEXT_PUBLIC_CESIUM_TOKEN

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

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
