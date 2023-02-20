FROM node:18.12.1-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client # needed for boot script to work

COPY ./client /app/client
COPY ./db /app/db
COPY ./pages /app/pages
COPY ./public /app/public
COPY ./utils /app/utils
COPY ./prisma /app/prisma

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY ./utils.js /app/utils.js
COPY next.config.mjs /app/next.config.mjs
COPY ./middleware.js /app/middleware.js
COPY ./boot.sh /app/boot.sh

RUN chmod +x boot.sh

RUN npm ci

RUN npm prune --production

RUN npm run build

ENTRYPOINT ["/app/boot.sh"]