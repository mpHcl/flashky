FROM node:24-slim
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

ENV NODE_ENV=production
RUN npm run build 

EXPOSE 3000
CMD ["npm", "run", "start"]
