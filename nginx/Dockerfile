FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY production.conf /etc/nginx/conf.d/default.conf

# Create directories for SSL, static files, and nginx cache
RUN mkdir -p /etc/nginx/ssl /var/www/html /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx

# Copy error pages
COPY www/ /var/www/html/

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]