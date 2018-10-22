# Dockerfile for running masao.space
FROM node:8
MAINTAINER uhyo
# store uploaded files as volume.
VOLUME /service-masao-space/uploaded-files
RUN chown node:node /service-masao-space/uploaded-files
WORKDIR /service-masao-space

# first, prepare sub module.
COPY packages/util/package.json ./packages/util/
# install dependencies.
COPY ./package.json ./package-lock.json ./
RUN cd packages/util && npm install --production && \
    cd ../.. && npm ci --only=production
# copy files needed to run the application.
COPY config/default.yaml ./config/
COPY packages/util/dist/ ./packages/util/dist/
COPY client/views ./client/views/
COPY dist/ ./dist/
COPY dist-server/ ./dist-server/
USER node
CMD ["npm", "start"]

