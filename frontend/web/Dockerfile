# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_ISSUANCE_API_URL
ARG VITE_VERIFICATION_API_URL
ENV VITE_ISSUANCE_API_URL=$VITE_ISSUANCE_API_URL
ENV VITE_VERIFICATION_API_URL=$VITE_VERIFICATION_API_URL
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
