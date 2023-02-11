FROM node:18.12.1-slim

WORKDIR /app

COPY ./client /app/client
COPY ./db /app/db
COPY ./pages /app/pages
COPY ./public /app/public
COPY ./utils /app/utils

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY ./utils.js /app/utils.js
COPY ./next.config.js /app/next.config.js
COPY ./middleware.js /app/middleware.js

RUN npm ci

RUN npm prune --production

RUN npm run build

CMD ["npm", "start"]