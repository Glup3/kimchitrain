FROM node:24-slim AS base

###

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json /app
RUN npm ci

COPY . /app
ARG VITE_ZERO_SERVER
RUN npm run build

###

FROM builder AS migrator
CMD ["npx", "drizzle-kit", "migrate"]

###

FROM base AS app
COPY --from=builder /app/.output /app/.output
EXPOSE 3000

CMD ["node", "/app/.output/server/index.mjs"]
