FROM node:20.11.1-alpine3.19 as build

WORKDIR /app
COPY doc/ /app/

RUN npm install && \
  npm run docs:build

FROM nginx:latest
COPY --from=build /app/src/.vuepress/dist/ /usr/share/nginx/html