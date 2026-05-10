FROM node:24

COPY . ./srv/www
WORKDIR /srv/www

ENV NODE_ENV=production

USER root

RUN corepack enable
RUN yarn install --immutable
RUN yarn build

#ENTRYPOINT "yarn build && mocha test/index.js --timeout 15000"

CMD ["mocha test/index.js --timeout 15000"]
