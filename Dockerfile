FROM node:20-slim

# Install GCC and build tools
RUN apt-get update && apt-get install -y gcc build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build React
COPY . .
RUN npm run build:prod

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
