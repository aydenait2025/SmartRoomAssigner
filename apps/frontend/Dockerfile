FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./

RUN npm install

COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npm", "start"]
