import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

export const authLimiter = rateLimit({
  skip: () => isTest, // Вимикаємо в тестах
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    error: 'Too many attempts, please try again after 15 minutes',
  },
  standardHeaders: true, // Returns RateLimit-* headers
  legacyHeaders: false,
});

// General limit for API
export const apiLimiter = rateLimit({
  skip: () => isTest, // Вимикаємо в тестах
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: {
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});