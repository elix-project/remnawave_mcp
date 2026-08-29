FROM node:22-alpine
WORKDIR /app
COPY dist/index.js ./dist/index.js
CMD ["node", "dist/index.js"]
