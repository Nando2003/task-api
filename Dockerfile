FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN pwd
RUN ls -la

RUN npm run build

RUN ls -la
RUN ls -R build

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3333

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]