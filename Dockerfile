FROM node:22-alpine as build

RUN apk add --no-cache git

WORKDIR /app
COPY doc/ /app/

# Page footer variables
ARG GIT_TAG
ARG BUILD_DATE
ENV VUEPRESS_GIT_TAG=$GIT_TAG
ENV VUEPRESS_BUILD_DATE=$BUILD_DATE


RUN npm install && \
  npm run docs:build

FROM nginx:latest
COPY --from=build /app/src/.vuepress/dist/ /usr/share/nginx/html