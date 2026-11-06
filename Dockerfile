# ---- deps: install all dependencies (dev deps are needed for the build) ----
FROM node:18.12.1-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
# @prisma/client's postinstall runs `prisma generate`, which needs the schema
COPY ./prisma ./prisma
RUN npm ci

# ---- builder: build the Next.js standalone output ----
FROM node:18.12.1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json next.config.js middleware.js ./
COPY ./client ./client
COPY ./db ./db
COPY ./pages ./pages
COPY ./public ./public
COPY ./utils ./utils
COPY ./prisma ./prisma
RUN npm run build

# ---- runner: minimal runtime image ----
FROM node:18.12.1-alpine AS runner
WORKDIR /app

# pg_isready for the boot script's wait-for-db loop
RUN apk add --no-cache postgresql-client

ENV NODE_ENV=production \
    PORT=3000 \
    # standalone server.js binds to $HOSTNAME, which Docker sets to the container id
    HOSTNAME=0.0.0.0

# Standalone output contains server.js plus only the traced node_modules it needs
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Prisma CLI + engines for `prisma migrate deploy` on boot (not traced into standalone)
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma/engines ./node_modules/@prisma/engines

COPY --chown=node:node ./boot.sh ./boot.sh
RUN chmod +x boot.sh

USER node
EXPOSE 3000

ENTRYPOINT ["/app/boot.sh"]
