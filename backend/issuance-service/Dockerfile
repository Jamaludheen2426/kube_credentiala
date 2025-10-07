FROM node:20-slim AS base
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 3001
CMD ["node", "dist/index.js"]
