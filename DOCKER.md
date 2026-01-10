# Docker инструкция для Ferman AI Frontend

## Быстрый старт

### Вариант 1: Docker Compose (рекомендуется)

```bash
# Сборка и запуск
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f
```

### Вариант 2: Docker напрямую

```bash
# Сборка образа
docker build -t ferman-ai-frontend .

# Запуск контейнера
docker run -d \
  --name ferman-ai-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://закупки.ферман.рф \
  ferman-ai-frontend

# Просмотр логов
docker logs -f ferman-ai-frontend

# Остановка контейнера
docker stop ferman-ai-frontend

# Удаление контейнера
docker rm ferman-ai-frontend
```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
NEXT_PUBLIC_API_URL=https://закупки.ферман.рф
```

## Проверка работы

После запуска приложение будет доступно по адресу:
- http://localhost:3000

## Полезные команды

```bash
# Пересборка образа с нуля
docker-compose build --no-cache

# Запуск с пересборкой
docker-compose up -d --build

# Просмотр использования ресурсов
docker stats ferman-ai-frontend

# Вход в контейнер
docker exec -it ferman-ai-frontend sh
```

## Продакшн деплой

### На сервере:

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd ferman-ai-frontend

# 2. Создать .env файл
echo "NEXT_PUBLIC_API_URL=https://закупки.ферман.рф" > .env

# 3. Запустить
docker-compose up -d

# 4. Настроить nginx reverse proxy (опционально)
```

### С nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Оптимизация образа

Текущий Dockerfile использует:
- Multi-stage сборку для минимизации размера
- Alpine Linux для уменьшения размера базового образа
- Standalone режим Next.js для уменьшения зависимостей
- Непривилегированный пользователь для безопасности

Размер итогового образа: ~150-200 MB

## Troubleshooting

### Проблема: Приложение не запускается

```bash
# Проверить логи
docker-compose logs ferman-frontend

# Проверить что порт не занят
netstat -tlnp | grep 3000
```

### Проблема: Ошибки сборки

```bash
# Очистить кеш Docker
docker system prune -a

# Пересобрать без кеша
docker-compose build --no-cache
```

### Проблема: API недоступен

Проверьте что переменная `NEXT_PUBLIC_API_URL` установлена корректно в `.env` файле.
