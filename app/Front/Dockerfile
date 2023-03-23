# build stage
FROM node:lts-alpine as build-stage
WORKDIR /usr/src/app/Front
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run test
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /usr/src/app/Front/dist /usr/share/nginx/html
RUN apk update && apk add curl
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]