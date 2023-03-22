# build stage
FROM node:lts-alpine as build-stage
WORKDIR /usr/src/app/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run test
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /usr/src/app/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]