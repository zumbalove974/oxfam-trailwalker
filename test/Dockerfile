# build stage
FROM node:lts-alpine
WORKDIR /usr/src/test
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "test" ]