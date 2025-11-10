# Dockerfile for the Node.js Socket.IO server
# Note: build context should be the repository root so package*.json are available.
FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Copy package files from repo root (build with context = repo root or use -f)
COPY package*.json ./

# Install only production dependencies to keep image small
RUN npm ci --only=production

# Copy server code into the image
COPY server ./server

# Set working directory to server
WORKDIR /app/server

# Expose the port (default in your .env is 8080)
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]
