FROM node:20.8

WORKDIR /app

COPY . .

RUN npm install

COPY .env.prod .env

EXPOSE 3000

CMD ["npm", "start"]
