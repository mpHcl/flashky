FROM node:24-slim

WORKDIR /app

COPY frontend/package*.json ./
COPY frontend/postcss.config.mjs ./
COPY frontend/tsconfig.json ./
COPY frontend/next*.ts ./
COPY frontend/eslint*.json ./

RUN npm install

COPY frontend/src /app/src

ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

CMD ["npm", "run", "dev"]