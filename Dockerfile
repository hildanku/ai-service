FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY . .
RUN npm run build

#  production
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3008

CMD ["node", "dist/main.js"]
