# build stage
FROM node:lts-alpine
WORKDIR /usr/src/test
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install --save-dev istanbul
RUN npm run test --coverage
RUN istanbul report --root coverage lcov
CMD [ "npm", "start" ]