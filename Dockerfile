FROM node:22-slim AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:22-slim

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

# Define build arguments
ARG APP_ENV
ARG PORT
ARG DATABASE_URL
ARG LOG_LEVEL
ARG JWT_EXPIRES_IN
ARG REDIS_URL

# Set environment variables from build arguments
ENV APP_ENV=${APP_ENV} \
    PORT=${PORT} \
    DATABASE_URL=${DATABASE_URL} \
    LOG_LEVEL=${LOG_LEVEL} \
    JWT_EXPIRES_IN=${JWT_EXPIRES_IN} \
    REDIS_URL=${REDIS_URL}

EXPOSE $PORT

CMD ["node", "--import=tsx", "dist/server.js"]
