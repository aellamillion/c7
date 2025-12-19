# referent

Минимальное приложение на Next.js

## Установка

Установите зависимости:

```powershell
npm install
```

## Запуск

Запустите сервер разработки:

```powershell
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Другие команды

- `npm run build` - сборка для продакшена
- `npm start` - запуск продакшен сервера
- `npm run lint` - проверка кода линтером

## Деплой на Vercel

Проект готов к деплою на Vercel. Есть несколько способов:

### Способ 1: Через веб-интерфейс Vercel

1. Загрузите проект в GitHub, GitLab или Bitbucket
2. Перейдите на [vercel.com](https://vercel.com)
3. Войдите в аккаунт и нажмите "New Project"
4. Импортируйте репозиторий
5. Vercel автоматически определит Next.js и настроит проект
6. Нажмите "Deploy"

### Способ 2: Через Vercel CLI

1. Установите Vercel CLI:
```powershell
npm install -g vercel
```

2. Войдите в аккаунт:
```powershell
vercel login
```

3. Задеплойте проект:
```powershell
vercel
```

4. Для продакшен деплоя:
```powershell
vercel --prod
```

### Важные файлы для Vercel

- `package.json` - содержит скрипты сборки
- `vercel.json` - конфигурация Vercel (опционально)
- `.gitignore` - исключает ненужные файлы из деплоя

Vercel автоматически определит Next.js проект и выполнит `npm run build` при деплое.
