# build stage
FROM node:lts-alpine as build-stage
WORKDIR /usr/src/app/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /usr/src/app/app/dist /usr/share/nginx/html
RUN curl -sL https://deb.nodesource.com/setup_12.x | sudo -E /bin/bash -
RUN sudo apt install nodejs
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]