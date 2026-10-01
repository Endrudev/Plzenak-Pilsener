FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

USER node

EXPOSE 3001

CMD ["node", "index.js"]