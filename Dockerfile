FROM node:18.12.1-slim

WORKDIR /app

COPY ./client /app/client
COPY ./db /app/db
COPY ./middleware /app/middleware
COPY ./pages /app/pages
COPY ./public /app/public
COPY ./routes /app/routes

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY server.js /app/server.js
COPY ./utils.js /app/utils.js
COPY ./next.config.js /app/next.config.js

RUN npm ci

RUN npm prune --production

RUN npm run build

CMD ["npm", "start"]