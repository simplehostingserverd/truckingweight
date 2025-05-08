FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables from build args
ARG SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ARG JWT_SECRET

ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV JWT_SECRET=$JWT_SECRET

# Run the schema update script
CMD ["node", "update-schema.js"]
