FROM node:24-alpine
COPY .output /app/.output
EXPOSE 3000
CMD ["node", "/app/.output/server/index.mjs"]
