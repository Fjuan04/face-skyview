FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Copiamos el ejemplo como base del entorno para Vite
RUN if [ -f .env.example ] && [ ! -f .env ]; then cp .env.example .env; fi

EXPOSE 5173

CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]

