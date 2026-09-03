# Use official Node.js image on Alpine
FROM public.ecr.aws/docker/library/node:18-alpine

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Install root CAs and curl, then download AWS DocumentDB Certificate
RUN apk add --no-cache ca-certificates curl && \
    curl -sS https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -o /app/global-bundle.pem

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies cleanly
RUN npm install --omit=dev

# Copy backend application source code
COPY . .

# Expose backend service port
EXPOSE 5000

# Use non-root node user for container security
USER node

# Start backend server
CMD ["node", "server.js"]