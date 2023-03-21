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

# COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma

RUN yarn install --production

EXPOSE 8080
# 👇 new migrate and start app script
CMD [  "yarn", "run", "start:migrate" ]