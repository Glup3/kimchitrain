FROM node:24-slim
COPY .output /app/.output
EXPOSE 3000
CMD ["node", "/app/.output/server/index.mjs"]
