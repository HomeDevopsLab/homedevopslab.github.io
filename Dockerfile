FROM node:20.11.1-alpine3.19 as build

WORKDIR /app
COPY doc/ /app/

RUN mkdir /app/public && \
  npm install && \
  npm run docs:build --dest /app/public

RUN ls -la /app/public

FROM nginx:latest
COPY --from=build /app/public /usr/share/nginx/html