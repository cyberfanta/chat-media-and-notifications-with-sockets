FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose ports (HTTP API + WebSocket)
EXPOSE 5902

# Start the application
CMD ["npm", "run", "start:prod"] 