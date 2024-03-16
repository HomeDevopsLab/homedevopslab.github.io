FROM node:20.11.1-alpine3.19 as build

WORKDIR /app
COPY doc/ /app/

RUN npm install && npm run docs:build --dest public
RUN ls -la .
RUN pwd

FROM nginx:latest
COPY --from=build /app/public /usr/share/nginx/html