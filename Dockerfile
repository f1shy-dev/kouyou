# Base Image
FROM node:19-alpine

# Environment Variable for Node
ENV NODE_ENV=production

# prisma global, yarn alrweady installed
RUN npm install -g prisma

# Create App Directory
RUN mkdir -p /app
WORKDIR /app

# Add App Dependencies
COPY package*.json ./
RUN yarn install

# Bundle App from Current Location to App Directory
COPY . /app

# Generate Prisma Client
RUN node node_modules/prisma/build/index.js migrate deploy

# Building the Application
RUN yarn run build

# Expose Port
EXPOSE 8080

# Start the Server
CMD [ "node", "./dist/index.js" ]