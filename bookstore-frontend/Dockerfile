# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/bookstore-frontend/browser /usr/share/nginx/html
RUN nginx -t

EXPOSE 80
