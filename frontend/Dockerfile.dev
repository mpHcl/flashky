FROM node:24-slim
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV WATCHPACK_POLLING_INTERVAL=1000

EXPOSE 3000
CMD ["npm", "run", "dev", "--turbo=false"]