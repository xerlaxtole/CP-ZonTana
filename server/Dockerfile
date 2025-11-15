FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY server ./server

WORKDIR /app/server

ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]
