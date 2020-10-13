FROM node:14-alpine AS builder

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY tsconfig* build.js ./
COPY src src/

RUN npm run build

FROM node:14-alpine AS runner

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
COPY .sequelize.js .
COPY migrations migrations
COPY seeders seeders
COPY --from=builder --chown=node:node /usr/src/app/dist dist

RUN npm install --production

USER node

ENV NODE_ENV production

CMD [ "npm", "run", "start" ]
