# Smart Contracts Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npx", "hardhat", "node"]
RUN chmod +x node_modules/.bin/hardhat