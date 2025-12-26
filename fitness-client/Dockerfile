# Dockerfile для локальной разработки fitness-client
FROM node:20-alpine

WORKDIR /app

# Копируем package файлы для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальные файлы
COPY . .

# Открываем порт для Vite dev server
EXPOSE 5173

# Запускаем dev сервер
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
