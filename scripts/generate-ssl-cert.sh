#!/bin/bash

# Script to generate a self-signed SSL certificate for local development
# This helps with cookie and authentication issues in development

# Set variables
CERT_DIR="./ssl"
CERT_NAME="localhost"
DAYS_VALID=365

# Create directory if it doesn't exist
mkdir -p $CERT_DIR

echo "Generating self-signed SSL certificate for local development..."

# Generate private key
openssl genrsa -out $CERT_DIR/$CERT_NAME.key 2048

# Generate certificate signing request
openssl req -new -key $CERT_DIR/$CERT_NAME.key -out $CERT_DIR/$CERT_NAME.csr -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days $DAYS_VALID -in $CERT_DIR/$CERT_NAME.csr -signkey $CERT_DIR/$CERT_NAME.key -out $CERT_DIR/$CERT_NAME.crt

echo "SSL certificate generated successfully!"
echo "Certificate location: $CERT_DIR/$CERT_NAME.crt"
echo "Private key location: $CERT_DIR/$CERT_NAME.key"
echo ""
echo "To use this certificate with Next.js, update your next.config.js file with the https configuration."
echo "Remember to add the certificate to your browser's trusted certificates if needed."
