FROM node:14-alpine AS builder

WORKDIR /usr/src/app

RUN apk add libtool autoconf automake alpine-sdk python3

RUN npm install -g npm

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY tsconfig* build.js ./
COPY src src/

RUN npm run build

RUN npm prune --production

FROM node:14-alpine AS runner

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY .sequelize.js .
COPY migrations migrations
COPY seeders seeders
COPY --from=builder --chown=node:node /usr/src/app/dist dist

USER node

ENV NODE_ENV production

CMD [ "npm", "run", "start" ]
