FROM nginx:alpine

# Copy custom nginx configuration
COPY production.conf /etc/nginx/conf.d/default.conf

# Create directories for SSL and static files
RUN mkdir -p /etc/nginx/ssl /var/www/html

# Copy error pages
COPY www/ /var/www/html/

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]