# Express API

Express.js API with Docker and automatic deployment to Google Cloud Run.

**🇺🇦 [Українська версія нижче](#-express-api-ua)**

---

## 🚀 Quick Start

### Local Development (with Docker)

```bash
# Start dev server with hot reload
npm run docker:dev

# Stop
Ctrl + C
# or
npm run docker:down
```

### Local Development (without Docker)

```bash
npm install
npm run dev
```

**API available at:** http://localhost:3000

---

## 📡 API Endpoints

| Method | Path    | Description    |
|--------|---------|----------------|
| GET    | /health | Health check   |
| GET    | /api    | Welcome message|

---

## 📜 NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:dev` | Start dev server with hot reload (Docker) |
| `npm run docker:down` | Stop all containers |
| `npm run docker:shell` | Enter Docker container shell |
| `npm run dev` | Start dev server locally (no Docker) |
| `npm run build` | Build TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

---

## 🐚 Docker Shell Commands

Enter the container first:
```bash
npm run docker:shell
```

Then run commands inside:

| Command | Description |
|---------|-------------|
| `npx prisma migrate dev --name <name>` | Create and apply new migration |
| `npx prisma migrate deploy` | Apply pending migrations |
| `npx prisma migrate reset` | Reset database (⚠️ deletes data) |
| `npx prisma generate` | Regenerate Prisma Client |
| `npx prisma studio` | Open database GUI (port 5555) |
| `npx prisma db push` | Push schema without migration |
| `npx prisma db pull` | Pull schema from database |

**Exit shell:** `exit` or `Ctrl+D`

---

## 🚢 Deployment

### How to Deploy

1. Open **[GitHub Actions](https://github.com/shchypanov/express_one/actions)**
2. Select **"Deploy to Cloud Run"**
3. Click **"Run workflow"**
4. Choose environment: `staging` or `production`
5. Click **"Run workflow"**

### Environments

| Environment | Description | When to use |
|-------------|-------------|-------------|
| **staging** | Test server | Testing, frontend development |
| **production** | Production | Real users |

---

## 🔗 Useful Links

### GitHub
- **Repository:** https://github.com/shchypanov/express_one
- **Actions (deploy):** https://github.com/shchypanov/express_one/actions
- **Settings → Secrets:** https://github.com/shchypanov/express_one/settings/secrets/actions

### Google Cloud
- **Cloud Run Console:** https://console.cloud.google.com/run
- **Container Registry:** https://console.cloud.google.com/gcr
- **Logs:** https://console.cloud.google.com/logs

---

## ⚙️ Setup (one-time)

### 1. Google Cloud CLI

```bash
# Install
brew install google-cloud-sdk

# Login
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Services

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Create Service Account

```bash
PROJECT_ID=$(gcloud config get-value project)

# Create account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

# Download key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

### 4. Add GitHub Secrets

1. Open https://github.com/shchypanov/express_one/settings/secrets/actions
2. Add:
   - `GCP_PROJECT_ID` — your project ID
   - `GCP_SA_KEY` — contents of `key.json` file

### 5. Delete the key

```bash
rm key.json
```

---

## 💰 Cost

| Service | Staging | Production |
|---------|---------|------------|
| Cloud Run | $0-5/mo | $5-20/mo |
| Container Registry | ~$0.10/mo | ~$0.10/mo |

**Why cheap?** Cloud Run scales to 0 when there's no traffic.

---

## 🌍 Environment Variables

| Variable | Default     | Description     |
|----------|-------------|-----------------|
| PORT     | 3000        | Server port     |
| NODE_ENV | development | Environment     |

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions for deployment
├── src/
│   └── index.js            # Express server
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── package.json            # Dependencies
└── README.md               # You are here!
```

---
---

# 🇺🇦 Express API (UA)

Express.js API з Docker та автоматичним деплоєм на Google Cloud Run.

---

## 🚀 Швидкий старт

### Локальна розробка (з Docker)

```bash
# Запустити dev сервер з hot reload
npm run docker:dev

# Зупинити
Ctrl + C
# або
npm run docker:down
```

### Локальна розробка (без Docker)

```bash
npm install
npm run dev
```

**API доступний на:** http://localhost:3000

---

## 📡 API Endpoints

| Метод | Шлях    | Опис                |
|-------|---------|---------------------|
| GET   | /health | Перевірка здоров'я  |
| GET   | /api    | Welcome message     |

---

## 📜 NPM Скрипти

| Скрипт | Опис |
|--------|------|
| `npm run docker:dev` | Запустити dev сервер з hot reload (Docker) |
| `npm run docker:down` | Зупинити всі контейнери |
| `npm run docker:shell` | Зайти в shell контейнера |
| `npm run dev` | Запустити dev сервер локально (без Docker) |
| `npm run build` | Збілдити TypeScript в JavaScript |
| `npm run start` | Запустити production сервер |
| `npm test` | Запустити тести в watch режимі |
| `npm run test:run` | Запустити тести один раз |

---

## 🐚 Команди в Docker Shell

Спочатку зайди в контейнер:
```bash
npm run docker:shell
```

Потім виконуй команди всередині:

| Команда | Опис |
|---------|------|
| `npx prisma migrate dev --name <name>` | Створити і застосувати нову міграцію |
| `npx prisma migrate deploy` | Застосувати pending міграції |
| `npx prisma migrate reset` | Скинути базу (⚠️ видаляє дані) |
| `npx prisma generate` | Перегенерувати Prisma Client |
| `npx prisma studio` | Відкрити GUI для бази (порт 5555) |
| `npx prisma db push` | Push схеми без міграції |
| `npx prisma db pull` | Витягнути схему з бази |

**Вийти з shell:** `exit` або `Ctrl+D`

---

## 🚢 Деплой

### Як задеплоїти

1. Відкрий **[GitHub Actions](https://github.com/shchypanov/express_one/actions)**
2. Вибери **"Deploy to Cloud Run"**
3. Клікни **"Run workflow"**
4. Вибери середовище: `staging` або `production`
5. Клікни **"Run workflow"**

### Середовища

| Середовище | Опис | Коли використовувати |
|------------|------|----------------------|
| **staging** | Тестовий сервер | Тестування, розробка з фронтендом |
| **production** | Продакшен | Реальні користувачі |

---

## 🔗 Корисні посилання

### GitHub
- **Репозиторій:** https://github.com/shchypanov/express_one
- **Actions (деплой):** https://github.com/shchypanov/express_one/actions
- **Settings → Secrets:** https://github.com/shchypanov/express_one/settings/secrets/actions

### Google Cloud
- **Cloud Run Console:** https://console.cloud.google.com/run
- **Container Registry:** https://console.cloud.google.com/gcr
- **Logs:** https://console.cloud.google.com/logs

---

## ⚙️ Налаштування (one-time setup)

### 1. Google Cloud CLI

```bash
# Встановити
brew install google-cloud-sdk

# Логін
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Увімкнути сервіси

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Створити Service Account

```bash
PROJECT_ID=$(gcloud config get-value project)

# Створити акаунт
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Дати права
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

# Завантажити ключ
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

### 4. Додати секрети в GitHub

1. Відкрий https://github.com/shchypanov/express_one/settings/secrets/actions
2. Додай:
   - `GCP_PROJECT_ID` — твій project ID
   - `GCP_SA_KEY` — вміст файлу `key.json`

### 5. Видалити ключ

```bash
rm key.json
```

---

## 💰 Вартість

| Сервіс | Staging | Production |
|--------|---------|------------|
| Cloud Run | $0-5/міс | $5-20/міс |
| Container Registry | ~$0.10/міс | ~$0.10/міс |

**Чому дешево?** Cloud Run масштабується до 0 коли немає трафіку.

---

## 🌍 Environment Variables

| Змінна   | Default     | Опис             |
|----------|-------------|------------------|
| PORT     | 3000        | Порт сервера     |
| NODE_ENV | development | Середовище       |

---

## 📁 Структура проєкту

```
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions для деплою
├── src/
│   └── index.js            # Express сервер
├── docker-compose.yml      # Docker оркестрація
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── package.json            # Залежності
└── README.md               # Ти тут!
```
