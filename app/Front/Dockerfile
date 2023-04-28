FROM node:lts-alpine
WORKDIR /usr/src/app/Front
COPY package*.json ./
RUN npm install
COPY . .
RUN apk update && apk add curl
EXPOSE 80
CMD [ "npm", "run", "serve"]