FROM node:16

COPY . ./srv/www
WORKDIR /srv/www

ENV NODE_ENV=production

USER root

RUN npm install -g yarn@1.22.19 --force
RUN yarn install --production=false --frozen-lockfile
RUN rm -rf "$(yarn cache dir)"
RUN yarn build

#ENTRYPOINT "yarn build && mocha test/index.js --timeout 15000"

CMD ["mocha test/index.js --timeout 15000"]
