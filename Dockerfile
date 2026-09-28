FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# API adresi derleme anında koda gömülür. Railway'de API_URL servis
# değişkeni olarak verilir; verilmezse environment.prod.ts'deki değer kalır.
ARG API_URL
RUN if [ -n "$API_URL" ]; then \
      sed -i "s#apiUrl: '.*'#apiUrl: '${API_URL}'#" src/environments/environment.prod.ts; \
    fi \
 && npx ng build --configuration production

FROM nginx:1.27-alpine
ENV PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/gunes-lenovo/browser /usr/share/nginx/html
