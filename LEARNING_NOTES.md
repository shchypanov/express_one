# Learning Notes - Express API Project

This document tracks the concepts and patterns learned while building this Express.js API.

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Database & ORM](#database--orm)
3. [Authentication](#authentication)
4. [Middleware](#middleware)
5. [Validation](#validation)
6. [Error Handling](#error-handling)
7. [API Documentation](#api-documentation)
8. [Testing](#testing)

---

## Project Setup

### Docker & Docker Compose

- **Multi-stage Dockerfile**: Separate `builder` and `production` stages for smaller images
- **Docker Compose profiles**: Use `--profile dev` and `--profile prod` to control which services start
- **Volume mounts**: Sync local files with container for hot-reload in development
- **Service dependencies**: `depends_on` ensures database starts before API

### TypeScript Configuration

- **`rootDir`**: Set to `.` to allow imports from outside `src/` (e.g., `generated/`)
- **`outDir`**: Compiled files go to `dist/`
- **`skipLibCheck`**: Speeds up compilation by skipping type checking of `.d.ts` files

---

## Database & ORM

### Prisma 7.x

- **Schema definition**: Models defined in `prisma/schema.prisma`
- **Migrations**: `npx prisma migrate dev` creates and applies migrations
- **Client generation**: `npx prisma generate` creates type-safe client
- **Adapter pattern**: Prisma 7 uses `PrismaPg` adapter for PostgreSQL connection

### Key Prisma Concepts

```typescript
// Singleton pattern for Prisma Client
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
```

### Prisma Relations

```prisma
model User {
  id            Int            @id @default(autoincrement())
  refreshTokens RefreshToken[]  // One-to-many relation
}

model RefreshToken {
  userId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Authentication

### JWT (JSON Web Tokens)

- **Access Token**: Short-lived (15 min), sent in `Authorization: Bearer <token>` header
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie and database
- **Token flow**:
  1. User signs up/in → receives access token + refresh token (in cookie)
  2. Access token expires → call `/auth/refresh` → get new access token
  3. User signs out → refresh token deleted from DB and cookie cleared

### Password Hashing with bcrypt

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Hash password before storing
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// Compare password on login
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### Token Generation & Verification

```typescript
import jwt from 'jsonwebtoken';

// Generate token
const token = jwt.sign({ userId }, secret, { expiresIn: 900 });

// Verify token - returns payload or throws
const payload = jwt.verify(token, secret) as TokenPayload;
```

### Type Assertion for JWT

`jwt.verify()` returns `string | JwtPayload`. Use type assertion to get your custom type:

```typescript
interface TokenPayload { userId: number; }
return jwt.verify(token, secret) as TokenPayload;
```

---

## Middleware

### Middleware Order Matters!

```typescript
// 1. Security & parsing middleware FIRST
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// 2. Routes
app.use('/auth', authRoutes);
app.use(userRoutes);

// 3. 404 handler AFTER routes
app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

// 4. Error handler LAST
app.use(errorHandler);
```

### Auth Middleware Pattern

```typescript
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.userId = decoded.userId;  // Attach to request
  next();
}
```

### Extending Express Request Type

```typescript
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
```

---

## Validation

### Zod - Runtime Validation

- **Schema definition**: Describe data shape with types and constraints
- **Type inference**: `z.infer<typeof schema>` generates TypeScript types
- **Runtime validation**: `schema.parse(data)` throws `ZodError` if invalid

```typescript
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
```

### Validation Middleware

```typescript
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(BadRequest('Validation failed'));
      }
      next(error);
    }
  };
}
```

### Zod v4 Note

In Zod v4, use `error.issues` instead of `error.errors`:

```typescript
// v3: error.errors
// v4: error.issues ✅
```

---

## Error Handling

### Global Error Handler Pattern

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Helper functions
export const BadRequest = (msg: string) => new AppError(400, msg);
export const Unauthorized = (msg: string) => new AppError(401, msg);
export const NotFound = (msg: string) => new AppError(404, msg);
export const Conflict = (msg: string) => new AppError(409, msg);
```

### Error Handler Middleware

```typescript
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  console.error('Error:', err);
  return res.status(500).json({ error: 'Internal Server Error' });
}
```

### asyncHandler for Async Routes

Wraps async route handlers to catch errors and pass to global handler:

```typescript
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
router.post('/signup', asyncHandler(signup));
```

### Sync vs Async Error Handling

| Type | How to pass error |
|------|------------------|
| Sync middleware | `next(error)` or `return next(error)` |
| Async with asyncHandler | `throw error` |

---

## API Documentation

### Swagger / OpenAPI with swagger-jsdoc

1. **Configure swagger options** in `src/config/swagger.ts`
2. **Add JSDoc annotations** above routes
3. **Serve UI** with `swagger-ui-express`

```typescript
// swagger.ts
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3001' }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

// index.ts
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### JSDoc Annotation Example

```typescript
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
```

### Reusable Schema Components

Define once, use everywhere with `$ref`:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 */
```

---

## Testing

### Vitest + Supertest

- **Vitest**: Fast test runner with native TypeScript support
- **Supertest**: HTTP assertions for Express apps

### Test File Structure

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Auth Routes', () => {
  describe('POST /auth/signup', () => {
    it('should return 422 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({ password: 'pass123', name: 'Test' });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### App Separation for Testing

Split `index.ts` into:
- `app.ts` - Express app configuration (exportable for tests)
- `index.ts` - Server startup only

```typescript
// app.ts
const app = express();
// ... middleware and routes
export default app;

// index.ts
import app from './app';
app.listen(PORT);
```

### Test Types

| Type | What it tests | Database needed |
|------|---------------|-----------------|
| Unit | Single functions | No |
| Integration | API endpoints | Yes |
| E2E | Full user flows | Yes |

### HTTP Status Codes in Tests

- **422** Unprocessable Entity: Valid JSON, invalid data (Zod validation)
- **400** Bad Request: Invalid request syntax
- **401** Unauthorized: Missing or invalid auth
- **404** Not Found: Route doesn't exist

---

## Key Learnings

1. **Imports**: `import { X }` for named exports, `import X` for default exports
2. **Type safety**: Always define interfaces for request bodies
3. **Middleware order**: Security → Parsing → Routes → 404 → Error handler
4. **Error handling**: Use global error handler, not try-catch in every controller
5. **Testing**: Separate app from server for testability
6. **Documentation**: Keep Swagger in sync with actual behavior

---

*Last updated: December 2024*
