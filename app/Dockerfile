# build stage
FROM node:lts-alpine as build-stage
WORKDIR /usr/src/app/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run serve