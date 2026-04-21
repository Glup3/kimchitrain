FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
	libnss3 \
	libdbus-1-3 \
	libatk1.0-0 \
	libgbm-dev \
	libasound2 \
	libxrandr2 \
	libxkbcommon-dev \
	libxfixes3 \
	libxcomposite1 \
	libxdamage1 \
	libatk-bridge2.0-0 \
	libpango-1.0-0 \
	libcairo2 \
	libcups2 \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --omit=dev
RUN npx remotion browser ensure

COPY scripts/render-remotion.mjs ./scripts/render-remotion.mjs
COPY src/remotion ./src/remotion
COPY .output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
