FROM node:lts-alpine
WORKDIR /usr/src/app/Back
COPY package*.json ./
RUN npm install
COPY . .
RUN apk update && apk add curl
EXPOSE 3000
CMD ["npm", "start"]