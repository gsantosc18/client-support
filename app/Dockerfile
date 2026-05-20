FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Em dev, rodar o servidor de desenvolvimento
CMD ["npm", "run", "dev"]
