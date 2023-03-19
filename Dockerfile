# # Base Image
# FROM node:19-alpine

# # Environment Variable for Node

# # prisma global, yarn alrweady installed
# RUN npm install -g prisma

# # Create App Directory
# RUN mkdir -p /app
# WORKDIR /app

# # Add App Dependencies
# COPY package*.json ./
# COPY prisma ./prisma/
# COPY yarn.lock ./
# RUN yarn install

# # Bundle App from Current Location to App Directory
# COPY . /app

# # Generate Prisma Client
# # RUN node node_modules/prisma/build/index.js migrate deploy

# # Building the Application
# RUN yarn run build

# # Expose Port
# EXPOSE 8080

# # Start the Server
# CMD [ "node", "./dist/index.js" ]


FROM node:19-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY yarn.lock ./
COPY prisma ./prisma/

# Install app dependencies
RUN yarn install

COPY . .

RUN yarn run build

FROM node:19-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080
# 👇 new migrate and start app script
CMD [  "yarn", "run", "start:migrate" ]