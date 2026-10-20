FROM node:22-alpine

WORKDIR /app

# Make the public API URL available during the Next.js build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
#ENV NEXT_PUBLIC_API_URL="http://localhost:4001"

# Increase Node.js heap limit to 4 GB
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Build Next.js application
RUN npm run build

# Expose application port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]