#!/bin/bash

# Скрипт для запуска dev-серверов fitness-api и fitness-client

# Получаем директорию, где находится скрипт
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# PID файлы для отслеживания процессов
RAILS_PID=""
NPM_PID=""

# Функция для корректного завершения всех процессов
cleanup() {
    echo ""
    echo "🛑 Останавливаем серверы..."

    if [ -n "$RAILS_PID" ] && kill -0 "$RAILS_PID" 2>/dev/null; then
        kill "$RAILS_PID" 2>/dev/null
        wait "$RAILS_PID" 2>/dev/null
    fi

    if [ -n "$NPM_PID" ] && kill -0 "$NPM_PID" 2>/dev/null; then
        kill "$NPM_PID" 2>/dev/null
        wait "$NPM_PID" 2>/dev/null
    fi

    echo "✅ Все серверы остановлены"
    exit 0
}

# Ловим сигналы для корректного завершения
trap cleanup SIGINT SIGTERM

echo "🚀 Запускаем dev-серверы..."
echo ""

# Запускаем Rails сервер (Solid Queue внутри Puma)
echo "📦 Запускаем Rails API (fitness-api)..."
cd "$SCRIPT_DIR/fitness-api" && SOLID_QUEUE_IN_PUMA="${SOLID_QUEUE_IN_PUMA:-true}" bin/rails s &
RAILS_PID=$!

# Небольшая пауза перед запуском второго сервера
sleep 2

# Запускаем Vite dev сервер
echo "⚛️  Запускаем Vite (fitness-client)..."
cd "$SCRIPT_DIR/fitness-client" && npm run dev &
NPM_PID=$!

echo ""
echo "✅ Серверы запущены!"
echo "   Rails API:      http://localhost:3000"
echo "   Vite Client:    http://localhost:5173"
echo ""
echo "Нажмите Ctrl+C для остановки всех серверов"

# Ждем завершения любого из процессов
wait



