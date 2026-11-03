FROM node:26

COPY . ./srv/www
WORKDIR /srv/www

ENV NODE_ENV=production

USER root

RUN corepack enable
RUN yarn install --immutable
RUN yarn build
