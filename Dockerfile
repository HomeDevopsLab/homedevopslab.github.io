FROM node:26.0.0-alpine as build

WORKDIR /app
COPY doc/ /app/

RUN npm install && \
  npm run docs:build

FROM nginx:latest
COPY --from=build /app/src/.vuepress/dist/ /usr/share/nginx/html