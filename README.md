# Express API

A lightweight Express.js API with Docker support.

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

### Docker (Production)

```bash
docker compose up --build
```

### Docker (Development with hot reload)

```bash
docker compose --profile dev up api-dev --build
```

## Endpoints

| Method | Path      | Description          |
|--------|-----------|----------------------|
| GET    | /health   | Health check         |
| GET    | /api      | API welcome message  |

## Environment Variables

| Variable   | Default     | Description       |
|------------|-------------|-------------------|
| PORT       | 3000        | Server port       |
| NODE_ENV   | development | Environment mode  |

