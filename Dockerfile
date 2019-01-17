# Dockerfile for running masao.space
FROM node:8
MAINTAINER uhyo
WORKDIR /service-masao-space
# store uploaded files as volume.
RUN mkdir /service-masao-space/uploaded-files
RUN chown node:node /service-masao-space/uploaded-files
VOLUME /service-masao-space/uploaded-files

# first, prepare sub module.
COPY packages/util/package.json ./packages/util/
# install dependencies.
COPY ./package.json ./package-lock.json ./
RUN cd packages/util && npm install --production && \
    cd ../.. && npm ci --only=production
# copy files needed to run the application.
COPY docker/init.sh ./
COPY config/default.yaml ./config/
COPY packages/util/dist/ ./packages/util/dist/
COPY client/views ./client/views/
COPY dist/ ./dist/
COPY dist-server/ ./dist-server/

USER node
EXPOSE 8080
CMD ["./init.sh"]

