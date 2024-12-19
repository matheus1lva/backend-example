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

EXPOSE $PORT

CMD ["node", "dist/index.js"]
