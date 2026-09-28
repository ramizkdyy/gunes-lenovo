FROM node:24-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:24-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# Görseller buraya yazılır; Railway'de bu yola Volume bağlanır.
RUN mkdir -p uploads/cache
EXPOSE 3000
# Şema değişikliği veri kaybettirecekse db push hata verip durur, sessizce silmez.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main.js"]
