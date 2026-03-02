FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN DATABASE_URL="postgresql://dummy:dummy@localhost/dummy" npx prisma generate

COPY . .

EXPOSE 5000

# Start script to run migrations then start server
CMD npm run start:migrate || (npx prisma migrate deploy && node server.js)
